process.env.ACCESS_TOKEN_SECRET = 'test-secret-for-jest';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('./db/knex', () => ({
  raw: jest.fn(),
}));

// Models are mocked: no database needed for these tests.
jest.mock('./models/userModel', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAuthByEmail: jest.fn(),
  recordFailedLogin: jest.fn(),
  clearFailedLogins: jest.fn(),
}));

jest.mock('./models/sessionModel', () => ({
  create: jest.fn(),
  findByHash: jest.fn(),
  rotate: jest.fn(),
  revoke: jest.fn(),
}));

const knex = require('./db/knex');
const userModel = require('./models/userModel');
const sessionModel = require('./models/sessionModel');
const AppError = require('./utils/AppError');
const { signAccessToken } = require('./utils/tokens');
const app = require('./app');

// Clears calls AND implementations, so each test sets up exactly what it needs.
afterEach(() => {
  jest.resetAllMocks();
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
    expect(res.body.code).toBe('validation_failed');
    expect(Object.keys(res.body.fields)).toEqual(
      expect.arrayContaining(['name', 'email', 'password'])
    );
    expect(userModel.create).not.toHaveBeenCalled();
  });

  test('returns 400 for an invalid email', async () => {
    const res = await request(app)
      .post('/users')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.statusCode).toBe(400);
    expect(res.body.fields.email).toBeDefined();
    expect(userModel.create).not.toHaveBeenCalled();
  });

  test('returns 400 for a short password', async () => {
    const res = await request(app)
      .post('/users')
      .send({ ...validBody, password: 'short' });

    expect(res.statusCode).toBe(400);
    expect(res.body.fields.password).toBeDefined();
    expect(userModel.create).not.toHaveBeenCalled();
  });

  test('returns 409 when the email is already registered', async () => {
    userModel.create.mockRejectedValue(
      AppError.conflict('email_taken', 'That email is already registered')
    );

    const res = await request(app).post('/users').send(validBody);

    expect(res.statusCode).toBe(409);
    expect(res.body.code).toBe('email_taken');
  });

  test('returns 400 for malformed JSON', async () => {
    const res = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send('{"name": ');

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('invalid_json');
  });

  test('returns a generic 500 for unexpected errors without leaking details', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    userModel.create.mockRejectedValue(new Error('ER_BAD_FIELD_ERROR secret'));

    const res = await request(app).post('/users').send(validBody);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      code: 'internal_error',
      message: 'Something went wrong',
    });
    expect(JSON.stringify(res.body)).not.toContain('secret');

    errorSpy.mockRestore();
  });
});

describe('POST /auth/login', () => {
  const PASSWORD = 'correct-horse-1';
  const HASH = bcrypt.hashSync(PASSWORD, 4); // low rounds keep the tests fast

  const authUser = (overrides = {}) => ({
    id: 147,
    name: 'Tamaki',
    email: 'tamaki@gmail.com',
    password_hash: HASH,
    is_locked: 0,
    lock_expired: 0,
    ...overrides,
  });

  const safeUser = { id: 147, name: 'Tamaki', email: 'tamaki@gmail.com' };

  test('returns 400 with field details when the body is empty', async () => {
    const res = await request(app).post('/auth/login').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('validation_failed');
    expect(Object.keys(res.body.fields)).toEqual(
      expect.arrayContaining(['email', 'password'])
    );
    expect(userModel.findAuthByEmail).not.toHaveBeenCalled();
  });

  test('returns 401 invalid_credentials for an unknown email', async () => {
    userModel.findAuthByEmail.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: PASSWORD });

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('invalid_credentials');
    expect(userModel.recordFailedLogin).not.toHaveBeenCalled();
    expect(sessionModel.create).not.toHaveBeenCalled();
  });

  test('returns the same error for a wrong password and counts the failure', async () => {
    userModel.findAuthByEmail.mockResolvedValue(authUser());

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'tamaki@gmail.com', password: 'wrong-password' });

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('invalid_credentials');
    expect(res.body.message).toBe('Invalid email or password');
    expect(userModel.recordFailedLogin).toHaveBeenCalledWith(147);
    expect(sessionModel.create).not.toHaveBeenCalled();
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('rejects password login for accounts with no password (provider-only)', async () => {
    userModel.findAuthByEmail.mockResolvedValue(authUser({ password_hash: null }));

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'tamaki@gmail.com', password: PASSWORD });

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('invalid_credentials');
    expect(sessionModel.create).not.toHaveBeenCalled();
  });

  test('returns 429 while the account is locked, even with the right password', async () => {
    userModel.findAuthByEmail.mockResolvedValue(authUser({ is_locked: 1 }));

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'tamaki@gmail.com', password: PASSWORD });

    expect(res.statusCode).toBe(429);
    expect(res.body.code).toBe('too_many_attempts');
    expect(sessionModel.create).not.toHaveBeenCalled();
  });

  test('resets the counter when a lock has expired', async () => {
    userModel.findAuthByEmail.mockResolvedValue(authUser({ lock_expired: 1 }));

    await request(app)
      .post('/auth/login')
      .send({ email: 'tamaki@gmail.com', password: 'wrong-password' });

    // Cleared first, then the new failure is counted from zero
    expect(userModel.clearFailedLogins).toHaveBeenCalledWith(147);
    expect(userModel.recordFailedLogin).toHaveBeenCalledWith(147);
  });

  test('logs in: returns a valid access token, user, and an HttpOnly refresh cookie', async () => {
    userModel.findAuthByEmail.mockResolvedValue(authUser());
    userModel.findById.mockResolvedValue(safeUser);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'tamaki@gmail.com', password: PASSWORD });

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toEqual(safeUser);

    const payload = jwt.verify(res.body.accessToken, process.env.ACCESS_TOKEN_SECRET);
    expect(payload.sub).toBe('147');
    expect(payload.exp - payload.iat).toBe(15 * 60);

    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/^refresh_token=[0-9a-f]{96};/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Path=/auth');

    expect(userModel.clearFailedLogins).toHaveBeenCalledWith(147);
    expect(sessionModel.create).toHaveBeenCalledTimes(1);
    // Only a hash is stored, never the cookie value itself
    const stored = sessionModel.create.mock.calls[0][0];
    expect(stored.userId).toBe(147);
    expect(stored.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(cookie).not.toContain(stored.tokenHash);
  });
});

