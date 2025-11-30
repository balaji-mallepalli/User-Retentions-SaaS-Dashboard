const UsageEvent = require('../models/UsageEvent');
const mongoose = require('mongoose');

// Ingest a usage event. Can be called with an ingest API key or an authenticated user.
const ingestEvent = async (req, res) => {
    try {
        const { userId, productId, eventType, value = 1, metadata } = req.body;

        // Prefer authenticated user if available
        const uid = req.user?.id || userId;

        if (!productId || !eventType) {
            return res.status(400).json({ message: 'productId and eventType are required' });
        }

        const event = await UsageEvent.create({
            userId: uid ? mongoose.Types.ObjectId(uid) : undefined,
            productId,
            eventType,
            value,
            metadata,
        });

        res.status(201).json(event);
    } catch (error) {
        console.error('Ingest error:', error);
        res.status(500).json({ message: error.message || 'Server error during ingest' });
    }
};

// Get usage aggregated for the authenticated user
const getUserUsage = async (req, res) => {
    try {
        const userId = req.user.id;

        const agg = await UsageEvent.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$productId', totalValue: { $sum: '$value' }, count: { $sum: 1 } } },
            { $project: { productId: '$_id', totalValue: 1, count: 1, _id: 0 } },
        ]);

        res.status(200).json({ usageByProduct: agg });
    } catch (error) {
        console.error('User usage error:', error);
        res.status(500).json({ message: error.message || 'Server error during user usage fetch' });
    }
};

// Admin: get global usage metrics
const getGlobalUsage = async (req, res) => {
    try {
        const totalEventsRes = await UsageEvent.aggregate([
            { $group: { _id: null, totalEvents: { $sum: '$value' }, eventsCount: { $sum: 1 } } },
        ]);

        const uniqueUsersRes = await UsageEvent.aggregate([
            { $match: { userId: { $ne: null } } },
            { $group: { _id: '$userId' } },
            { $count: 'uniqueUsers' },
        ]);

        const topProducts = await UsageEvent.aggregate([
            { $group: { _id: '$productId', totalValue: { $sum: '$value' }, events: { $sum: 1 } } },
            { $sort: { totalValue: -1 } },
            { $limit: 10 },
            { $project: { productId: '$_id', totalValue: 1, events: 1, _id: 0 } },
        ]);

        res.status(200).json({
            totals: totalEventsRes[0] || { totalEvents: 0, eventsCount: 0 },
            uniqueUsers: uniqueUsersRes[0]?.uniqueUsers || 0,
            topProducts,
        });
    } catch (error) {
        console.error('Global usage error:', error);
        res.status(500).json({ message: error.message || 'Server error during global usage fetch' });
    }
};

module.exports = {
    ingestEvent,
    getUserUsage,
    getGlobalUsage,
};
