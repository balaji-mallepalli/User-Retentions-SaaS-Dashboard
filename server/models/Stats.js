const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    apiCalls: {
        type: Number,
        default: 0,
    },
    storageUsed: {
        type: Number,
        default: 0,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Stats', statsSchema);
