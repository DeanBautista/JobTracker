const jobModel = require('../models/jobModel');
const AppError = require('../utils/AppError');
const { validateCreateJob, parseListQuery, parseIds, MAX_BULK } = require('../validators/jobValidator');
const { jobsToCsv } = require('../utils/jobsCsv');

const PAGE_SIZES = [10, 25, 50];

const parsePaging = (query) => {
  const page = Number.parseInt(query.page, 10);
  const size = Number.parseInt(query.size, 10);
  return {
    page: page >= 1 ? Math.min(page, 100000) : 1,
    size: PAGE_SIZES.includes(size) ? size : 10,
  };
};

const invalidIds = () =>
  AppError.validation('invalid_ids', `Send 1 to ${MAX_BULK} job ids`, {
    ids: `Send 1 to ${MAX_BULK} job ids`,
  });

const invalidMove = () => AppError.validation('invalid_move', 'Invalid move', { move: 'Invalid move' });

const jobNotFound = () => AppError.notFound('job_not_found', 'Job not found');

// GET /jobs?view=archive|trash&page&size -> { jobs, total, counts: { archive, trash } }
const listJobs = async (req, res) => {
  const { view } = req.query;
  if (view === 'board') {
    return res.json({ jobs: await jobModel.listBoard(req.userId) });
  }
  if (view === 'archive' || view === 'trash') {
    return res.json(await jobModel.listTab(req.userId, view, parsePaging(req.query)));
  }
  const result = await jobModel.list(req.userId, parseListQuery(req.query));
  res.json(result);
};

// One job: /jobs/:id/<action>
const single = (action) => async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw AppError.validation('invalid_id', 'Invalid job id', { id: 'Invalid job id' });
  }
  const done = await jobModel[action](req.userId, [id]);
  if (done.length === 0) throw jobNotFound();
  res.json({ id });
};

// Many jobs: POST /jobs/bulk/<action>  { ids }  ->  { affected, ids }
const bulk = (action) => async (req, res) => {
  const ids = parseIds(req.body?.ids);
  if (!ids) throw invalidIds();
  const done = await jobModel[action](req.userId, ids);
  res.json({ affected: done.length, ids: done });
};

// POST /jobs
const createJob = async (req, res) => {
  const { errors, values } = validateCreateJob(req.body || {});
  if (Object.keys(errors).length > 0) {
    throw AppError.validation('validation_failed', 'Some fields are invalid', errors);
  }

  if (values.link && !req.body.confirmDuplicate) {
    const duplicate = await jobModel.findDuplicate(req.userId, values.link);
    if (duplicate) {
      throw AppError.conflict('duplicate_job', 'You already saved a job with this link', { duplicate });
    }
  }

  const job = await jobModel.create(req.userId, values);
  res.status(201).json(job);
};

// PATCH /jobs/:id/move  { stage, position, closedReason?, closingNote? }
const moveJob = async (req, res) => {
  const id = Number(req.params.id);
  const { stage, position, closedReason, closingNote } = req.body || {};

  const badReason = closedReason != null && !jobModel.CLOSE_REASONS.includes(closedReason);
  const badNote = closingNote != null && (typeof closingNote !== 'string' || closingNote.length > 1000);

  if (
    !Number.isInteger(id) ||
    !jobModel.STAGES.includes(stage) ||
    !Number.isFinite(position) ||
    Math.abs(position) > 1e12 ||
    badReason ||
    badNote
  ) {
    throw invalidMove();
  }

  const result = await jobModel.move(req.userId, id, { stage, position, closedReason, closingNote });
  if (!result) throw jobNotFound();
  res.json(result);
};

// POST /jobs/bulk/move  { ids, stage, closedReason?, closingNote? }
const moveJobs = async (req, res) => {
  const ids = parseIds(req.body?.ids);
  const { stage, closedReason, closingNote } = req.body || {};

  const badReason = closedReason != null && !jobModel.CLOSE_REASONS.includes(closedReason);
  const badNote = closingNote != null && (typeof closingNote !== 'string' || closingNote.length > 1000);

  if (!ids || !jobModel.STAGES.includes(stage) || badReason || badNote) {
    throw invalidMove();
  }

  const moved = await jobModel.moveMany(req.userId, ids, { stage, closedReason, closingNote });
  res.json({ affected: moved.length, ids: moved, stage });
};

// DELETE /jobs/trash
const emptyTrash = async (req, res) => {
  res.json({ affected: await jobModel.emptyTrash(req.userId) });
};

const sendCsv = (res, rows) => {
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="jobs-${new Date().toISOString().slice(0, 10)}.csv"`,
    'Cache-Control': 'no-store',
  });
  res.send(jobsToCsv(rows));
};

// POST /jobs/bulk/export  { ids }  ->  CSV of the selected rows
const exportJobs = async (req, res) => {
  const ids = parseIds(req.body?.ids);
  if (!ids) throw invalidIds();

  const rows = await jobModel.listForExport(req.userId, ids);
  if (rows.length === 0) throw AppError.notFound('no_jobs_found', 'No jobs found');
  sendCsv(res, rows);
};

// GET /jobs/export?<same filters and sort as the list>  ->  CSV of every match
const exportFilteredJobs = async (req, res) => {
  const rows = await jobModel.listFilteredForExport(req.userId, parseListQuery(req.query));
  if (rows.length === 0) throw AppError.notFound('no_jobs_found', 'No jobs found');
  sendCsv(res, rows);
};

module.exports = {
  createJob,
  listJobs,
  moveJob,
  moveJobs,
  emptyTrash,
  archiveJob: single('archive'),
  unarchiveJob: single('unarchive'),
  trashJob: single('trash'),
  restoreJob: single('restore'),
  deleteJobForever: single('deleteForever'),
  archiveJobs: bulk('archive'),
  unarchiveJobs: bulk('unarchive'),
  trashJobs: bulk('trash'),
  restoreJobs: bulk('restore'),
  deleteJobsForever: bulk('deleteForever'),
  exportJobs,
  exportFilteredJobs,
};