describe('GET /auth/me', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).get('/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('unauthorized');
  });

  test('returns 401 for a malformed token', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer abc.def.ghi');

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('invalid_token');
  });

  test('returns 401 for a token with a tampered signature', async () => {
    const token = signAccessToken(147);
    const tampered = token.slice(0, -3) + (token.endsWith('abc') ? 'xyz' : 'abc');

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${tampered}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('invalid_token');
  });

  test('returns 401 for an expired token', async () => {
    const expired = jwt.sign({ sub: '147' }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: -10,
    });

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${expired}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('invalid_token');
  });

  test('returns 401 for a token signed with a different secret', async () => {
    const forged = jwt.sign({ sub: '147' }, 'some-other-secret', { expiresIn: '15m' });

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${forged}`);

    expect(res.statusCode).toBe(401);
    expect(userModel.findById).not.toHaveBeenCalled();
  });

  test('returns the user for a valid token', async () => {
    const user = { id: 147, name: 'Tamaki', email: 'tamaki@gmail.com' };
    userModel.findById.mockResolvedValue(user);

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${signAccessToken(147)}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(user);
    expect(userModel.findById).toHaveBeenCalledWith(147);
  });
});

describe('POST /auth/refresh', () => {
  const futureDate = () => new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = (overrides = {}) => ({
    id: 7,
    user_id: 147,
    revoked_at: null,
    expires_at: futureDate(),
    ...overrides,
  });
  const user = { id: 147, name: 'Tamaki', email: 'tamaki@gmail.com' };

  test('returns 401 no_refresh_token without a cookie', async () => {
    const res = await request(app).post('/auth/refresh').send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('no_refresh_token');
    expect(sessionModel.findByHash).not.toHaveBeenCalled();
  });

  test('returns 401 invalid_refresh_token for an unknown token, without clearing the cookie', async () => {
    sessionModel.findByHash.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', 'refresh_token=unknown')
      .send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('invalid_refresh_token');
    // A lost race must not delete the cookie the winning tab just received
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('returns 401 session_expired for a revoked session and clears the cookie', async () => {
    sessionModel.findByHash.mockResolvedValue(session({ revoked_at: new Date() }));

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', 'refresh_token=abc')
      .send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('session_expired');
    expect(res.headers['set-cookie'][0]).toContain('refresh_token=;');
    expect(sessionModel.rotate).not.toHaveBeenCalled();
  });

  test('returns 401 session_expired for an expired session', async () => {
    sessionModel.findByHash.mockResolvedValue(
      session({ expires_at: new Date(Date.now() - 1000) })
    );

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', 'refresh_token=abc')
      .send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('session_expired');
  });

  test('rotates the token: new access token, new cookie, old hash replaced', async () => {
    sessionModel.findByHash.mockResolvedValue(session());
    userModel.findById.mockResolvedValue(user);
    sessionModel.rotate.mockResolvedValue(1);

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', 'refresh_token=old-token')
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toEqual(user);
    const payload = jwt.verify(res.body.accessToken, process.env.ACCESS_TOKEN_SECRET);
    expect(payload.sub).toBe('147');

    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/^refresh_token=[0-9a-f]{96};/);
    expect(cookie).not.toContain('old-token');
    expect(cookie).toContain('HttpOnly');

    const args = sessionModel.rotate.mock.calls[0][0];
    expect(args.id).toBe(7);
    expect(args.newHash).not.toBe(args.oldHash);
  });

  test('returns 401 without touching the cookie when another request rotated first', async () => {
    sessionModel.findByHash.mockResolvedValue(session());
    userModel.findById.mockResolvedValue(user);
    sessionModel.rotate.mockResolvedValue(0); // lost the race

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', 'refresh_token=old-token')
      .send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('invalid_refresh_token');
    expect(res.headers['set-cookie']).toBeUndefined();
  });
});

describe('POST /auth/logout', () => {
  test('revokes the session and clears the cookie', async () => {
    sessionModel.findByHash.mockResolvedValue({ id: 7 });

    const res = await request(app)
      .post('/auth/logout')
      .set('Cookie', 'refresh_token=abc')
      .send({});

    expect(res.statusCode).toBe(204);
    expect(sessionModel.revoke).toHaveBeenCalledWith(7);
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toContain('refresh_token=;');
    expect(cookie).toContain('Path=/auth');
  });

  test('still returns 204 and clears the cookie when there is no session', async () => {
    const res = await request(app).post('/auth/logout').send({});

    expect(res.statusCode).toBe(204);
    expect(sessionModel.revoke).not.toHaveBeenCalled();
    expect(res.headers['set-cookie'][0]).toContain('refresh_token=;');
  });
});

describe('unknown routes', () => {
  test('returns 404 as JSON', async () => {
    const res = await request(app).get('/nope');

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('route_not_found');
  });
});