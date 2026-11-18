const express = require('express');
const { resetDemo } = require('../controllers/demoController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/reset', requireAuth, resetDemo);

module.exports = router;