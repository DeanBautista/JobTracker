const express = require('express');
const c = require('../controllers/oauthController');

const router = express.Router();

router.get('/google', c.googleStart);
router.get('/google/callback', c.googleCallback);
router.get('/github', c.githubStart);
router.get('/github/callback', c.githubCallback);

module.exports = router;