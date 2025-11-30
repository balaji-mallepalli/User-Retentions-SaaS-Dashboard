const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Stats = require('../models/Stats');
const bcrypt = require('bcryptjs');

// @desc    Get user dashboard data
// @route   GET /user/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    const stats = await Stats.findOne({ userId: req.user.id });

    res.status(200).json({
        user: req.user,
        subscription,
        stats,
    });
};

// @desc    Get user subscription
// @route   GET /user/subscription
// @access  Private
const getUserSubscription = async (req, res) => {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    res.status(200).json(subscription);
};

// @desc    Update user profile
// @route   PATCH /user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

module.exports = {
    getUserDashboard,
    getUserSubscription,
    updateUserProfile,
};
