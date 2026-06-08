/**
 * Seed Script — creates demo users for all 7 roles
 * Run once: node scripts/seed.js
 *
 * Users created:
 *   admin@banquet.com   / admin123   / role: admin
 *   sales@banquet.com   / sales123   / role: sales
 *   finance@banquet.com / finance123 / role: finance
 *   kitchen@banquet.com / kitchen123 / role: kitchen
 *   gre@banquet.com     / gre123     / role: gre
 *   dj@banquet.com      / dj123      / role: dj
 *   client@banquet.com  / client123  / role: client
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/banquet-intellimanager';

const DEMO_USERS = [
  { name: 'Admin User',       email: 'admin@banquet.com',   password: 'admin123',   role: 'admin' },
  { name: 'Riya Sharma',      email: 'sales@banquet.com',   password: 'sales123',   role: 'sales' },
  { name: 'Ananya Shah',      email: 'finance@banquet.com', password: 'finance123', role: 'finance' },
  { name: 'Chef Rajesh',      email: 'kitchen@banquet.com', password: 'kitchen123', role: 'kitchen' },
  { name: 'Priya Nair',       email: 'gre@banquet.com',     password: 'gre123',     role: 'gre' },
  { name: 'DJ Arjun',         email: 'dj@banquet.com',      password: 'dj123',      role: 'dj' },
  { name: 'Demo Client',      email: 'client@banquet.com',  password: 'client123',  role: 'client' },
];

async function seed() {
  try {
    console.log('\n🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected:', MONGO_URI.replace(/:\/\/.*@/, '://***@'));

    let created = 0;
    let skipped = 0;

    for (const u of DEMO_USERS) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`   ⏭  ${u.email} already exists (role: ${existing.role})`);
        skipped++;
        continue;
      }
      await User.create(u);
      console.log(`   ✅ Created: ${u.email} / ${u.password} (${u.role})`);
      created++;
    }

    console.log(`\n🎉 Seed complete! ${created} created, ${skipped} skipped.\n`);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
