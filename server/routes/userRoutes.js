const express = require('express');
const router = express.Router();
const {
    getUserDashboard,
    getUserSubscription,
    updateUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getUserDashboard);
router.get('/subscription', protect, getUserSubscription);
router.patch('/profile', protect, updateUserProfile);

module.exports = router;
