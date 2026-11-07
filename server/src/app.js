const express = require('express');
const cors = require('cors');
const knex = require('./db/knex');
const usersRouter = require('./routes/users');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // required because the client uses withCredentials
  })
);
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await knex.raw('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error(err);
    res.status(503).json({ status: 'error', db: 'unreachable' });
  }
});

app.use('/users', usersRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;