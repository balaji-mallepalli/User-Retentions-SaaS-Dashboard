const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: {
        type: Date,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
});

module.exports = mongoose.model('Session', sessionSchema);
