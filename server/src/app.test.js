const request = require('supertest');
const app = require('./app');

test('GET /health', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('ok');
});

test('GET /api/jobs', async () => {
  const res = await request(app).get('/api/jobs');
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveLength(1);
});

test('POST /api/jobs', async () => {
  const res = await request(app)
    .post('/api/jobs')
    .send({ title: 'QA Engineer', company: 'Brightside' });
  expect(res.statusCode).toBe(201);
  expect(res.body.title).toBe('QA Engineer');
});