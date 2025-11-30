const User = require('../models/User');
const UsageEvent = require('../models/UsageEvent');
const ApiKey = require('../models/ApiKey');

const getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const events = await UsageEvent.countDocuments();
    const keys = await ApiKey.countDocuments();
    res.json({ users, events, apikeys: keys });
  } catch (err) {
    console.error('debug getStats error', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats };
