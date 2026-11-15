const request = require('supertest');
const knex = require('../db/knex');
const app = require('../app');

describe('GET /health', () => {
  test('returns ok when the database responds', async () => {
    knex.raw.mockResolvedValue([[{ 1: 1 }]]);

    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });

  test('returns 503 when the database is unreachable', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    knex.raw.mockRejectedValue(new Error('ECONNREFUSED'));

    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('error');

    errorSpy.mockRestore();
  });
});

describe('unknown routes', () => {
  test('returns 404 as JSON', async () => {
    const res = await request(app).get('/nope');

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('route_not_found');
  });
});