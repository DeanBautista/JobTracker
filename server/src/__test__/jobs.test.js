const request = require('supertest');
const jobModel = require('../models/jobModel');
const { signAccessToken } = require('../utils/tokens');
const app = require('../app');

const auth = () => ({ Authorization: `Bearer ${signAccessToken(147)}` });

describe('POST /jobs', () => {
  const validBody = { title: 'Frontend Developer', company: 'Northwind' };
  const created = { id: 1, title: 'Frontend Developer', company: 'Northwind', stage: 'wishlist' };

  test('returns 401 without a token', async () => {
    const res = await request(app).post('/jobs').send(validBody);

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('unauthorized');
    expect(jobModel.create).not.toHaveBeenCalled();
  });

  test('returns 422 with field errors when title and company are missing', async () => {
    const res = await request(app).post('/jobs').set(auth()).send({});

    expect(res.statusCode).toBe(422);
    expect(Object.keys(res.body.errors)).toEqual(
      expect.arrayContaining(['title', 'company'])
    );
    expect(jobModel.create).not.toHaveBeenCalled();
  });

  test('returns 422 for a value that is not a database enum', async () => {
    const res = await request(app)
      .post('/jobs')
      .set(auth())
      .send({ ...validBody, employmentType: 'fulltime' });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors.employmentType).toBeDefined();
    expect(jobModel.create).not.toHaveBeenCalled();
  });

  test('returns 422 for an invalid link', async () => {
    const res = await request(app)
      .post('/jobs')
      .set(auth())
      .send({ ...validBody, link: 'not-a-url' });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors.link).toBeDefined();
  });

  test('returns 422 when max salary is below min salary', async () => {
    const res = await request(app)
      .post('/jobs')
      .set(auth())
      .send({ ...validBody, salaryMin: '50000', salaryMax: '40000' });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors.salaryMax).toBeDefined();
  });

  test('creates the job and returns 201', async () => {
    jobModel.create.mockResolvedValue(created);

    const res = await request(app).post('/jobs').set(auth()).send(validBody);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(created);
    expect(jobModel.findDuplicate).not.toHaveBeenCalled(); // no link, nothing to check
  });

  test('uses the user id from the token, never from the body', async () => {
    jobModel.create.mockResolvedValue(created);

    await request(app)
      .post('/jobs')
      .set(auth())
      .send({ ...validBody, user_id: 999, userId: 999 });

    expect(jobModel.create).toHaveBeenCalledWith(147, expect.any(Object));
  });

  test('cleans a realistic form payload: blanks become null, values are mapped', async () => {
    jobModel.create.mockResolvedValue(created);

    await request(app)
      .post('/jobs')
      .set(auth())
      .send({
        title: '  Frontend Developer  ',
        company: ' Northwind ',
        stage: 'applied',
        link: '',
        source: '',
        workMode: '',
        employmentType: 'full_time',
        salaryMin: '50000',
        salaryMax: '',
        currency: 'php',
        priority: 'high',
        dateApplied: '2026-11-14',
        description: '',
      });

    expect(jobModel.create).toHaveBeenCalledWith(
      147,
      expect.objectContaining({
        title: 'Frontend Developer',
        company: 'Northwind',
        status: 'applied',
        link: null,
        source: null,
        workMode: null,
        employmentType: 'full_time',
        salaryMin: 50000,
        salaryMax: null,
        currency: 'PHP',
        priority: 'high',
        dateApplied: '2026-11-14',
        description: null,
      })
    );
  });

  test('returns 409 with the existing job when the link was already added', async () => {
    const duplicate = { id: 5, title: 'Frontend Developer', company: 'Northwind' };
    jobModel.findDuplicate.mockResolvedValue(duplicate);

    const res = await request(app)
      .post('/jobs')
      .set(auth())
      .send({ ...validBody, link: 'https://northwind.com/jobs/1' });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ duplicate });
    expect(jobModel.findDuplicate).toHaveBeenCalledWith(147, 'https://northwind.com/jobs/1');
    expect(jobModel.create).not.toHaveBeenCalled();
  });

  test('skips the duplicate check when confirmDuplicate is true', async () => {
    jobModel.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/jobs')
      .set(auth())
      .send({ ...validBody, link: 'https://northwind.com/jobs/1', confirmDuplicate: true });

    expect(res.statusCode).toBe(201);
    expect(jobModel.findDuplicate).not.toHaveBeenCalled();
    expect(jobModel.create).toHaveBeenCalledTimes(1);
  });

  test('creates the job when the link is new', async () => {
    jobModel.findDuplicate.mockResolvedValue(undefined);
    jobModel.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/jobs')
      .set(auth())
      .send({ ...validBody, link: 'https://northwind.com/jobs/2' });

    expect(res.statusCode).toBe(201);
    expect(jobModel.create).toHaveBeenCalledTimes(1);
  });
});

