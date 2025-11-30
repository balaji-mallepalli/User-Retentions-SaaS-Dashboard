const express = require('express');
const router = express.Router();
const { createKey, listKeys, disableKey } = require('../controllers/apiKeyController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Admin endpoints to manage API keys
router.post('/', protect, admin, createKey);
router.get('/', protect, admin, listKeys);
router.patch('/:id/disable', protect, admin, disableKey);

module.exports = router;
