const express = require('express');
const router = express.Router();
const { ingestEvent, getUserUsage, getGlobalUsage } = require('../controllers/usageController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const { apiKeyOrAuth } = require('../middleware/apiKeyOrAuth');

// Allow ingestion either with a valid DB/API key header or an authenticated user.
router.post('/', apiKeyOrAuth, ingestEvent);
router.get('/user', protect, getUserUsage);
router.get('/admin/global', protect, admin, getGlobalUsage);

module.exports = router;
