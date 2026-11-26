const request = require('supertest');
const jobModel = require('../models/jobModel');
const { signAccessToken } = require('../utils/tokens');
const detail = require('../models/jobDetailModel');
const app = require('../app');
const sessionModel = require('../models/sessionModel');

const auth = () => ({ Authorization: `Bearer ${signAccessToken(147, 1)}` });

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
    expect(Object.keys(res.body.fields)).toEqual(
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
    expect(res.body.fields.employmentType).toBeDefined();
    expect(jobModel.create).not.toHaveBeenCalled();
  });

  test('returns 422 for an invalid link', async () => {
    const res = await request(app)
      .post('/jobs')
      .set(auth())
      .send({ ...validBody, link: 'not-a-url' });

    expect(res.statusCode).toBe(422);
    expect(res.body.fields.link).toBeDefined();
  });

  test('returns 422 when max salary is below min salary', async () => {
    const res = await request(app)
      .post('/jobs')
      .set(auth())
      .send({ ...validBody, salaryMin: '50000', salaryMax: '40000' });

    expect(res.statusCode).toBe(422);
    expect(res.body.fields.salaryMax).toBeDefined();
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
    expect(res.body.code).toBe('duplicate_job');
    expect(res.body.fields).toEqual({ duplicate });
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

  describe('closing fields (rejected, withdrawn, ghosted)', () => {
    test.each(['rejected', 'withdrawn', 'ghosted'])('passes the closing reason and note for %s', async (stage) => {
      jobModel.create.mockResolvedValue(created);

      const res = await request(app)
        .post('/jobs')
        .set(auth())
        .send({ ...validBody, stage, closedReason: 'position_closed', closingNote: '  Role was filled  ' });

      expect(res.statusCode).toBe(201);
      expect(jobModel.create).toHaveBeenCalledWith(
        147,
        expect.objectContaining({ status: stage, closedReason: 'position_closed', closingNote: 'Role was filled' })
      );
    });

    test('the reason and note are optional', async () => {
      jobModel.create.mockResolvedValue(created);

      const res = await request(app)
        .post('/jobs')
        .set(auth())
        .send({ ...validBody, stage: 'rejected', closedReason: '', closingNote: '' });

      expect(res.statusCode).toBe(201);
      expect(jobModel.create).toHaveBeenCalledWith(
        147,
        expect.objectContaining({ closedReason: null, closingNote: null })
      );
    });

    test('returns 422 for an unknown closing reason', async () => {
      const res = await request(app)
        .post('/jobs')
        .set(auth())
        .send({ ...validBody, stage: 'rejected', closedReason: 'bored' });

      expect(res.statusCode).toBe(422);
      expect(res.body.fields.closedReason).toBeDefined();
      expect(jobModel.create).not.toHaveBeenCalled();
    });

    test('returns 422 when the closing note is too long', async () => {
      const res = await request(app)
        .post('/jobs')
        .set(auth())
        .send({ ...validBody, stage: 'ghosted', closingNote: 'x'.repeat(1001) });

      expect(res.statusCode).toBe(422);
      expect(res.body.fields.closingNote).toBeDefined();
      expect(jobModel.create).not.toHaveBeenCalled();
    });

    test.each(['wishlist', 'applied', 'offer', 'accepted'])(
      'ignores closing fields for %s (not a closing stage)',
      async (stage) => {
        jobModel.create.mockResolvedValue(created);

        // "bored" would be a 422 on a closing stage, so this also proves it is not validated here.
        const res = await request(app)
          .post('/jobs')
          .set(auth())
          .send({ ...validBody, stage, closedReason: 'bored', closingNote: 'should be dropped' });

        expect(res.statusCode).toBe(201);
        expect(jobModel.create).toHaveBeenCalledWith(
          147,
          expect.objectContaining({ closedReason: null, closingNote: null })
        );
      }
    );
  });

  describe('offer fields (offer, accepted)', () => {
    const offerBody = {
      offerSalary: '60000',
      offerCurrency: 'php',
      offerPeriod: 'month',
      offerRespondBy: '2026-12-01',
      offerNotes: '  13th month included  ',
    };

    test.each(['offer', 'accepted'])('passes the offer details for %s', async (stage) => {
      jobModel.create.mockResolvedValue(created);

      const res = await request(app).post('/jobs').set(auth()).send({ ...validBody, stage, ...offerBody });

      expect(res.statusCode).toBe(201);
      expect(jobModel.create).toHaveBeenCalledWith(
        147,
        expect.objectContaining({
          status: stage,
          offerSalary: 60000,
          offerCurrency: 'PHP',
          offerPeriod: 'month',
          offerRespondBy: '2026-12-01',
          offerNotes: '13th month included',
        })
      );
    });

    test('every offer field is optional', async () => {
      jobModel.create.mockResolvedValue(created);

      const res = await request(app)
        .post('/jobs')
        .set(auth())
        .send({
          ...validBody,
          stage: 'offer',
          offerSalary: '',
          offerCurrency: '',
          offerPeriod: '',
          offerRespondBy: '',
          offerNotes: '',
        });

      expect(res.statusCode).toBe(201);
      expect(jobModel.create).toHaveBeenCalledWith(
        147,
        expect.objectContaining({
          offerSalary: null,
          offerCurrency: null,
          offerPeriod: null,
          offerRespondBy: null,
          offerNotes: null,
        })
      );
    });

    test.each([
      ['a negative salary', { offerSalary: '-1' }, 'offerSalary'],
      ['a non-numeric salary', { offerSalary: 'lots' }, 'offerSalary'],
      ['a currency that is not 3 letters', { offerCurrency: 'PH' }, 'offerCurrency'],
      ['an unknown period', { offerPeriod: 'weekly' }, 'offerPeriod'],
      ['an invalid reply-by date', { offerRespondBy: 'next friday' }, 'offerRespondBy'],
      ['notes that are too long', { offerNotes: 'x'.repeat(5001) }, 'offerNotes'],
    ])('returns 422 for %s', async (_label, extra, field) => {
      const res = await request(app)
        .post('/jobs')
        .set(auth())
        .send({ ...validBody, stage: 'offer', ...extra });

      expect(res.statusCode).toBe(422);
      expect(res.body.fields[field]).toBeDefined();
      expect(jobModel.create).not.toHaveBeenCalled();
    });

    test.each(['wishlist', 'applied', 'rejected'])('ignores offer fields for %s (not an offer stage)', async (stage) => {
      jobModel.create.mockResolvedValue(created);

      // A negative salary would be a 422 on an offer stage, so this also proves it is not validated here.
      const res = await request(app)
        .post('/jobs')
        .set(auth())
        .send({ ...validBody, stage, ...offerBody, offerSalary: '-1' });

      expect(res.statusCode).toBe(201);
      expect(jobModel.create).toHaveBeenCalledWith(
        147,
        expect.objectContaining({
          offerSalary: null,
          offerCurrency: null,
          offerPeriod: null,
          offerRespondBy: null,
          offerNotes: null,
        })
      );
    });
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

  test('returns 401 session_revoked when the session is no longer active', async () => {
    sessionModel.isActive.mockResolvedValue(false);

    const res = await request(app).get('/jobs').set(auth());

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('session_revoked');
    expect(jobModel.list).not.toHaveBeenCalled();
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

describe.each(['archive', 'trash'])('GET /jobs?view=%s', (view) => {
  const result = {
    jobs: [{ id: 1, title: 'Dev' }],
    total: 1,
    counts: { archive: 1, trash: 1 },
  };

  test('returns 401 without a token', async () => {
    const res = await request(app).get(`/jobs?view=${view}`);

    expect(res.statusCode).toBe(401);
    expect(jobModel.listTab).not.toHaveBeenCalled();
  });

  test('returns the page, total and tab counts for the signed-in user, with default paging', async () => {
    jobModel.listTab.mockResolvedValue(result);

    const res = await request(app).get(`/jobs?view=${view}`).set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(result);
    expect(jobModel.listTab).toHaveBeenCalledWith(147, view, { page: 1, size: 10 });
    expect(jobModel.list).not.toHaveBeenCalled();
  });

  test('passes page and size to the model', async () => {
    jobModel.listTab.mockResolvedValue(result);

    await request(app).get(`/jobs?view=${view}&page=3&size=25`).set(auth());

    expect(jobModel.listTab).toHaveBeenCalledWith(147, view, { page: 3, size: 25 });
  });

  test.each([
    ['a negative page', 'page=-2&size=10', { page: 1, size: 10 }],
    ['a non-numeric page', 'page=abc', { page: 1, size: 10 }],
    ['an unsupported size', 'size=999', { page: 1, size: 10 }],
    ['a huge page', 'page=999999999', { page: 100000, size: 10 }],
  ])('falls back to safe paging for %s', async (_label, query, expected) => {
    jobModel.listTab.mockResolvedValue(result);

    await request(app).get(`/jobs?view=${view}&${query}`).set(auth());

    expect(jobModel.listTab).toHaveBeenCalledWith(147, view, expected);
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
    expect(res.body.fields.ids).toBeDefined();
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

const exportRow = {
  id: 1, title: 'Frontend Developer', company: 'Northwind', status: 'applied', priority: 'high',
  work_mode: 'remote', employment_type: 'full_time', salary_min: '50000.00', salary_max: null,
  days_in_stage: '3', archived: 0,
};

const bodyWithoutBom = (res) => res.text.replace(/^\uFEFF/, '');

describe('POST /jobs/bulk/export', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).post('/jobs/bulk/export').send({ ids: [1] });

    expect(res.statusCode).toBe(401);
    expect(jobModel.listForExport).not.toHaveBeenCalled();
  });

  test('returns 422 for invalid ids', async () => {
    const res = await request(app).post('/jobs/bulk/export').set(auth()).send({ ids: [] });

    expect(res.statusCode).toBe(422);
    expect(jobModel.listForExport).not.toHaveBeenCalled();
  });

  test('returns 404 when none of the jobs are found', async () => {
    jobModel.listForExport.mockResolvedValue([]);

    const res = await request(app).post('/jobs/bulk/export').set(auth()).send({ ids: [1] });

    expect(res.statusCode).toBe(404);
  });

  test('returns a CSV download with readable labels', async () => {
    jobModel.listForExport.mockResolvedValue([exportRow]);

    const res = await request(app).post('/jobs/bulk/export').set(auth()).send({ ids: [1, 2] });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="jobs-\d{4}-\d{2}-\d{2}\.csv"/);
    const [header, line] = bodyWithoutBom(res).split('\r\n');
    expect(header.startsWith('Title,Company,Stage,Priority')).toBe(true);
    expect(line.startsWith('Frontend Developer,Northwind,Applied,High,Remote,Full time')).toBe(true);
    expect(jobModel.listForExport).toHaveBeenCalledWith(147, [1, 2]);
  });

  test('escapes commas, quotes and formula-looking values', async () => {
    jobModel.listForExport.mockResolvedValue([
      { ...exportRow, title: 'Dev, "Senior"', company: '=HYPERLINK("x")' },
    ]);

    const res = await request(app).post('/jobs/bulk/export').set(auth()).send({ ids: [1] });

    expect(bodyWithoutBom(res)).toContain(`"Dev, ""Senior""","'=HYPERLINK(""x"")"`);
  });
});

describe('GET /jobs/export', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).get('/jobs/export');

    expect(res.statusCode).toBe(401);
    expect(jobModel.listFilteredForExport).not.toHaveBeenCalled();
  });

  test('exports everything matching the filters and sort', async () => {
    jobModel.listFilteredForExport.mockResolvedValue([exportRow]);

    const res = await request(app).get('/jobs/export?q=react&stage=closed&sort=days&dir=asc').set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(jobModel.listFilteredForExport).toHaveBeenCalledWith(
      147,
      expect.objectContaining({ q: 'react', stage: 'closed', sort: 'days', dir: 'asc' }),
    );
  });

  test('returns 404 when nothing matches', async () => {
    jobModel.listFilteredForExport.mockResolvedValue([]);

    const res = await request(app).get('/jobs/export').set(auth());

    expect(res.statusCode).toBe(404);
  });
});

describe('GET /jobs/:id', () => {
  it('returns the job overview', async () => {
    detail.getOverview.mockResolvedValue({ id: '101', title: 'Frontend Developer', counts: { notes: 0 } });
    const res = await request(app).get('/jobs/101').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('101');
    expect(detail.getOverview).toHaveBeenCalledWith(expect.anything(), 101);
  });

  it('404s when the job is missing or not theirs', async () => {
    detail.getOverview.mockResolvedValue(null);
    const res = await request(app).get('/jobs/999').set(auth());
    expect(res.status).toBe(404);
  });

  it('422s on a bad id', async () => {
    const res = await request(app).get('/jobs/abc').set(auth());
    expect(res.status).toBe(422);
    expect(detail.getOverview).not.toHaveBeenCalled();
  });

  it('401s without a token', async () => {
    const res = await request(app).get('/jobs/101');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /jobs/:id', () => {
  it('updates and returns the job', async () => {
    detail.update.mockResolvedValue({ job: { id: '101', priority: 'high' } });
    const res = await request(app).patch('/jobs/101').set(auth()).send({ priority: 'high' });
    expect(res.status).toBe(200);
    expect(detail.update).toHaveBeenCalledWith(expect.anything(), 101, { priority: 'high' });
  });

  it('422s on invalid values', async () => {
    const res = await request(app).patch('/jobs/101').set(auth()).send({ stage: 'nope', title: '' });
    expect(res.status).toBe(422);
    expect(detail.update).not.toHaveBeenCalled();
  });

  it('422s on an empty body', async () => {
    const res = await request(app).patch('/jobs/101').set(auth()).send({});
    expect(res.status).toBe(422);
  });

  it('404s for archived, trashed or missing jobs', async () => {
    detail.update.mockResolvedValue({ notFound: true });
    const res = await request(app).patch('/jobs/101').set(auth()).send({ priority: 'low' });
    expect(res.status).toBe(404);
  });
});

describe('notes', () => {
  it('creates a note', async () => {
    detail.createNote.mockResolvedValue({ id: '1', text: 'hi', pinned: false });
    const res = await request(app).post('/jobs/101/notes').set(auth()).send({ text: ' hi ' });
    expect(res.status).toBe(201);
    expect(detail.createNote).toHaveBeenCalledWith(expect.anything(), 101, 'hi');
  });

  it('422s on an empty note', async () => {
    const res = await request(app).post('/jobs/101/notes').set(auth()).send({ text: '  ' });
    expect(res.status).toBe(422);
  });

  it('pins a note', async () => {
    detail.updateNote.mockResolvedValue({ id: '1', pinned: true });
    const res = await request(app).patch('/jobs/101/notes/1').set(auth()).send({ pinned: true });
    expect(res.status).toBe(200);
  });

  it('404s when the note is missing', async () => {
    detail.updateNote.mockResolvedValue(null);
    const res = await request(app).patch('/jobs/101/notes/9').set(auth()).send({ pinned: true });
    expect(res.status).toBe(404);
  });

  it('deletes a note', async () => {
    detail.deleteNote.mockResolvedValue(true);
    const res = await request(app).delete('/jobs/101/notes/1').set(auth());
    expect(res.status).toBe(200);
  });
});

describe('GET /jobs/:id/notes', () => {
  it('404s when the job is not theirs', async () => {
    detail.owns.mockResolvedValue(false);
    const res = await request(app).get('/jobs/101/notes').set(auth());
    expect(res.status).toBe(404);
    expect(detail.getNotes).not.toHaveBeenCalled();
  });

  it('returns notes for an owned job', async () => {
    detail.owns.mockResolvedValue(true);
    detail.getNotes.mockResolvedValue([{ id: '1', text: 'hi' }]);
    const res = await request(app).get('/jobs/101/notes').set(auth());
    expect(res.body).toEqual({ notes: [{ id: '1', text: 'hi' }] });
  });
});