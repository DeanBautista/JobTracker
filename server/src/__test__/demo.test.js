const request = require('supertest');
const userModel = require('../models/userModel');
const { signAccessToken } = require('../utils/tokens');
const { resetDemoData } = require('../db/demoSeed');
const app = require('../app');

// The real seed needs a database, so it's mocked here.
jest.mock('../db/demoSeed', () => ({ resetDemoData: jest.fn() }));

describe('POST /demo/reset', () => {
  const auth = (id) => ({ Authorization: `Bearer ${signAccessToken(id, 1)}` });

  test('returns 401 without a token', async () => {
    const res = await request(app).post('/demo/reset');

    expect(res.statusCode).toBe(401);
    expect(resetDemoData).not.toHaveBeenCalled();
  });

  test('returns 403 demo_only for a normal user and does not reset anything', async () => {
    userModel.findById.mockResolvedValue({ id: 147, is_demo: 0 });

    const res = await request(app).post('/demo/reset').set(auth(147));

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('demo_only');
    expect(resetDemoData).not.toHaveBeenCalled();
  });

  test('resets the data for the demo user', async () => {
    userModel.findById.mockResolvedValue({ id: 165, is_demo: 1 });

    const res = await request(app).post('/demo/reset').set(auth(165));

    expect(res.statusCode).toBe(204);
    expect(resetDemoData).toHaveBeenCalledWith(165);
  });
});