describe('GET /jobs', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).get('/jobs');

    expect(res.statusCode).toBe(401);
    expect(jobModel.list).not.toHaveBeenCalled();
  });

  test('returns the jobs and total for the signed-in user, with default paging', async () => {
    const result = { jobs: [{ id: 1, title: 'Dev' }], total: 1 };
    jobModel.list.mockResolvedValue(result);

    const res = await request(app).get('/jobs').set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(result);
    expect(jobModel.list).toHaveBeenCalledWith(
      147,
      expect.objectContaining({ sort: 'applied', dir: 'desc', page: 1, size: 10, archived: false })
    );
  });

  test('passes parsed filters, sort and paging to the model', async () => {
    jobModel.list.mockResolvedValue({ jobs: [], total: 0 });

    await request(app)
      .get('/jobs?q=react&stage=closed&mode=remote&priority=high&date=30&archived=1&sort=days&dir=asc&page=2&size=25')
      .set(auth());

    expect(jobModel.list).toHaveBeenCalledWith(
      147,
      expect.objectContaining({
        q: 'react', stage: 'closed', mode: 'remote', priority: 'high',
        date: 30, archived: true, sort: 'days', dir: 'asc', page: 2, size: 25,
      })
    );
  });

  test('falls back to defaults for invalid values', async () => {
    jobModel.list.mockResolvedValue({ jobs: [], total: 0 });

    await request(app)
      .get('/jobs?stage=bogus&sort=hack&dir=sideways&size=999&page=-3&date=7')
      .set(auth());

    expect(jobModel.list).toHaveBeenCalledWith(
      147,
      expect.objectContaining({ stage: '', sort: 'applied', dir: 'desc', size: 10, page: 1, date: 0 })
    );
  });
});

describe('GET /jobs?view=board', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).get('/jobs?view=board');

    expect(res.statusCode).toBe(401);
    expect(jobModel.listBoard).not.toHaveBeenCalled();
  });

  test('returns every board job for the signed-in user, without paging', async () => {
    const jobs = [{ id: 1, title: 'Dev', stage: 'wishlist', position: 0 }];
    jobModel.listBoard.mockResolvedValue(jobs);

    const res = await request(app).get('/jobs?view=board').set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ jobs });
    expect(jobModel.listBoard).toHaveBeenCalledWith(147);
    expect(jobModel.list).not.toHaveBeenCalled();
  });
});

