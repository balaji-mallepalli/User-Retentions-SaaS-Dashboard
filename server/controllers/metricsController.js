const UsageEvent = require('../models/UsageEvent');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper: build array of dates between start and end (inclusive)
const getDateRange = (start, end) => {
    const dates = [];
    const cur = new Date(start);
    while (cur <= end) {
        dates.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return dates;
};

// GET /metrics/dau?days=14
const getDAU = async (req, res) => {
    try {
        const days = parseInt(req.query.days, 10) || 14;
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));

        const pipeline = [
            { $match: { createdAt: { $gte: start, $lte: end }, userId: { $ne: null } } },
            { $project: { userId: 1, day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
            { $group: { _id: { day: '$day' }, users: { $addToSet: '$userId' } } },
            { $project: { day: '$_id.day', count: { $size: '$users' }, _id: 0 } },
            { $sort: { day: 1 } },
        ];

        const results = await UsageEvent.aggregate(pipeline);

        // Fill missing days with zero
        const daysArr = getDateRange(start, end).map((d) => d.toISOString().slice(0, 10));
        const map = new Map(results.map(r => [r.day, r.count]));
        const data = daysArr.map(day => ({ day, count: map.get(day) || 0 }));

        res.json({ data });
    } catch (error) {
        console.error('getDAU error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /metrics/mau?months=1
const getMAU = async (req, res) => {
    try {
        const months = parseInt(req.query.months, 10) || 1;
        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - months + 1);
        start.setDate(1);

        const agg = await UsageEvent.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, userId: { $ne: null } } },
            { $group: { _id: null, users: { $addToSet: '$userId' } } },
            { $project: { mau: { $size: '$users' }, _id: 0 } },
        ]);

        res.json({ mau: agg[0]?.mau || 0 });
    } catch (error) {
        console.error('getMAU error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /metrics/stickiness -> DAU / MAU (last 30 days)
const getStickiness = async (req, res) => {
    try {
        const dauRes = await UsageEvent.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, userId: { $ne: null } } },
            { $project: { userId: 1, day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
            { $group: { _id: { day: '$day' }, users: { $addToSet: '$userId' } } },
            { $project: { day: '$_id.day', count: { $size: '$users' }, _id: 0 } },
        ]);

        const avgDAU = dauRes.reduce((s, r) => s + r.count, 0) / (dauRes.length || 1);

        const mauRes = await UsageEvent.aggregate([
            { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, userId: { $ne: null } } },
            { $group: { _id: null, users: { $addToSet: '$userId' } } },
            { $project: { mau: { $size: '$users' }, _id: 0 } },
        ]);

        const mau = mauRes[0]?.mau || 0;
        const stickiness = mau ? (avgDAU / mau) : 0;

        res.json({ avgDAU, mau, stickiness });
    } catch (error) {
        console.error('getStickiness error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /metrics/feature-usage
const getFeatureUsage = async (req, res) => {
    try {
        const agg = await UsageEvent.aggregate([
            { $group: { _id: '$eventType', total: { $sum: '$value' }, count: { $sum: 1 } } },
            { $project: { eventType: '$_id', total: 1, count: 1, _id: 0 } },
            { $sort: { total: -1 } },
        ]);

        res.json({ features: agg });
    } catch (error) {
        console.error('getFeatureUsage error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /metrics/cohorts?days=30
// Returns cohorts by signup day with retention at day 0,1,7,30
const getCohorts = async (req, res) => {
    try {
        const days = parseInt(req.query.days, 10) || 30;
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));

        // Get users created in range
        const users = await User.find({ createdAt: { $gte: start, $lte: end } }).select('_id createdAt');

        // Build map of cohorts by day
        const cohorts = {};
        users.forEach(u => {
            const day = u.createdAt.toISOString().slice(0, 10);
            cohorts[day] = cohorts[day] || { users: [], counts: {} };
            cohorts[day].users.push(u._id.toString());
        });

        const retentionDays = [0, 1, 7, 30];

        // For each cohort day, compute retention
        const result = [];
        for (const day of Object.keys(cohorts).sort()) {
            const cohortUsers = cohorts[day].users;
            const cohortDate = new Date(day + 'T00:00:00Z');
            const row = { cohortDay: day, size: cohortUsers.length };
            for (const d of retentionDays) {
                const from = new Date(cohortDate);
                from.setDate(from.getDate() + d);
                const to = new Date(from);
                to.setDate(to.getDate() + 1);

                const matched = await UsageEvent.countDocuments({
                    userId: { $in: cohortUsers.map(id => mongoose.Types.ObjectId(id)) },
                    createdAt: { $gte: from, $lt: to },
                });

                // retention percent: users who had at least one event that day
                // To compute percent, we need distinct users — do aggregation
                const distinctUsers = await UsageEvent.aggregate([
                    { $match: { userId: { $in: cohortUsers.map(id => mongoose.Types.ObjectId(id)) }, createdAt: { $gte: from, $lt: to } } },
                    { $group: { _id: '$userId' } },
                    { $count: 'n' },
                ]);
                const returned = distinctUsers[0]?.n || 0;
                row[`day_${d}`] = cohortUsers.length ? Math.round((returned / cohortUsers.length) * 10000) / 100 : 0;
            }
            result.push(row);
        }

        res.json({ cohorts: result, retentionDays });
    } catch (error) {
        console.error('getCohorts error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDAU,
    getMAU,
    getStickiness,
    getFeatureUsage,
    getCohorts,
};
