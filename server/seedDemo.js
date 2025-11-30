require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const UsageEvent = require('./models/UsageEvent');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/saas_demo';

const products = ['featureA', 'featureB', 'featureC', 'featureD', 'featureE', 'featureF'];
const eventTypes = ['open', 'click', 'purchase', 'signup', 'upgrade'];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

async function seed() {
  await mongoose.connect(MONGO, { family: 4 });
  console.log('Connected to', MONGO);

  // Clear collections
  await UsageEvent.deleteMany({});
  await User.deleteMany({});
  const ApiKey = require('./models/ApiKey');
  await ApiKey.deleteMany({});

  const users = [];
  const totalUsers = 40;
  for (let i = 1; i <= totalUsers; i++) {
    const pwd = await bcrypt.hash('password', 10);
    const createdAt = new Date(Date.now() - randInt(5, 120) * 24 * 60 * 60 * 1000);
    const u = await User.create({
      name: `Demo User ${i}`,
      email: `demo${i}@example.com`,
      password: pwd,
      role: i === 1 ? 'admin' : 'user',
      plan: i <= 12 ? 'pro' : (i <= 28 ? 'starter' : 'free'),
      createdAt,
    });
    users.push(u);
  }

  const now = Date.now();
  const daysBack = 90;

  // more realistic activity: early adopters use more often
  for (let day = 0; day < daysBack; day++) {
    const date = new Date(now - day * 24 * 60 * 60 * 1000);
    for (const user of users) {
      // engagement probability depends on plan and account age
      const daysSinceSignup = Math.max(1, Math.floor((date - user.createdAt) / (24*60*60*1000)));
      const baseProb = user.plan === 'pro' ? 0.7 : (user.plan === 'starter' ? 0.45 : 0.25);
      // older users slightly less active
      const activityProb = Math.max(0.05, baseProb - Math.log10(daysSinceSignup + 1) * 0.08 + (Math.random() - 0.4) * 0.1);
      if (Math.random() < activityProb) {
        const eventsCount = randInt(1, Math.min(8, Math.floor(1 + Math.random()*5)));
        for (let e = 0; e < eventsCount; e++) {
          await UsageEvent.create({
            userId: user._id,
            productId: products[Math.floor(Math.random() * products.length)],
            eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            value: randInt(1, 5),
            createdAt: new Date(date.getTime() + Math.floor(Math.random() * 86400000)),
          });
        }
      }
    }
  }

  // create a demo API key (plain-text printed once)
  const crypto = require('crypto');
  const rawKey = process.env.INGEST_API_KEY || `demo_ingest_${crypto.randomBytes(6).toString('hex')}`;
  const keyId = `seed-${Date.now().toString(36)}`;
  const hash = await bcrypt.hash(rawKey, 10);
  await ApiKey.create({ name: 'seeded-demo-key', keyId, hash, scopes: ['ingest','read:metrics'] });

  console.log('Seeded users and events.');
  console.log('Demo ingest API key (store this somewhere secure):', rawKey);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
