const express = require('express');
const router = express.Router();
const { getDAU, getMAU, getStickiness, getFeatureUsage, getCohorts } = require('../controllers/metricsController');
const { admin } = require('../middleware/adminMiddleware');
const { apiKeyOrAuth } = require('../middleware/apiKeyOrAuth');

// Allow either API key or JWT for metrics read endpoints
router.get('/dau', apiKeyOrAuth, getDAU);
router.get('/mau', apiKeyOrAuth, getMAU);
router.get('/stickiness', apiKeyOrAuth, getStickiness);
router.get('/feature-usage', apiKeyOrAuth, getFeatureUsage);
router.get('/cohorts', apiKeyOrAuth, admin, getCohorts);

module.exports = router;
