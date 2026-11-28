const request = require('supertest');
const { signAccessToken } = require('../utils/tokens');
const detail = require('../models/jobDetailModel');
const app = require('../app');

const auth = () => ({ Authorization: `Bearer ${signAccessToken(147, 1)}` });

const reminder = { id: '9', title: 'Follow up', note: '', origin: 'manual', status: 'pending', hasTime: true };
const result = { reminder, remindersCount: 1 };

describe('POST /jobs/:id/reminders', () => {
  const body = { title: 'Follow up', dueAt: '2026-12-01T01:00:00.000Z' };

  test('returns 401 without a token', async () => {
    const res = await request(app).post('/jobs/5/reminders').send(body);

    expect(res.statusCode).toBe(401);
    expect(detail.createReminder).not.toHaveBeenCalled();
  });

  test('returns 422 for an invalid job id', async () => {
    const res = await request(app).post('/jobs/abc/reminders').set(auth()).send(body);

    expect(res.statusCode).toBe(422);
    expect(res.body.code).toBe('invalid_id');
    expect(detail.createReminder).not.toHaveBeenCalled();
  });

  test('returns 422 with field errors when title and dueAt are missing', async () => {
    const res = await request(app).post('/jobs/5/reminders').set(auth()).send({});

    expect(res.statusCode).toBe(422);
    expect(Object.keys(res.body.fields)).toEqual(expect.arrayContaining(['title', 'dueAt']));
    expect(detail.createReminder).not.toHaveBeenCalled();
  });

  test('returns 422 when dueAt has no timezone', async () => {
    const res = await request(app)
      .post('/jobs/5/reminders')
      .set(auth())
      .send({ ...body, dueAt: '2026-12-01T09:00' });

    expect(res.statusCode).toBe(422);
    expect(res.body.fields.dueAt).toBeDefined();
    expect(detail.createReminder).not.toHaveBeenCalled();
  });

  test('returns 422 when the title or note is too long', async () => {
    const res = await request(app)
      .post('/jobs/5/reminders')
      .set(auth())
      .send({ ...body, title: 'x'.repeat(161), note: 'x'.repeat(1001) });

    expect(res.statusCode).toBe(422);
    expect(res.body.fields.title).toBeDefined();
    expect(res.body.fields.note).toBeDefined();
  });

  test('returns 404 when the job is missing, archived or in trash', async () => {
    detail.createReminder.mockResolvedValue(null);

    const res = await request(app).post('/jobs/5/reminders').set(auth()).send(body);

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('job_not_found');
  });

  test('creates the reminder and returns 201', async () => {
    detail.createReminder.mockResolvedValue(result);

    const res = await request(app).post('/jobs/5/reminders').set(auth()).send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(result);
    expect(detail.createReminder).toHaveBeenCalledWith(147, 5, {
      title: 'Follow up',
      due_at: '2026-12-01 01:00:00',
    });
  });

  test('converts a zoned dueAt to UTC and cleans the fields', async () => {
    detail.createReminder.mockResolvedValue(result);

    await request(app)
      .post('/jobs/5/reminders')
      .set(auth())
      .send({ title: '  Follow up  ', dueAt: '2026-12-01T09:00:00+08:00', note: '   ' });

    expect(detail.createReminder).toHaveBeenCalledWith(147, 5, {
      title: 'Follow up',
      due_at: '2026-12-01 01:00:00',
      note: null,
    });
  });

  test('ignores origin and user id sent in the body', async () => {
    detail.createReminder.mockResolvedValue(result);

    await request(app)
      .post('/jobs/5/reminders')
      .set(auth())
      .send({ ...body, origin: 'auto_stale', user_id: 999, status: 'done' });

    // Exact match: nothing but title and due_at reaches the model.
    expect(detail.createReminder).toHaveBeenCalledWith(147, 5, {
      title: 'Follow up',
      due_at: '2026-12-01 01:00:00',
    });
  });
});

