#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

if (process.argv.length < 3) {
  console.error('Usage: node checkTokenUser.js <JWT_TOKEN>');
  process.exit(2);
}

const token = process.argv[2];

const run = async () => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT payload:', decoded);

    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const User = require('./models/User');
    const user = await User.findById(decoded.id).lean();
    if (!user) {
      console.log('No user found with id:', decoded.id);
    } else {
      console.log('User found:');
      console.log(user);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
};

run();
