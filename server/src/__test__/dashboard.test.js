const request = require('supertest');
const dashboardModel = require('../models/dashboardModel');
const app = require('../app');

// Real token checks are covered in auth.test.js. Here a header stands in for a
// signed-in user, so each test can pick which user id the route sees.
jest.mock('../middleware/auth', () => ({
  ...jest.requireActual('../middleware/auth'),
  requireAuth: (req, res, next) => {
    const id = req.get('x-test-user');
    if (!id) return res.status(401).json({ code: 'unauthorized', message: 'Sign in required' });
    req.userId = Number(id);
    next();
  },
}));

const get = (path, userId = 1) => request(app).get(path).set('x-test-user', String(userId));

describe('dashboard auth', () => {
  test.each(['funnel', 'weekly', 'breakdown', 'stats', 'has-jobs'])(
    'GET /dashboard/%s returns 401 when signed out',
    async (name) => {
      const res = await request(app).get(`/dashboard/${name}`);

      expect(res.statusCode).toBe(401);
      expect(dashboardModel.funnel).not.toHaveBeenCalled();
      expect(dashboardModel.weekly).not.toHaveBeenCalled();
      expect(dashboardModel.breakdown).not.toHaveBeenCalled();
      expect(dashboardModel.stats).not.toHaveBeenCalled();
      expect(dashboardModel.hasJobs).not.toHaveBeenCalled();
    }
  );

  test('every query is scoped to the signed-in user', async () => {
    dashboardModel.weekly.mockResolvedValue({ goal: 5, counts: [] });

    await get('/dashboard/weekly', 7);

    expect(dashboardModel.weekly).toHaveBeenCalledWith(7);
  });
});

describe.each(['funnel', 'stats', 'breakdown'])('GET /dashboard/%s range handling', (name) => {
  beforeEach(() => {
    dashboardModel[name].mockResolvedValue({});
  });

  test.each([
    ['30', 30],
    ['90', 90],
    ['all', null],
    ['7', null],
    ['constructor', null],
    ['__proto__', null],
  ])('range=%s gives days=%s', async (range, days) => {
    const res = await get(`/dashboard/${name}`).query({ range });

    expect(res.statusCode).toBe(200);
    expect(dashboardModel[name]).toHaveBeenCalledWith(1, days);
  });

  test('a missing range means all time', async () => {
    await get(`/dashboard/${name}`);

    expect(dashboardModel[name]).toHaveBeenCalledWith(1, null);
  });

  test('a repeated range falls back to all time', async () => {
    await get(`/dashboard/${name}?range=30&range=90`);

    expect(dashboardModel[name]).toHaveBeenCalledWith(1, null);
  });
});

describe('response shapes', () => {
  test('GET /dashboard/funnel wraps the steps', async () => {
    const steps = [
      { stage: 'applied', count: 24 },
      { stage: 'screening', count: 13 },
    ];
    dashboardModel.funnel.mockResolvedValue(steps);

    const res = await get('/dashboard/funnel');

    expect(res.body).toEqual({ steps });
  });

  test('GET /dashboard/weekly returns the goal and counts', async () => {
    const weekly = { goal: 5, counts: [3, 7, 5, 2, 7, 4, 6, 3] };
    dashboardModel.weekly.mockResolvedValue(weekly);

    const res = await get('/dashboard/weekly');

    expect(res.body).toEqual(weekly);
  });

  test('GET /dashboard/breakdown returns sources and rejections', async () => {
    const breakdown = {
      sources: [{ name: 'LinkedIn', total: 10, replies: 4 }],
      rejections: { reasons: [{ key: 'no_response', count: 7 }], topStage: 'screening' },
    };
    dashboardModel.breakdown.mockResolvedValue(breakdown);

    const res = await get('/dashboard/breakdown');

    expect(res.body).toEqual(breakdown);
  });

  test('GET /dashboard/stats returns current and previous', async () => {
    const stats = {
      current: { applied: 24, replies: 9, interviews: 3, offers: 1 },
      previous: { applied: 18, replies: 6, interviews: 2, offers: 1 },
    };
    dashboardModel.stats.mockResolvedValue(stats);

    const res = await get('/dashboard/stats?range=30');

    expect(res.body).toEqual(stats);
  });

  test.each([true, false])('GET /dashboard/has-jobs returns hasJobs=%s', async (value) => {
    dashboardModel.hasJobs.mockResolvedValue(value);

    const res = await get('/dashboard/has-jobs');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ hasJobs: value });
  });
});

describe('errors', () => {
  test('returns a generic 500 without leaking details', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    dashboardModel.funnel.mockRejectedValue(new Error('ER_BAD_FIELD_ERROR secret'));

    const res = await get('/dashboard/funnel');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ code: 'internal_error', message: 'Something went wrong' });
    expect(JSON.stringify(res.body)).not.toContain('secret');

    errorSpy.mockRestore();
  });
});