describe('PATCH /jobs/:id/reminders/:reminderId', () => {
  test('returns 422 for an invalid reminder id', async () => {
    const res = await request(app).patch('/jobs/5/reminders/abc').set(auth()).send({ title: 'New' });

    expect(res.statusCode).toBe(422);
    expect(res.body.code).toBe('invalid_reminder_id');
    expect(detail.updateReminder).not.toHaveBeenCalled();
  });

  test('returns 422 when there is nothing to update', async () => {
    const res = await request(app).patch('/jobs/5/reminders/9').set(auth()).send({});

    expect(res.statusCode).toBe(422);
    expect(res.body.code).toBe('nothing_to_update');
    expect(detail.updateReminder).not.toHaveBeenCalled();
  });

  test('returns 422 for an invalid dueAt', async () => {
    const res = await request(app).patch('/jobs/5/reminders/9').set(auth()).send({ dueAt: 'tomorrow' });

    expect(res.statusCode).toBe(422);
    expect(res.body.fields.dueAt).toBeDefined();
  });

  test('returns 404 when the reminder is not found', async () => {
    detail.updateReminder.mockResolvedValue(null);

    const res = await request(app).patch('/jobs/5/reminders/9').set(auth()).send({ title: 'New' });

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('reminder_not_found');
  });

  test('sends only the fields that changed', async () => {
    detail.updateReminder.mockResolvedValue(result);

    const res = await request(app).patch('/jobs/5/reminders/9').set(auth()).send({ title: 'New title' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(result);
    expect(detail.updateReminder).toHaveBeenCalledWith(147, 5, 9, { title: 'New title' });
  });

  test('stores a new dueAt as UTC', async () => {
    detail.updateReminder.mockResolvedValue(result);

    await request(app)
      .patch('/jobs/5/reminders/9')
      .set(auth())
      .send({ dueAt: '2026-12-02T09:00:00+08:00' });

    expect(detail.updateReminder).toHaveBeenCalledWith(147, 5, 9, { due_at: '2026-12-02 01:00:00' });
  });
});

describe('PATCH /jobs/:id/reminders/:reminderId/status', () => {
  test.each([[{}], [{ status: 'dismissed' }], [{ status: 'DONE' }]])('returns 422 for %j', async (payload) => {
    const res = await request(app).patch('/jobs/5/reminders/9/status').set(auth()).send(payload);

    expect(res.statusCode).toBe(422);
    expect(res.body.code).toBe('invalid_status');
    expect(detail.setReminderStatus).not.toHaveBeenCalled();
  });

  test('returns 404 when the reminder is not found', async () => {
    detail.setReminderStatus.mockResolvedValue(null);

    const res = await request(app).patch('/jobs/5/reminders/9/status').set(auth()).send({ status: 'done' });

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('reminder_not_found');
  });

  test.each(['done', 'pending'])('sets the status to %s', async (status) => {
    detail.setReminderStatus.mockResolvedValue(result);

    const res = await request(app).patch('/jobs/5/reminders/9/status').set(auth()).send({ status });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(result);
    expect(detail.setReminderStatus).toHaveBeenCalledWith(147, 5, 9, status);
  });
});

describe('PATCH /jobs/:id/reminders/:reminderId/snooze', () => {
  test('returns 404 when the reminder is not found or not pending', async () => {
    detail.snoozeReminder.mockResolvedValue(null);

    const res = await request(app).patch('/jobs/5/reminders/9/snooze').set(auth());

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('reminder_not_found');
  });

  test('snoozes the reminder', async () => {
    detail.snoozeReminder.mockResolvedValue(result);

    const res = await request(app).patch('/jobs/5/reminders/9/snooze').set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(result);
    expect(detail.snoozeReminder).toHaveBeenCalledWith(147, 5, 9);
  });
});

describe('DELETE /jobs/:id/reminders/:reminderId', () => {
  test('returns 404 when the reminder is not found', async () => {
    detail.deleteReminder.mockResolvedValue(null);

    const res = await request(app).delete('/jobs/5/reminders/9').set(auth());

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('reminder_not_found');
  });

  test('deletes the reminder and returns its id with the new count', async () => {
    detail.deleteReminder.mockResolvedValue({ id: '9', remindersCount: 0 });

    const res = await request(app).delete('/jobs/5/reminders/9').set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: '9', remindersCount: 0 });
    expect(detail.deleteReminder).toHaveBeenCalledWith(147, 5, 9);
  });
});

describe('GET /jobs/:id/next-up', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).get('/jobs/5/next-up');

    expect(res.statusCode).toBe(401);
  });

  test('returns 404 when the job is not owned by the user', async () => {
    detail.owns.mockResolvedValue(false);

    const res = await request(app).get('/jobs/5/next-up').set(auth());

    expect(res.statusCode).toBe(404);
    expect(res.body.code).toBe('job_not_found');
    expect(detail.getNextUp).not.toHaveBeenCalled();
  });

  test('returns the next interview and reminder', async () => {
    const nextUp = { interview: null, reminder: { id: '9', title: 'Follow up', dueAt: '2026-12-01T01:00:00Z', hasTime: true } };
    detail.owns.mockResolvedValue(true);
    detail.getNextUp.mockResolvedValue(nextUp);

    const res = await request(app).get('/jobs/5/next-up').set(auth());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ nextUp });
    expect(detail.getNextUp).toHaveBeenCalledWith(147, 5);
  });
});