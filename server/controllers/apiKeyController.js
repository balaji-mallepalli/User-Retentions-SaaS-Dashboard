const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');

// POST /api/apikeys  (admin)
const createKey = async (req, res) => {
  try {
    const { name, scopes = [] } = req.body || {};
    const raw = crypto.randomBytes(24).toString('hex');
    const keyId = crypto.randomBytes(8).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const owner = req.user?.id;

    const apiKey = await ApiKey.create({ name, keyId, hash, scopes, owner });
    const publicKey = `${keyId}.${raw}`;
    res.status(201).json({ key: publicKey, id: apiKey._id, name: apiKey.name, scopes: apiKey.scopes });
  } catch (err) {
    console.error('createKey error', err);
    res.status(500).json({ message: err.message || 'Failed to create API key' });
  }
};

// GET /api/apikeys  (admin)
const listKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find().select('-hash');
    res.json(keys);
  } catch (err) {
    console.error('listKeys error', err);
    res.status(500).json({ message: err.message || 'Failed to list API keys' });
  }
};

// PATCH /api/apikeys/:id/disable  (admin)
const disableKey = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ApiKey.findById(id);
    if (!doc) return res.status(404).json({ message: 'Key not found' });
    doc.disabled = true;
    await doc.save();
    res.json({ message: 'Key disabled' });
  } catch (err) {
    console.error('disableKey error', err);
    res.status(500).json({ message: 'Failed to disable key' });
  }
};

module.exports = { createKey, listKeys, disableKey };
