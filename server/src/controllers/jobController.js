const jobModel = require('../models/jobModel');
const { validateCreateJob } = require('../validators/jobValidator');

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

module.exports = { createJob };