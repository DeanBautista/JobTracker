const request = require('supertest');

jest.mock('./db/knex', () => ({
  raw: jest.fn(),
}));

// The controller only calls userModel.create, so mock it:
// no database or bcrypt needed for these tests.
jest.mock('./models/userModel', () => ({
  create: jest.fn(),
}));

const knex = require('./db/knex');
const userModel = require('./models/userModel');
const AppError = require('./utils/AppError');
const app = require('./app');

afterEach(() => {
  jest.clearAllMocks();
});

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

describe('POST /users', () => {
  const validBody = {
    name: 'Ana Cruz',
    email: 'Ana@Example.com',
    password: 'supersecret1',
  };

  test('creates a user and returns 201', async () => {
    const created = { id: 1, name: 'Ana Cruz', email: 'ana@example.com' };
    userModel.create.mockResolvedValue(created);

    const res = await request(app).post('/users').send(validBody);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(created);
    expect(userModel.create).toHaveBeenCalledWith(validBody);
  });

  test('returns 400 with field details when the body is empty', async () => {
    const res = await request(app).post('/users').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('validation_failed');
    expect(Object.keys(res.body.details)).toEqual(
      expect.arrayContaining(['name', 'email', 'password'])
    );
    expect(userModel.create).not.toHaveBeenCalled();
  });

  test('returns 400 for an invalid email', async () => {
    const res = await request(app)
      .post('/users')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.statusCode).toBe(400);
    expect(res.body.details.email).toBeDefined();
    expect(userModel.create).not.toHaveBeenCalled();
  });

  test('returns 400 for a short password', async () => {
    const res = await request(app)
      .post('/users')
      .send({ ...validBody, password: 'short' });

    expect(res.statusCode).toBe(400);
    expect(res.body.details.password).toBeDefined();
    expect(userModel.create).not.toHaveBeenCalled();
  });

  test('returns 409 when the email is already registered', async () => {
    userModel.create.mockRejectedValue(
      AppError.conflict('email_taken', 'That email is already registered')
    );

    const res = await request(app).post('/users').send(validBody);

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('email_taken');
  });

  test('returns 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send('{"name": ');

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('invalid_json');
  });

  test('returns a generic 500 for unexpected errors without leaking details', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    userModel.create.mockRejectedValue(new Error('ER_BAD_FIELD_ERROR secret'));

    const res = await request(app).post('/users').send(validBody);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: 'internal_error',
      message: 'Something went wrong',
    });
    expect(JSON.stringify(res.body)).not.toContain('secret');

    errorSpy.mockRestore();
  });
});

describe('unknown routes', () => {
  test('returns 404 as JSON', async () => {
    const res = await request(app).get('/nope');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('route_not_found');
  });
});