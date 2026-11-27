const request = require('supertest');
const documents = require('../models/documentModel');
const jobs = require('../models/jobDetailModel');
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');
const storage = require('../utils/storage');
const { cleanupRemovedFiles } = require('../utils/fileCleanup');
const AppError = require('../utils/AppError');
const { signAccessToken } = require('../utils/tokens');
const app = require('../app');

const USER_ID = 147;
const KEY = 'applytrack/documents/test-key.pdf';
const PDF = Buffer.from('%PDF-1.4 test');
const LIST = { documents: [], library: [] };
const DETAILS = { type: 'cover-letter', label: 'Letter v1', usedAs: 'sent-cover-letter' };

const auth = (req) => req.set('Authorization', `Bearer ${signAccessToken(USER_ID, 1)}`);

const upload = ({ fields = {}, file = PDF, name = 'resume.pdf' } = {}) => {
  const req = auth(request(app).post('/jobs/5/documents'));
  const body = { type: 'resume', label: 'Resume v1', usedAs: 'sent-resume', replace: 'false', ...fields };
  for (const [key, value] of Object.entries(body)) req.field(key, value);
  return file ? req.attach('file', file, name) : req;
};

beforeEach(() => {
  userModel.findById.mockResolvedValue({ id: USER_ID, is_demo: 0 });
  jobs.owns.mockResolvedValue(true);
  documents.list.mockResolvedValue(LIST);
  documents.isEditable.mockResolvedValue(true);
  documents.createAndLink.mockResolvedValue(true);
  documents.attachExisting.mockResolvedValue('ok');
  documents.updateLinked.mockResolvedValue('ok');
  documents.unlink.mockResolvedValue('ok');
  documents.removeFromLibrary.mockResolvedValue(true);
  storage.newKey.mockReturnValue(KEY);
  storage.upload.mockResolvedValue({});
  storage.remove.mockResolvedValue();
});

describe('document routes: access', () => {
  test.each([
    ['get', '/jobs/5/documents'],
    ['post', '/jobs/5/documents'],
    ['post', '/jobs/5/documents/attach'],
    ['get', '/jobs/5/documents/9/file'],
    ['patch', '/jobs/5/documents/9'],
    ['delete', '/jobs/5/documents/9'],
    ['delete', '/jobs/5/documents/library/9'],
  ])('%s %s returns 401 without a token', async (method, url) => {
    const res = await request(app)[method](url);

    expect(res.statusCode).toBe(401);
  });

  test.each([
    ['post', '/jobs/5/documents'],
    ['post', '/jobs/5/documents/attach'],
    ['patch', '/jobs/5/documents/9'],
    ['delete', '/jobs/5/documents/9'],
    ['delete', '/jobs/5/documents/library/9'],
  ])('blocks the demo account: %s %s', async (method, url) => {
    userModel.findById.mockResolvedValue({ id: USER_ID, is_demo: 1 });

    const res = await auth(request(app)[method](url));

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('demo_restricted');
    expect(storage.upload).not.toHaveBeenCalled();
    expect(documents.unlink).not.toHaveBeenCalled();
    expect(documents.removeFromLibrary).not.toHaveBeenCalled();
  });
});

describe('GET /jobs/:id/documents', () => {
  test('returns the documents and library', async () => {
    const res = await auth(request(app).get('/jobs/5/documents'));

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(LIST);
    expect(documents.list).toHaveBeenCalledWith(USER_ID, 5);
  });

  test("returns 404 for someone else's job", async () => {
    jobs.owns.mockResolvedValue(false);

    const res = await auth(request(app).get('/jobs/5/documents'));

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('job_not_found');
    expect(documents.list).not.toHaveBeenCalled();
  });

  test('returns 422 for an invalid job id', async () => {
    const res = await auth(request(app).get('/jobs/abc/documents'));

    expect(res.statusCode).toBe(422);
    expect(res.body.code).toBe('invalid_id');
  });
});

