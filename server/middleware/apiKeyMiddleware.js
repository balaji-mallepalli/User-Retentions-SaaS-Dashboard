const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');

// Validate an API key string. Accept formats: "keyId.raw" or raw key.
const findApiKeyDoc = async (token) => {
  if (!token) return null;

  // If token looks like keyId.raw
  if (token.includes('.')) {
    const [keyId, raw] = token.split('.', 2);
    if (!keyId || !raw) return null;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const doc = await ApiKey.findOne({ keyId, hash, disabled: false });
    return doc;
  }

  // Fallback: match by raw value hash (legacy style)
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const doc = await ApiKey.findOne({ hash, disabled: false });
  if (doc) return doc;

  // Backwards compatibility: some seeders stored bcrypt hashes. Try bcrypt compare
  try {
    const bcrypt = require('bcryptjs');
    const candidates = await ApiKey.find({ disabled: false }).limit(50).lean();
    for (const c of candidates) {
      if (c.hash && (await bcrypt.compare(token, c.hash))) {
        // re-fetch full document so callers can call .save()
        return await ApiKey.findById(c._id);
      }
    }
  } catch (err) {
    // ignore and continue
    console.error('bcrypt fallback error in findApiKeyDoc', err);
  }
  return doc;
};

const requireApiKey = async (req, res, next) => {
  try {
    const header = req.headers['x-ingest-api-key'] || req.headers['x-api-key'];
    if (!header) {
      return res.status(401).json({ message: 'No API key provided' });
    }
    const doc = await findApiKeyDoc(header.trim());
    if (!doc) return res.status(401).json({ message: 'Invalid API key' });
    // attach for later use
    req.apiKey = doc;
    // update lastUsed asynchronously
    doc.lastUsed = new Date();
    doc.save().catch(() => {});
    return next();
  } catch (err) {
    console.error('API key middleware error', err);
    return res.status(500).json({ message: 'API key validation error' });
  }
};

module.exports = {
  findApiKeyDoc,
  requireApiKey,
};
