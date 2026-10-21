const express = require('express');
const knex = require('./db/knex');

const app = express();
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

module.exports = app;