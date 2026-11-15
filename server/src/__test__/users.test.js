const request = require('supertest');
const userModel = require('../models/userModel');
const userTokenModel = require('../models/userTokenModel');
const { sendVerificationEmail } = require('../utils/mailer');
const AppError = require('../utils/AppError');
const app = require('../app');

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

  test('sends a verification email after creating the user', async () => {
    const created = { id: 1, name: 'Ana Cruz', email: 'ana@example.com' };
    userModel.create.mockResolvedValue(created);
    userTokenModel.createVerifyToken.mockResolvedValue('raw-token');

    await request(app).post('/users').send(validBody);

    expect(userTokenModel.createVerifyToken).toHaveBeenCalledWith(1);
    expect(sendVerificationEmail).toHaveBeenCalledWith({
      to: 'ana@example.com',
      name: 'Ana Cruz',
      token: 'raw-token',
    });
  });

  test('still returns 201 when the verification email fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    userModel.create.mockResolvedValue({ id: 1, name: 'Ana Cruz', email: 'ana@example.com' });
    userTokenModel.createVerifyToken.mockResolvedValue('raw-token');
    sendVerificationEmail.mockRejectedValue(new Error('Brevo down'));

    const res = await request(app).post('/users').send(validBody);

    expect(res.statusCode).toBe(201);
    errorSpy.mockRestore();
  });
});