describe('POST /jobs/:id/documents (upload)', () => {
  test('uploads, saves with database values, and returns 201', async () => {
    const res = await upload();

    expect(res.statusCode).toBe(201);
    expect(storage.upload).toHaveBeenCalledWith(KEY, expect.any(Buffer));
    expect(documents.createAndLink).toHaveBeenCalledWith(
      USER_ID,
      5,
      {
        type: 'resume',
        label: 'Resume v1',
        original_name: 'resume.pdf',
        storage_key: KEY,
        mime_type: 'application/pdf',
        size_bytes: PDF.length,
      },
      { usedAs: 'sent_resume', replace: false, replaceFileId: null },
    );
    expect(cleanupRemovedFiles).toHaveBeenCalledWith(USER_ID);
  });

  test.each([
    ['letter.doc', Buffer.from('d0cf11e0a1b11ae1', 'hex'), 'application/msword'],
    [
      'letter.DOCX',
      Buffer.from('504b0304', 'hex'),
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  ])('accepts %s', async (name, file, mime) => {
    const res = await upload({ file, name });

    expect(res.statusCode).toBe(201);
    expect(documents.createAndLink.mock.calls[0][2].mime_type).toBe(mime);
  });

  test('accepts a file of exactly 5 MB', async () => {
    const file = Buffer.alloc(5 * 1024 * 1024);
    PDF.copy(file);

    const res = await upload({ file });

    expect(res.statusCode).toBe(201);
  });

  test.each([
    ['a file over 5 MB', { file: Buffer.alloc(5 * 1024 * 1024 + 1) }, 'file_too_large'],
    ['a wrong extension', { name: 'virus.exe' }, 'invalid_file_type'],
    ['content that does not match the extension', { file: Buffer.from('plain text') }, 'invalid_file_type'],
    ['no file', { file: null }, 'file_required'],
  ])('rejects %s', async (_title, options, code) => {
    const res = await upload(options);

    expect(res.statusCode).toBe(422);
    expect(res.body.code).toBe(code);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  test.each([
    ['type', { type: 'invoice' }],
    ['usedAs', { usedAs: 'sent_resume' }],
    ['label', { label: '   ' }],
    ['label', { label: 'x'.repeat(81) }],
  ])('rejects an invalid %s', async (field, fields) => {
    const res = await upload({ fields });

    expect(res.statusCode).toBe(422);
    expect(res.body.fields).toHaveProperty(field);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  test('does not upload when the job cannot be edited', async () => {
    documents.isEditable.mockResolvedValue(false);

    const res = await upload();

    expect(res.statusCode).toBe(404);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  test('returns 502 and saves nothing when storage fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    storage.upload.mockRejectedValue(new Error('down'));

    const res = await upload();

    expect(res.statusCode).toBe(502);
    expect(res.body.code).toBe('upload_failed');
    expect(documents.createAndLink).not.toHaveBeenCalled();
    console.error.mockRestore();
  });

  test('deletes the uploaded file when the database save fails', async () => {
    documents.createAndLink.mockRejectedValue(AppError.conflict('slot_taken', 'Taken'));

    const res = await upload();

    expect(res.statusCode).toBe(409);
    expect(res.body.code).toBe('slot_taken');
    expect(storage.remove).toHaveBeenCalledWith(KEY);
  });
});

describe('POST /jobs/:id/documents/attach', () => {
  const attach = (body) => auth(request(app).post('/jobs/5/documents/attach')).send(body);

  test('attaches with the chosen details', async () => {
    const res = await attach({ ...DETAILS, fileId: '9' });

    expect(res.statusCode).toBe(201);
    expect(documents.attachExisting).toHaveBeenCalledWith(
      USER_ID,
      5,
      9,
      { type: 'cover_letter', label: 'Letter v1' },
      { usedAs: 'sent_cover_letter', replace: false, replaceFileId: null },
    );
  });

  test('returns 422 without a file id', async () => {
    const res = await attach(DETAILS);

    expect(res.statusCode).toBe(422);
    expect(documents.attachExisting).not.toHaveBeenCalled();
  });

  test.each([
    ['no_job', 'job_not_found'],
    ['no_file', 'file_not_found'],
  ])('maps %s to 404', async (result, code) => {
    documents.attachExisting.mockResolvedValue(result);

    const res = await attach({ ...DETAILS, fileId: 9 });

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe(code);
  });
});

describe('PATCH /jobs/:id/documents/:documentId', () => {
  const edit = (body) => auth(request(app).patch('/jobs/5/documents/9')).send(body);

  test('saves the details without uploading again', async () => {
    const res = await edit({ ...DETAILS, replace: true });

    expect(res.statusCode).toBe(200);
    expect(documents.updateLinked).toHaveBeenCalledWith(
      USER_ID,
      5,
      9,
      { type: 'cover_letter', label: 'Letter v1' },
      { usedAs: 'sent_cover_letter', replace: true, replaceFileId: null },
    );
    expect(storage.upload).not.toHaveBeenCalled();
    expect(cleanupRemovedFiles).toHaveBeenCalledWith(USER_ID);
  });

  test('returns 404 when the file is not on the job', async () => {
    documents.updateLinked.mockResolvedValue('no_file');

    const res = await edit(DETAILS);

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('file_not_found');
  });
});

describe('removing files', () => {
  test('removes a file from the job, then cleans up', async () => {
    const res = await auth(request(app).delete('/jobs/5/documents/9'));

    expect(res.statusCode).toBe(200);
    expect(documents.unlink).toHaveBeenCalledWith(USER_ID, 5, 9);
    expect(cleanupRemovedFiles).toHaveBeenCalledWith(USER_ID);
    expect(storage.remove).not.toHaveBeenCalled();
  });

  test('does not clean up when nothing was removed', async () => {
    documents.unlink.mockResolvedValue('no_file');

    const res = await auth(request(app).delete('/jobs/5/documents/9'));

    expect(res.statusCode).toBe(404);
    expect(cleanupRemovedFiles).not.toHaveBeenCalled();
  });

  test('removes a file from the library without deleting it directly', async () => {
    const res = await auth(request(app).delete('/jobs/5/documents/library/9'));

    expect(res.statusCode).toBe(200);
    expect(documents.removeFromLibrary).toHaveBeenCalledWith(USER_ID, 9);
    expect(cleanupRemovedFiles).toHaveBeenCalledWith(USER_ID);
    expect(storage.remove).not.toHaveBeenCalled();
  });

  test('returns 404 for a library file that is not yours or already removed', async () => {
    documents.removeFromLibrary.mockResolvedValue(false);

    const res = await auth(request(app).delete('/jobs/5/documents/library/9'));

    expect(res.statusCode).toBe(404);
    expect(cleanupRemovedFiles).not.toHaveBeenCalled();
  });
});

describe('GET /jobs/:id/documents/:documentId/file', () => {
  const FILE = { name: 'resume.pdf', storageKey: KEY, mimeType: 'application/pdf' };
  const open = () => auth(request(app).get('/jobs/5/documents/9/file'));

  test('streams the file with safe, private headers', async () => {
    documents.findLinked.mockResolvedValue(FILE);
    storage.download.mockResolvedValue(PDF);

    const res = await open();

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.body).toEqual(PDF);
    expect(documents.findLinked).toHaveBeenCalledWith(USER_ID, 5, 9);
  });

  test('never touches storage for a file you cannot access', async () => {
    documents.findLinked.mockResolvedValue(undefined);

    const res = await open();

    expect(res.statusCode).toBe(404);
    expect(storage.download).not.toHaveBeenCalled();
  });

  test.each([
    [404, 404, 'file_unavailable'],
    [500, 502, 'download_failed'],
  ])('maps a storage %i to %i %s', async (storageStatus, status, code) => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    documents.findLinked.mockResolvedValue(FILE);
    storage.download.mockRejectedValue(Object.assign(new Error('x'), { status: storageStatus }));

    const res = await open();

    expect(res.statusCode).toBe(status);
    expect(res.body.code).toBe(code);
    console.error.mockRestore();
  });
});

describe('permanently deleting jobs cleans up removed files', () => {
  test('one job', async () => {
    jobModel.deleteForever.mockResolvedValue([5]);

    const res = await auth(request(app).delete('/jobs/5/permanent'));

    expect(res.statusCode).toBe(200);
    expect(cleanupRemovedFiles).toHaveBeenCalledWith(USER_ID);
  });

  test('many jobs', async () => {
    jobModel.deleteForever.mockResolvedValue([5, 6]);

    const res = await auth(request(app).post('/jobs/bulk/delete-forever')).send({ ids: [5, 6] });

    expect(res.statusCode).toBe(200);
    expect(cleanupRemovedFiles).toHaveBeenCalledWith(USER_ID);
  });

  test('emptying Trash', async () => {
    jobModel.emptyTrash.mockResolvedValue(2);

    const res = await auth(request(app).delete('/jobs/trash'));

    expect(res.statusCode).toBe(200);
    expect(cleanupRemovedFiles).toHaveBeenCalledWith(USER_ID);
  });

  test('skips cleanup when no job was deleted', async () => {
    jobModel.emptyTrash.mockResolvedValue(0);

    await auth(request(app).delete('/jobs/trash'));

    expect(cleanupRemovedFiles).not.toHaveBeenCalled();
  });
});