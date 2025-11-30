const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
  name: { type: String },
  keyId: { type: String, unique: true, index: true },
  hash: { type: String, required: true },
  scopes: [{ type: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  disabled: { type: Boolean, default: false },
  lastUsed: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', ApiKeySchema);
