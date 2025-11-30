const { requireApiKey, findApiKeyDoc } = require('./apiKeyMiddleware');
const { protect } = require('./authMiddleware');

// Try API key first; if not present/valid, fall back to JWT protect middleware
const apiKeyOrAuth = async (req, res, next) => {
  try {
    const header = req.headers['x-ingest-api-key'] || req.headers['x-api-key'];
    if (header) {
      // try validate
      const doc = await findApiKeyDoc(header.trim());
      if (doc) {
        req.apiKey = doc;
        // update lastUsed asynchronously
        doc.lastUsed = new Date();
        doc.save().catch(() => {});
        return next();
      }
      // header present but invalid
      return res.status(401).json({ message: 'Invalid API key' });
    }
    // No key header -> fallback to JWT protect
    return protect(req, res, next);
  } catch (err) {
    console.error('apiKeyOrAuth error', err);
    return res.status(500).json({ message: 'Auth middleware error' });
  }
};

module.exports = { apiKeyOrAuth };
