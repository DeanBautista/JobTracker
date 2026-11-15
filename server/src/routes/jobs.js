const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createJob, listJobs } = require('../controllers/jobController');

const router = express.Router();

router.get('/', requireAuth, listJobs);
router.post('/', requireAuth, createJob);

module.exports = router;