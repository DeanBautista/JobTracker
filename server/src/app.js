const express = require('express');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/jobs', (req, res) => {
  res.json([{ id: 1, title: 'Frontend Developer', company: 'Northwind' }]);
});

app.post('/api/jobs', (req, res) => {
  res.status(201).json({ id: 2, ...req.body });
});

module.exports = app;