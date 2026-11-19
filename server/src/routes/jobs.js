const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createJob, listJobs, moveJob } = require('../controllers/jobController');

const router = express.Router();

router.get('/', requireAuth, listJobs);
router.post('/', requireAuth, createJob);
router.patch('/:id/move', requireAuth, moveJob);

module.exports = router;