const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Stats = require('../models/Stats');

// @desc    Get all users
// @route   GET /admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
};

// @desc    Get single user
// @route   GET /admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user role
// @route   PATCH /admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = req.body.role || user.role;
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

// @desc    Update user plan
// @route   PATCH /admin/users/:id/plan
// @access  Private/Admin
const updateUserPlan = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.plan = req.body.plan || user.plan;
        const updatedUser = await user.save();

        // Also update or create subscription record
        let subscription = await Subscription.findOne({ userId: user._id });
        if (!subscription) {
            subscription = new Subscription({
                userId: user._id,
                plan: user.plan,
                amount: 0,
                startDate: Date.now(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
        } else {
            subscription.plan = user.plan;
        }
        await subscription.save();

        res.status(200).json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Delete user
// @route   DELETE /admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.status(200).json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Get global stats
// @route   GET /admin/stats/global
// @access  Private/Admin
const getGlobalStats = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Subscription.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const growthData = [
        { name: 'Jan', users: 10 },
        { name: 'Feb', users: 20 },
        { name: 'Mar', users: 15 },
        { name: 'Apr', users: 30 },
        { name: 'May', users: 40 },
        { name: 'Jun', users: 55 },
    ];

    res.status(200).json({
        totalUsers,
        revenue: totalRevenue[0]?.total || 0,
        growth: growthData,
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserPlan,
    deleteUser,
    getGlobalStats,
};
