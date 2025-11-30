const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/debugController');
const { apiKeyOrAuth } = require('../middleware/apiKeyOrAuth');

// Protected debug stats (accepts API key or JWT)
router.get('/stats', apiKeyOrAuth, getStats);

module.exports = router;
