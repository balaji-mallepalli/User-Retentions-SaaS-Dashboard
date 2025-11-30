const admin = (req, res, next) => {
    // Allow if user is admin
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    // Allow if an API key was used and it has elevated scopes
    // e.g. 'admin' or 'read:metrics' or a management scope
    if (req.apiKey && Array.isArray(req.apiKey.scopes)) {
        const scopes = req.apiKey.scopes;
        if (scopes.includes('admin') || scopes.includes('read:metrics') || scopes.includes('manage:apike')) {
            return next();
        }
    }

    res.status(403).json({ message: 'Not authorized as an admin' });
};

module.exports = { admin };
