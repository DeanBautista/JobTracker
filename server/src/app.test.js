const request = require('supertest');

jest.mock('./db/knex', () => ({
  raw: jest.fn(),
}));

const knex = require('./db/knex');
const app = require('./app');

afterEach(() => {
  jest.clearAllMocks();
});

test('GET /health returns ok when the database responds', async () => {
  knex.raw.mockResolvedValue([[{ 1: 1 }]]);

  const res = await request(app).get('/health');

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ status: 'ok', db: 'connected' });
});

test('GET /health returns 503 when the database is unreachable', async () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  knex.raw.mockRejectedValue(new Error('ECONNREFUSED'));

  const res = await request(app).get('/health');

  expect(res.statusCode).toBe(503);
  expect(res.body.status).toBe('error');

  errorSpy.mockRestore();
});