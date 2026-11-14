const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createJob } = require('../controllers/jobController');

const router = express.Router();

router.post('/', requireAuth, createJob);

module.exports = router;