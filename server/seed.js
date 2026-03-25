require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const users = [
  { name: 'Admin User', email: 'admin@test.com', password: 'admin123', role: 'admin' },
  { name: 'Sales Manager', email: 'sales@test.com', password: 'sales123', role: 'sales' },
  { name: 'Finance Manager', email: 'finance@test.com', password: 'finance123', role: 'finance' },
  { name: 'Kitchen Head', email: 'kitchen@test.com', password: 'kitchen123', role: 'kitchen' },
  { name: 'GRE Lead', email: 'gre@test.com', password: 'gre123', role: 'gre' },
  { name: 'DJ Rocky', email: 'dj@test.com', password: 'dj123', role: 'dj' },
  { name: 'Demo Client', email: 'client@test.com', password: 'client123', role: 'client' },
];

async function seed() {
  try {
    const MONGO_URI = process.env.MONGODB_URI;
    if (!MONGO_URI) {
      console.error('❌ MONGODB_URI not found in .env');
      return;
    }

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({ email: { $in: users.map(u => u.email) } });
    console.log('🗑 Cleared existing demo users');

    // Create new users
    for (const u of users) {
      await User.create(u);
      console.log(`👤 Created ${u.role}: ${u.email}`);
    }

    console.log('✨ Seeding completed successfully');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