describe('PATCH /jobs/:id/move', () => {
  const body = { stage: 'applied', position: 1500.5 };

  test('returns 401 without a token', async () => {
    const res = await request(app).patch('/jobs/5/move').send(body);

    expect(res.statusCode).toBe(401);
    expect(jobModel.move).not.toHaveBeenCalled();
  });

  test('moves the job and returns the result', async () => {
    const result = { id: 5, stage: 'applied', position: 1500.5, changed: true };
    jobModel.move.mockResolvedValue(result);

    const res = await request(app).patch('/jobs/5/move').set(auth()).send(body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(result);
    expect(jobModel.move).toHaveBeenCalledWith(147, 5, { stage: 'applied', position: 1500.5 });
  });

  test('accepts position 0 and closed stages', async () => {
    jobModel.move.mockResolvedValue({ id: 5, stage: 'ghosted', position: 0, changed: true });

    const res = await request(app).patch('/jobs/5/move').set(auth()).send({ stage: 'ghosted', position: 0 });

    expect(res.statusCode).toBe(200);
    expect(jobModel.move).toHaveBeenCalledWith(147, 5, { stage: 'ghosted', position: 0 });
  });

  test('returns 422 for an unknown stage', async () => {
    const res = await request(app).patch('/jobs/5/move').set(auth()).send({ stage: 'archived', position: 1 });

    expect(res.statusCode).toBe(422);
    expect(jobModel.move).not.toHaveBeenCalled();
  });

  test.each([
    ['missing', undefined],
    ['a string', '5'],
    ['not finite', null],
    ['out of range', 1e15],
  ])('returns 422 when position is %s', async (_label, position) => {
    const res = await request(app).patch('/jobs/5/move').set(auth()).send({ stage: 'applied', position });

    expect(res.statusCode).toBe(422);
    expect(jobModel.move).not.toHaveBeenCalled();
  });

  test('returns 422 when the id is not an integer', async () => {
    const res = await request(app).patch('/jobs/abc/move').set(auth()).send(body);

    expect(res.statusCode).toBe(422);
    expect(jobModel.move).not.toHaveBeenCalled();
  });

  test('returns 404 when the job is not the signed-in user\'s', async () => {
    jobModel.move.mockResolvedValue(null);

    const res = await request(app).patch('/jobs/5/move').set(auth()).send(body);

    expect(res.statusCode).toBe(404);
  });

  test('uses the user id from the token, never from the body', async () => {
    jobModel.move.mockResolvedValue({ id: 5, stage: 'applied', position: 1, changed: false });

    await request(app).patch('/jobs/5/move').set(auth()).send({ ...body, user_id: 999, userId: 999 });

    expect(jobModel.move).toHaveBeenCalledWith(147, 5, expect.any(Object));
  });

  test('passes the closing reason and note to the model', async () => {
    jobModel.move.mockResolvedValue({ id: 5, stage: 'rejected', position: 1, changed: true });

    const res = await request(app)
      .patch('/jobs/5/move')
      .set(auth())
      .send({ stage: 'rejected', position: 1, closedReason: 'position_closed', closingNote: 'Role was filled' });

    expect(res.statusCode).toBe(200);
    expect(jobModel.move).toHaveBeenCalledWith(147, 5, {
      stage: 'rejected', position: 1, closedReason: 'position_closed', closingNote: 'Role was filled',
    });
  });

  test('returns 422 for an unknown closing reason', async () => {
    const res = await request(app)
      .patch('/jobs/5/move')
      .set(auth())
      .send({ stage: 'rejected', position: 1, closedReason: 'bored' });

    expect(res.statusCode).toBe(422);
    expect(jobModel.move).not.toHaveBeenCalled();
  });
});

describe('GET /jobs?view=trash', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).get('/jobs?view=trash');

    expect(res.statusCode).toBe(401);
    expect(jobModel.listTrash).not.toHaveBeenCalled();
  });

  test('returns the trashed jobs for the signed-in user', async () => {
    const jobs = [{ id: 1, title: 'Dev', deletedAt: '2026-11-20T00:00:00Z', daysLeft: 30 }];
    jobModel.listTrash.mockResolvedValue(jobs);

    const res = await request(app).get('/jobs?view=trash').set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ jobs });
    expect(jobModel.listTrash).toHaveBeenCalledWith(147);
    expect(jobModel.list).not.toHaveBeenCalled();
  });
});

// [route, jobModel function it calls]
const BULK = [
  ['/jobs/bulk/archive', 'archive'],
  ['/jobs/bulk/unarchive', 'unarchive'],
  ['/jobs/bulk/delete', 'trash'],
  ['/jobs/bulk/restore', 'restore'],
  ['/jobs/bulk/delete-forever', 'deleteForever'],
];

describe.each(BULK)('POST %s', (path, fn) => {
  test('returns 401 without a token', async () => {
    const res = await request(app).post(path).send({ ids: [1] });

    expect(res.statusCode).toBe(401);
    expect(jobModel[fn]).not.toHaveBeenCalled();
  });

  test('applies the change and returns the affected ids', async () => {
    jobModel[fn].mockResolvedValue([1, 2, 3]);

    const res = await request(app).post(path).set(auth()).send({ ids: [1, 2, 3] });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ affected: 3, ids: [1, 2, 3] });
    expect(jobModel[fn]).toHaveBeenCalledWith(147, [1, 2, 3]);
  });

  test('reports only the ids that changed when some are skipped', async () => {
    jobModel[fn].mockResolvedValue([1]);

    const res = await request(app).post(path).set(auth()).send({ ids: [1, 2] });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ affected: 1, ids: [1] });
  });

  test('removes duplicate ids before calling the model', async () => {
    jobModel[fn].mockResolvedValue([1, 2]);

    await request(app).post(path).set(auth()).send({ ids: [1, 1, 2] });

    expect(jobModel[fn]).toHaveBeenCalledWith(147, [1, 2]);
  });

  test.each([
    ['missing', undefined],
    ['empty', []],
    ['not an array', '1,2'],
    ['non-numeric', [1, 'x']],
    ['zero', [0]],
    ['negative', [-1]],
    ['fractional', [1.5]],
    ['more than 100', Array.from({ length: 101 }, (_, i) => i + 1)],
  ])('returns 422 when ids are %s', async (_label, ids) => {
    const res = await request(app).post(path).set(auth()).send({ ids });

    expect(res.statusCode).toBe(422);
    expect(res.body.errors.ids).toBeDefined();
    expect(jobModel[fn]).not.toHaveBeenCalled();
  });

  test('uses the user id from the token, never from the body', async () => {
    jobModel[fn].mockResolvedValue([1]);

    await request(app).post(path).set(auth()).send({ ids: [1], user_id: 999, userId: 999 });

    expect(jobModel[fn]).toHaveBeenCalledWith(147, expect.any(Array));
  });
});

