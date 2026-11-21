const m = require('../models/jobDetailModel');
const { validateUpdateJob } = require('../validators/jobDetailValidator');

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

const updateJob = async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  const { errors, values } = validateUpdateJob(req.body || {});
  if (Object.keys(errors).length > 0) return res.status(422).json({ errors });
  if (Object.keys(values).length === 0) return res.status(422).json({ errors: { body: 'Nothing to update' } });

  const r = await m.update(req.userId, id, values);
  if (r.notFound) return res.status(404).json({ error: 'Job not found' });
  if (r.errors) return res.status(422).json({ errors: r.errors });
  res.json(r.job);
};

const createNote = async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text || text.length > 5000) return res.status(422).json({ errors: { text: 'Enter a note up to 5000 characters' } });

  const note = await m.createNote(req.userId, id, text);
  if (!note) return res.status(404).json({ error: 'Job not found' });
  res.status(201).json(note);
};

const parseNoteId = (req, res) => {
  const noteId = Number(req.params.noteId);
  if (Number.isInteger(noteId) && noteId > 0) return noteId;
  res.status(422).json({ errors: { noteId: 'Invalid note id' } });
  return null;
};

const updateNote = async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  const noteId = parseNoteId(req, res);
  if (!noteId) return;

  const { text, pinned } = req.body || {};
  const patch = {};
  if (text !== undefined) {
    const t = typeof text === 'string' ? text.trim() : '';
    if (!t || t.length > 5000) return res.status(422).json({ errors: { text: 'Enter a note up to 5000 characters' } });
    patch.text = t;
  }
  if (pinned !== undefined) {
    if (typeof pinned !== 'boolean') return res.status(422).json({ errors: { pinned: 'Must be true or false' } });
    patch.pinned = pinned;
  }
  if (Object.keys(patch).length === 0) return res.status(422).json({ errors: { body: 'Nothing to update' } });

  const note = await m.updateNote(req.userId, id, noteId, patch);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
};

const deleteNote = async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  const noteId = parseNoteId(req, res);
  if (!noteId) return;
  if (!(await m.deleteNote(req.userId, id, noteId))) return res.status(404).json({ error: 'Note not found' });
  res.json({ id: noteId });
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
  updateJob, 
  createNote,
  updateNote,
  deleteNote
};