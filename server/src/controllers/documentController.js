const documents = require('../models/documentModel');
const jobs = require('../models/jobDetailModel');
const storage = require('../utils/storage');
const { cleanupRemovedFiles } = require('../utils/fileCleanup');
const AppError = require('../utils/AppError');
const { validateDetails, toId } = require('../validators/documentValidator');

const jobNotFound = () => AppError.notFound('job_not_found', 'Job not found');
const fileNotFound = () => AppError.notFound('file_not_found', 'File not found');

const parseId = (value, field) => {
  const id = toId(value);
  if (!id) throw AppError.validation(`invalid_${field}`, 'Invalid id', { [field]: 'Invalid id' });
  return id;
};

const check = ({ errors, values }) => {
  if (Object.keys(errors).length > 0) {
    throw AppError.validation('validation_failed', 'Some fields are invalid', errors);
  }
  return values;
};

// Every change responds with the fresh { documents, library }.
const sendList = async (res, userId, jobId, status = 200) =>
  res.status(status).json(await documents.list(userId, jobId));

// For changes that can take a file off a job: finish deleting it if nothing uses it now.
const cleanAndSendList = async (res, userId, jobId, status) => {
  await cleanupRemovedFiles(userId);
  await sendList(res, userId, jobId, status);
};

const getDocuments = async (req, res) => {
  const jobId = parseId(req.params.id, 'id');
  if (!(await jobs.owns(req.userId, jobId))) throw jobNotFound();
  await sendList(res, req.userId, jobId);
};

const uploadAndAttach = async (req, res) => {
  const jobId = parseId(req.params.id, 'id');
  const { type, label, ...options } = check(validateDetails(req.body || {}));
  // Checked before uploading, so nothing is sent to Cloudinary for a job that can't take it.
  if (!(await documents.isEditable(req.userId, jobId))) throw jobNotFound();

  const { buffer, size, name, ext, mime } = req.document;
  const key = storage.newKey(ext);
  try {
    await storage.upload(key, buffer);
  } catch (err) {
    console.error(err);
    throw new AppError(502, 'upload_failed', 'The file could not be uploaded. Try again.');
  }

  try {
    const saved = await documents.createAndLink(
      req.userId, jobId,
      { type, label, original_name: name, storage_key: key, mime_type: mime, size_bytes: size },
      options,
    );
    if (!saved) throw jobNotFound();
  } catch (err) {
    // The database rolled back, so delete the file that has no row.
    await storage.remove(key).catch((e) => console.error('Orphaned Cloudinary file:', key, e));
    throw err;
  }

  await cleanAndSendList(res, req.userId, jobId, 201);
};

const attachExisting = async (req, res) => {
  const jobId = parseId(req.params.id, 'id');
  const fileId = parseId(req.body?.fileId, 'fileId');
  const { type, label, ...options } = check(validateDetails(req.body || {}));

  const result = await documents.attachExisting(req.userId, jobId, fileId, { type, label }, options);
  if (result === 'no_job') throw jobNotFound();
  if (result === 'no_file') throw fileNotFound();
  await cleanAndSendList(res, req.userId, jobId, 201);
};

const updateDocument = async (req, res) => {
  const jobId = parseId(req.params.id, 'id');
  const fileId = parseId(req.params.documentId, 'documentId');
  const { type, label, ...options } = check(validateDetails(req.body || {}));

  const result = await documents.updateLinked(req.userId, jobId, fileId, { type, label }, options);
  if (result === 'no_job') throw jobNotFound();
  if (result === 'no_file') throw fileNotFound();
  await cleanAndSendList(res, req.userId, jobId);
};

const removeDocument = async (req, res) => {
  const jobId = parseId(req.params.id, 'id');
  const fileId = parseId(req.params.documentId, 'documentId');

  const result = await documents.unlink(req.userId, jobId, fileId);
  if (result === 'no_job') throw jobNotFound();
  if (result === 'no_file') throw fileNotFound();
  await cleanAndSendList(res, req.userId, jobId);
};

// Hides the file from the library. It is only erased once no job uses it.
const deleteLibraryFile = async (req, res) => {
  const jobId = parseId(req.params.id, 'id');
  const fileId = parseId(req.params.documentId, 'documentId');
  if (!(await jobs.owns(req.userId, jobId))) throw jobNotFound();

  if (!(await documents.removeFromLibrary(req.userId, fileId))) throw fileNotFound();
  await cleanAndSendList(res, req.userId, jobId);
};

// GET .../file : streams the file after the ownership check.
const getFile = async (req, res) => {
  const jobId = parseId(req.params.id, 'id');
  const fileId = parseId(req.params.documentId, 'documentId');

  const file = await documents.findLinked(req.userId, jobId, fileId);
  if (!file) throw fileNotFound();

  let buffer;
  try {
    buffer = await storage.download(file.storageKey);
  } catch (err) {
    console.error(err);
    if (err.status === 404) throw AppError.notFound('file_unavailable', 'This file is no longer in storage.');
    throw new AppError(502, 'download_failed', 'The file could not be loaded. Try again.');
  }

  res.attachment(file.name); // sets a safe Content-Disposition filename
  res.set({
    'Content-Type': file.mimeType,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(buffer);
};

module.exports = {
  getDocuments, uploadAndAttach, attachExisting, updateDocument, removeDocument, deleteLibraryFile, getFile,
};