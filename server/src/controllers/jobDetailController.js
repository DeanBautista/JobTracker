const m = require('../models/jobDetailModel');
const AppError = require('../utils/AppError');
const { validateUpdateJob } = require('../validators/jobDetailValidator');

const NOTE_TEXT_MSG = 'Enter a note up to 5000 characters';

const jobNotFound = () => AppError.notFound('job_not_found', 'Job not found');
const noteNotFound = () => AppError.notFound('note_not_found', 'Note not found');
const nothingToUpdate = () =>
  AppError.validation('nothing_to_update', 'Nothing to update', { body: 'Nothing to update' });

const parseId = (req) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw AppError.validation('invalid_id', 'Invalid job id', { id: 'Invalid job id' });
  }
  return id;
};

const parseNoteId = (req) => {
  const noteId = Number(req.params.noteId);
  if (!Number.isInteger(noteId) || noteId < 1) {
    throw AppError.validation('invalid_note_id', 'Invalid note id', { noteId: 'Invalid note id' });
  }
  return noteId;
};

const getJob = async (req, res) => {
  const job = await m.getOverview(req.userId, parseId(req));
  if (!job) throw jobNotFound();
  res.json(job);
};

// Lazy tab: GET /jobs/:id/<tab>
const tab = (key, load) => async (req, res) => {
  const id = parseId(req);
  if (!(await m.owns(req.userId, id))) throw jobNotFound();
  res.json({ [key]: await load(req.userId, id) });
};

const getDocuments = async (req, res) => {
  const id = parseId(req);
  if (!(await m.owns(req.userId, id))) throw jobNotFound();
  res.json(await m.getDocuments(req.userId, id)); // { documents, library }
};

const updateJob = async (req, res) => {
  const id = parseId(req);
  const { errors, values } = validateUpdateJob(req.body || {});
  if (Object.keys(errors).length > 0) {
    throw AppError.validation('validation_failed', 'Some fields are invalid', errors);
  }
  if (Object.keys(values).length === 0) throw nothingToUpdate();

  const r = await m.update(req.userId, id, values);
  if (r.notFound) throw jobNotFound();
  if (r.errors) throw AppError.validation('validation_failed', 'Some fields are invalid', r.errors);
  res.json(r.job);
};

const createNote = async (req, res) => {
  const id = parseId(req);
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text || text.length > 5000) {
    throw AppError.validation('invalid_note', NOTE_TEXT_MSG, { text: NOTE_TEXT_MSG });
  }

  const note = await m.createNote(req.userId, id, text);
  if (!note) throw jobNotFound();
  res.status(201).json(note);
};

const updateNote = async (req, res) => {
  const id = parseId(req);
  const noteId = parseNoteId(req);

  const { text, pinned } = req.body || {};
  const patch = {};
  if (text !== undefined) {
    const t = typeof text === 'string' ? text.trim() : '';
    if (!t || t.length > 5000) {
      throw AppError.validation('invalid_note', NOTE_TEXT_MSG, { text: NOTE_TEXT_MSG });
    }
    patch.text = t;
  }
  if (pinned !== undefined) {
    if (typeof pinned !== 'boolean') {
      throw AppError.validation('invalid_pinned', 'Must be true or false', { pinned: 'Must be true or false' });
    }
    patch.pinned = pinned;
  }
  if (Object.keys(patch).length === 0) throw nothingToUpdate();

  const note = await m.updateNote(req.userId, id, noteId, patch);
  if (!note) throw noteNotFound();
  res.json(note);
};

const deleteNote = async (req, res) => {
  const id = parseId(req);
  const noteId = parseNoteId(req);
  if (!(await m.deleteNote(req.userId, id, noteId))) throw noteNotFound();
  res.json({ id: noteId });
};

module.exports = {
  getJob,
  getNotes: tab('notes', (u, id) => m.getNotes(id)),
  getDocuments,
  getInterviews: tab('interviews', (u, id) => m.getInterviews(id)),
  getReminders: tab('reminders', m.getReminders),
  getTimeline: tab('timeline', m.getTimeline),
  updateJob,
  createNote,
  updateNote,
  deleteNote,
};