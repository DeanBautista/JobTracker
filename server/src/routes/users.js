const express = require('express');
const { createUser, completeOnboarding } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', createUser);
router.post('/me/onboarding', requireAuth, completeOnboarding);

module.exports = router;