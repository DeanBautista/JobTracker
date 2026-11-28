const m = require('../models/jobDetailModel');
const AppError = require('../utils/AppError');
const { validateUpdateJob } = require('../validators/jobDetailValidator');
const { validateInterview, validateResult } = require('../validators/interviewValidator');
const { validateReminder } = require('../validators/reminderValidator');

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

const interviewNotFound = () => AppError.notFound('interview_not_found', 'Interview not found');

const parseInterviewId = (req) => {
  const n = Number(req.params.interviewId);
  if (!Number.isInteger(n) || n < 1) {
    throw AppError.validation('invalid_interview_id', 'Invalid interview id', { interviewId: 'Invalid interview id' });
  }
  return n;
};

const failIfInvalid = (errors) => {
  if (Object.keys(errors).length > 0) throw AppError.validation('validation_failed', 'Some fields are invalid', errors);
};

const createInterview = async (req, res) => {
  const id = parseId(req);
  const { errors, values } = validateInterview(req.body || {});
  failIfInvalid(errors);
  const r = await m.createInterview(req.userId, id, values);
  if (!r) throw jobNotFound();
  res.status(201).json(r); // { round, remindersCount }
};

const updateInterview = async (req, res) => {
  const id = parseId(req);
  const interviewId = parseInterviewId(req);
  const { errors, values } = validateInterview(req.body || {});
  failIfInvalid(errors);
  const r = await m.updateInterview(req.userId, id, interviewId, values);
  if (!r) throw interviewNotFound();
  res.json(r);
};

const saveInterviewResult = async (req, res) => {
  const id = parseId(req);
  const interviewId = parseInterviewId(req);
  const { errors, values } = validateResult(req.body || {});
  failIfInvalid(errors);
  const r = await m.saveInterviewResult(req.userId, id, interviewId, values);
  if (!r) throw interviewNotFound();
  res.json(r);
};

const cancelInterview = async (req, res) => {
  const id = parseId(req);
  const interviewId = parseInterviewId(req);
  const r = await m.cancelInterview(req.userId, id, interviewId);
  if (!r) throw interviewNotFound();
  res.json(r);
};

const deleteInterview = async (req, res) => {
  const id = parseId(req);
  const interviewId = parseInterviewId(req);
  const r = await m.deleteInterview(req.userId, id, interviewId);
  if (!r) throw interviewNotFound();
  res.json(r); // { id, remindersCount }
};

const reminderNotFound = () => AppError.notFound('reminder_not_found', 'Reminder not found');

const parseReminderId = (req) => {
  const n = Number(req.params.reminderId);
  if (!Number.isInteger(n) || n < 1) {
    throw AppError.validation('invalid_reminder_id', 'Invalid reminder id', { reminderId: 'Invalid reminder id' });
  }
  return n;
};

const createReminder = async (req, res) => {
  const id = parseId(req);
  const { errors, values } = validateReminder(req.body || {});
  failIfInvalid(errors);
  const r = await m.createReminder(req.userId, id, values);
  if (!r) throw jobNotFound();
  res.status(201).json(r); // { reminder, remindersCount }
};

const updateReminder = async (req, res) => {
  const id = parseId(req);
  const reminderId = parseReminderId(req);
  const { errors, values } = validateReminder(req.body || {}, { partial: true });
  failIfInvalid(errors);
  if (Object.keys(values).length === 0) throw nothingToUpdate();
  const r = await m.updateReminder(req.userId, id, reminderId, values);
  if (!r) throw reminderNotFound();
  res.json(r);
};

const setReminderStatus = async (req, res) => {
  const id = parseId(req);
  const reminderId = parseReminderId(req);
  const status = req.body?.status;
  if (status !== 'done' && status !== 'pending') {
    throw AppError.validation('invalid_status', 'Must be done or pending', { status: 'Must be done or pending' });
  }
  const r = await m.setReminderStatus(req.userId, id, reminderId, status);
  if (!r) throw reminderNotFound();
  res.json(r);
};

const deleteReminder = async (req, res) => {
  const id = parseId(req);
  const reminderId = parseReminderId(req);
  const r = await m.deleteReminder(req.userId, id, reminderId);
  if (!r) throw reminderNotFound();
  res.json(r); // { id, remindersCount }
};

const snoozeReminder = async (req, res) => {
  const id = parseId(req);
  const reminderId = parseReminderId(req);
  const r = await m.snoozeReminder(req.userId, id, reminderId);
  if (!r) throw reminderNotFound();
  res.json(r);
};

module.exports = {
  getJob,
  getNotes: tab('notes', (u, id) => m.getNotes(id)),
  getDocuments,
  getInterviews: tab('interviews', (u, id) => m.getInterviews(id)),
  createInterview, updateInterview, saveInterviewResult, cancelInterview,
  getReminders: tab('reminders', m.getReminders),
  getTimeline: tab('timeline', m.getTimeline),
  updateJob,
  createNote,
  updateNote,
  deleteNote,
  deleteInterview,
  createReminder,
  updateReminder,
  setReminderStatus,
  deleteReminder,
  snoozeReminder,
  getNextUp: tab('nextUp', m.getNextUp),
};