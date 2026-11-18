const request = require('supertest');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const userTokenModel = require('../models/userTokenModel');
const sessionModel = require('../models/sessionModel');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/mailer');
const app = require('../app');

describe('POST /auth/verify-email', () => {
  test('returns 400 invalid_token when the token is missing', async () => {
    const res = await request(app).post('/auth/verify-email').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('invalid_token');
    expect(userTokenModel.verifyEmail).not.toHaveBeenCalled();
  });

  test('returns 400 invalid_token for an unknown, used or expired token', async () => {
    userTokenModel.verifyEmail.mockResolvedValue(null);

    const res = await request(app).post('/auth/verify-email').send({ token: 'bad-token' });

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('invalid_token');
    expect(sessionModel.create).not.toHaveBeenCalled();
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('verifies the email and signs the user in', async () => {
    const user = { id: 147, name: 'Tamaki', email: 'tamaki@gmail.com' };
    userTokenModel.verifyEmail.mockResolvedValue(147);
    userModel.findById.mockResolvedValue(user);

    const res = await request(app).post('/auth/verify-email').send({ token: 'good-token' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toEqual(user);
    const payload = jwt.verify(res.body.accessToken, process.env.ACCESS_TOKEN_SECRET);
    expect(payload.sub).toBe('147');
    expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(userTokenModel.verifyEmail).toHaveBeenCalledWith('good-token');
    expect(sessionModel.create).toHaveBeenCalledTimes(1);
  });
});

describe('POST /auth/resend-verification', () => {
  const unverified = { id: 147, name: 'Tamaki', email: 'tamaki@gmail.com', email_verified_at: null };

  test('returns 400 when the email is missing', async () => {
    const res = await request(app).post('/auth/resend-verification').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('invalid_email');
  });

  test('answers 204 without sending for an unknown email', async () => {
    userModel.findByEmail.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/auth/resend-verification')
      .send({ email: 'nobody@example.com' });

    expect(res.statusCode).toBe(204);
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  test('answers 204 without sending for an already verified account', async () => {
    userModel.findByEmail.mockResolvedValue({ ...unverified, email_verified_at: new Date() });

    const res = await request(app)
      .post('/auth/resend-verification')
      .send({ email: 'tamaki@gmail.com' });

    expect(res.statusCode).toBe(204);
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  test('answers 204 without sending during the cooldown', async () => {
    userModel.findByEmail.mockResolvedValue(unverified);
    userTokenModel.sentRecently.mockResolvedValue(true);

    const res = await request(app)
      .post('/auth/resend-verification')
      .send({ email: 'tamaki@gmail.com' });

    expect(res.statusCode).toBe(204);
    expect(userTokenModel.invalidateVerifyTokens).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  test('invalidates old links and sends a new one for an unverified account', async () => {
    userModel.findByEmail.mockResolvedValue(unverified);
    userTokenModel.sentRecently.mockResolvedValue(false);
    userTokenModel.createVerifyToken.mockResolvedValue('new-token');

    const res = await request(app)
      .post('/auth/resend-verification')
      .send({ email: 'tamaki@gmail.com' });

    expect(res.statusCode).toBe(204);
    expect(userTokenModel.invalidateVerifyTokens).toHaveBeenCalledWith(147);
    expect(sendVerificationEmail).toHaveBeenCalledWith({
      to: 'tamaki@gmail.com',
      name: 'Tamaki',
      token: 'new-token',
    });
  });
});

describe('POST /auth/forgot-password', () => {
  const user = { id: 147, name: 'Tamaki', email: 'tamaki@gmail.com' };

  test('returns 400 for an invalid email', async () => {
    const res = await request(app).post('/auth/forgot-password').send({ email: 'nope' });

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('validation_failed');
  });

  test('answers 204 without sending for an unknown email', async () => {
    userModel.findByEmail.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'nobody@example.com' });

    expect(res.statusCode).toBe(204);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  test('answers 204 without sending during the cooldown', async () => {
    userModel.findByEmail.mockResolvedValue(user);
    userTokenModel.sentRecently.mockResolvedValue(true);

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'tamaki@gmail.com' });

    expect(res.statusCode).toBe(204);
    expect(userTokenModel.sentRecently).toHaveBeenCalledWith(147, 60, 'reset_password');
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  test('invalidates old links and emails a new one', async () => {
    userModel.findByEmail.mockResolvedValue(user);
    userTokenModel.sentRecently.mockResolvedValue(false);
    userTokenModel.createResetToken.mockResolvedValue('reset-token');

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'tamaki@gmail.com' });

    expect(res.statusCode).toBe(204);
    expect(userTokenModel.invalidateResetTokens).toHaveBeenCalledWith(147);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith({
      to: 'tamaki@gmail.com',
      name: 'Tamaki',
      token: 'reset-token',
    });
  });

  test('still answers 204 when the email fails to send', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    userModel.findByEmail.mockResolvedValue(user);
    userTokenModel.sentRecently.mockResolvedValue(false);
    userTokenModel.createResetToken.mockResolvedValue('reset-token');
    sendPasswordResetEmail.mockRejectedValue(new Error('Brevo down'));

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'tamaki@gmail.com' });

    expect(res.statusCode).toBe(204);
    errorSpy.mockRestore();
  });

  test('forgot-password sends nothing for the demo user', async () => {
    userModel.findByEmail.mockResolvedValue({ id: 165, email: 'demo.account@gmail.com', is_demo: 1 });

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'demo.account@gmail.com' });

    expect(res.statusCode).toBe(204);
    expect(userTokenModel.createResetToken).not.toHaveBeenCalled();
  });
});

describe('POST /auth/reset-password', () => {
  test('returns 400 invalid_token when the token is missing', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ password: 'new-password-1' });

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('invalid_token');
    expect(userTokenModel.resetPassword).not.toHaveBeenCalled();
  });

  test('returns 400 with field details for a weak password, without using the token', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'good-token', password: 'short' });

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('validation_failed');
    expect(res.body.fields.password).toBeDefined();
    expect(userTokenModel.resetPassword).not.toHaveBeenCalled();
  });

  test('returns 400 invalid_token for an unknown, used or expired token', async () => {
    userModel.hashPassword.mockResolvedValue('new-hash');
    userTokenModel.resetPassword.mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'bad-token', password: 'new-password-1' });

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('invalid_token');
  });

  test('resets the password, clears the refresh cookie, and does not sign in', async () => {
    userModel.hashPassword.mockResolvedValue('new-hash');
    userTokenModel.resetPassword.mockResolvedValue(147);

    const res = await request(app)
      .post('/auth/reset-password')
      .set('Cookie', 'refresh_token=abc')
      .send({ token: 'good-token', password: 'new-password-1' });

    expect(res.statusCode).toBe(204);
    expect(userModel.hashPassword).toHaveBeenCalledWith('new-password-1');
    expect(userTokenModel.resetPassword).toHaveBeenCalledWith('good-token', 'new-hash');
    expect(res.headers['set-cookie'][0]).toContain('refresh_token=;');
    expect(sessionModel.create).not.toHaveBeenCalled();
  });
});