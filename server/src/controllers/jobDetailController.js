const m = require('../models/jobDetailModel');

const parseId = (req, res) => {
  const id = Number(req.params.id);
  if (Number.isInteger(id) && id > 0) return id;
  res.status(422).json({ errors: { id: 'Invalid job id' } });
  return null;
};

const getJob = async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  const job = await m.getOverview(req.userId, id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
};

// Lazy tab: GET /jobs/:id/<tab>
const tab = (key, load) => async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  if (!(await m.owns(req.userId, id))) return res.status(404).json({ error: 'Job not found' });
  res.json({ [key]: await load(req.userId, id) });
};

module.exports = {
  getJob,
  getNotes: tab('notes', (u, id) => m.getNotes(id)),
  getDocuments: async (req, res) => {
    const id = parseId(req, res);
    if (!id) return;
    if (!(await m.owns(req.userId, id))) return res.status(404).json({ error: 'Job not found' });
    res.json(await m.getDocuments(req.userId, id)); // { documents, library }
  },
  getInterviews: tab('interviews', (u, id) => m.getInterviews(id)),
  getReminders: tab('reminders', m.getReminders),
  getTimeline: tab('timeline', m.getTimeline),
};