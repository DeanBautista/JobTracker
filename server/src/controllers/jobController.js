const jobModel = require('../models/jobModel');
const { validateCreateJob, parseListQuery } = require('../validators/jobValidator');

// GET /jobs            -> paginated list page, { jobs, total }
// GET /jobs?view=board -> every board job, { jobs }
const listJobs = async (req, res) => {
  if (req.query.view === 'board') {
    return res.json({ jobs: await jobModel.listBoard(req.userId) });
  }
  const result = await jobModel.list(req.userId, parseListQuery(req.query));
  res.json(result);
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

// PATCH /jobs/:id/move  { stage, position }
const moveJob = async (req, res) => {
  const id = Number(req.params.id);
  const { stage, position } = req.body || {};

  if (!Number.isInteger(id) || !jobModel.STAGES.includes(stage) || !Number.isFinite(position) || Math.abs(position) > 1e12) {
    return res.status(422).json({ errors: { move: 'Invalid stage or position' } });
  }

  const result = await jobModel.move(req.userId, id, { stage, position });
  if (!result) return res.status(404).json({ error: 'Job not found' });
  res.json(result);
};

module.exports = { createJob, listJobs, moveJob };