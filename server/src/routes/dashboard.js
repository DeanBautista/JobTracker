const express = require('express');
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/dashboardController');

const router = express.Router();

router.get('/funnel', requireAuth, c.getFunnel);
router.get('/weekly', requireAuth, c.getWeekly);
router.get('/breakdown', requireAuth, c.getBreakdown);
router.get('/stats', requireAuth, c.getStats);
router.get('/has-jobs', requireAuth, c.getHasJobs);

module.exports = router;