// [method, route, jobModel function it calls]
const SINGLE = [
  ['patch', '/jobs/5/archive', 'archive'],
  ['patch', '/jobs/5/unarchive', 'unarchive'],
  ['patch', '/jobs/5/restore', 'restore'],
  ['delete', '/jobs/5', 'trash'],
  ['delete', '/jobs/5/permanent', 'deleteForever'],
];

describe.each(SINGLE)('%s %s', (method, path, fn) => {
  test('returns 401 without a token', async () => {
    const res = await request(app)[method](path);

    expect(res.statusCode).toBe(401);
    expect(jobModel[fn]).not.toHaveBeenCalled();
  });

  test('applies the change to that one job', async () => {
    jobModel[fn].mockResolvedValue([5]);

    const res = await request(app)[method](path).set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 5 });
    expect(jobModel[fn]).toHaveBeenCalledWith(147, [5]);
  });

  test('returns 404 when the job is missing, not the user\'s, or already in that state', async () => {
    jobModel[fn].mockResolvedValue([]);

    const res = await request(app)[method](path).set(auth());

    expect(res.statusCode).toBe(404);
  });

  test('returns 422 when the id is not an integer', async () => {
    const res = await request(app)[method](path.replace('/5', '/abc')).set(auth());

    expect(res.statusCode).toBe(422);
    expect(jobModel[fn]).not.toHaveBeenCalled();
  });
});

describe('DELETE /jobs/trash', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).delete('/jobs/trash');

    expect(res.statusCode).toBe(401);
    expect(jobModel.emptyTrash).not.toHaveBeenCalled();
  });

  test('empties the trash for the signed-in user', async () => {
    jobModel.emptyTrash.mockResolvedValue(4);

    const res = await request(app).delete('/jobs/trash').set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ affected: 4 });
    expect(jobModel.emptyTrash).toHaveBeenCalledWith(147);
    expect(jobModel.trash).not.toHaveBeenCalled(); // "trash" must not be read as a job id
  });
});

describe('POST /jobs/bulk/move', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).post('/jobs/bulk/move').send({ ids: [1], stage: 'applied' });

    expect(res.statusCode).toBe(401);
    expect(jobModel.moveMany).not.toHaveBeenCalled();
  });

  test('moves the jobs and returns the ids that moved', async () => {
    jobModel.moveMany.mockResolvedValue([1, 2]);

    const res = await request(app)
      .post('/jobs/bulk/move')
      .set(auth())
      .send({ ids: [1, 2], stage: 'interview' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ affected: 2, ids: [1, 2], stage: 'interview' });
    expect(jobModel.moveMany).toHaveBeenCalledWith(147, [1, 2], { stage: 'interview' });
  });

  test('returns affected 0 when every job was already in that stage', async () => {
    jobModel.moveMany.mockResolvedValue([]);

    const res = await request(app).post('/jobs/bulk/move').set(auth()).send({ ids: [1], stage: 'applied' });

    expect(res.statusCode).toBe(200);
    expect(res.body.affected).toBe(0);
  });

  test('passes the closing reason and note to the model', async () => {
    jobModel.moveMany.mockResolvedValue([1, 2]);

    await request(app)
      .post('/jobs/bulk/move')
      .set(auth())
      .send({ ids: [1, 2], stage: 'rejected', closedReason: 'position_closed', closingNote: 'Role was filled' });

    expect(jobModel.moveMany).toHaveBeenCalledWith(147, [1, 2], {
      stage: 'rejected', closedReason: 'position_closed', closingNote: 'Role was filled',
    });
  });

  test.each([
    ['ids are missing', { stage: 'applied' }],
    ['ids are empty', { ids: [], stage: 'applied' }],
    ['the stage is unknown', { ids: [1], stage: 'archived' }],
    ['the stage is missing', { ids: [1] }],
    ['the closing reason is unknown', { ids: [1], stage: 'rejected', closedReason: 'bored' }],
    ['the closing note is too long', { ids: [1], stage: 'rejected', closingNote: 'x'.repeat(1001) }],
  ])('returns 422 when %s', async (_label, body) => {
    const res = await request(app).post('/jobs/bulk/move').set(auth()).send(body);

    expect(res.statusCode).toBe(422);
    expect(jobModel.moveMany).not.toHaveBeenCalled();
  });
});