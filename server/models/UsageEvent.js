const mongoose = require('mongoose');

const usageEventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    productId: {
        type: String,
        required: true,
    },
    eventType: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        default: 1,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('UsageEvent', usageEventSchema);
