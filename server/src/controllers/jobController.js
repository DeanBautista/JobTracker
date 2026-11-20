const jobModel = require('../models/jobModel');
const { validateCreateJob, parseListQuery, parseIds, MAX_BULK } = require('../validators/jobValidator');
const { jobsToCsv } = require('../utils/jobsCsv');

// GET /jobs?view=trash -> { jobs }
const listJobs = async (req, res) => {
  if (req.query.view === 'board') {
    return res.json({ jobs: await jobModel.listBoard(req.userId) });
  }
  if (req.query.view === 'trash') {
    return res.json({ jobs: await jobModel.listTrash(req.userId) });
  }
  const result = await jobModel.list(req.userId, parseListQuery(req.query));
  res.json(result);
};

// One job: /jobs/:id/<action>
const single = (action) => async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(422).json({ errors: { id: 'Invalid job id' } });
  }
  const done = await jobModel[action](req.userId, [id]);
  if (done.length === 0) return res.status(404).json({ error: 'Job not found' });
  res.json({ id });
};

// Many jobs: POST /jobs/bulk/<action>  { ids }  ->  { affected, ids }
const bulk = (action) => async (req, res) => {
  const ids = parseIds(req.body?.ids);
  if (!ids) return res.status(422).json({ errors: { ids: `Send 1 to ${MAX_BULK} job ids` } });
  const done = await jobModel[action](req.userId, ids);
  res.json({ affected: done.length, ids: done });
};

// POST /jobs
const createJob = async (req, res) => {
  const { errors, values } = validateCreateJob(req.body || {});
  if (Object.keys(errors).length > 0) return res.status(422).json({ errors });

  if (values.link && !req.body.confirmDuplicate) {
    const duplicate = await jobModel.findDuplicate(req.userId, values.link);
    if (duplicate) return res.status(409).json({ duplicate });
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
    return res.status(422).json({ errors: { move: 'Invalid move' } });
  }

  const result = await jobModel.move(req.userId, id, { stage, position, closedReason, closingNote });
  if (!result) return res.status(404).json({ error: 'Job not found' });
  res.json(result);
};

// POST /jobs/bulk/move  { ids, stage, closedReason?, closingNote? }
const moveJobs = async (req, res) => {
  const ids = parseIds(req.body?.ids);
  const { stage, closedReason, closingNote } = req.body || {};

  const badReason = closedReason != null && !jobModel.CLOSE_REASONS.includes(closedReason);
  const badNote = closingNote != null && (typeof closingNote !== 'string' || closingNote.length > 1000);

  if (!ids || !jobModel.STAGES.includes(stage) || badReason || badNote) {
    return res.status(422).json({ errors: { move: 'Invalid move' } });
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
  if (!ids) return res.status(422).json({ errors: { ids: `Send 1 to ${MAX_BULK} job ids` } });

  const rows = await jobModel.listForExport(req.userId, ids);
  if (rows.length === 0) return res.status(404).json({ error: 'No jobs found' });
  sendCsv(res, rows);
};

// GET /jobs/export?<same filters and sort as the list>  ->  CSV of every match
const exportFilteredJobs = async (req, res) => {
  const rows = await jobModel.listFilteredForExport(req.userId, parseListQuery(req.query));
  if (rows.length === 0) return res.status(404).json({ error: 'No jobs found' });
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
  exportFilteredJobs
};