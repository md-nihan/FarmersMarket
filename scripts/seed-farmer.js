#!/usr/bin/env node
/*
 Seed or update a farmer for local testing.
 Usage: node scripts/seed-farmer.js --phone +919876543210 --name "Test Farmer" --village "Test Village" --district "Test District"
*/
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Farmer = require('../models/Farmer');
const { normalizePhone } = require('../utils/phone');

dotenv.config();

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const val = args[i + 1];
    out[key] = val;
  }
  return out;
}

(async () => {
  const { phone, name = 'Test Farmer', village = 'Test Village', district = 'Test District' } = parseArgs();
  if (!phone) {
    console.error('Missing --phone. Example: node scripts/seed-farmer.js --phone +919876543210');
    process.exit(1);
  }
  const e164 = normalizePhone(phone);
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmlink');
    const res = await Farmer.updateOne(
      { phone: e164 },
      {
        $set: {
          name,
          phone: e164,
          village,
          district,
          location: `${village}, ${district}`,
          crops: 'Tomato, Onion',
          approvalStatus: 'approved',
          isActive: true,
          welcomeSent: true
        }
      },
      { upsert: true }
    );
    console.log('✅ Seeded farmer:', e164, res.acknowledged ? 'OK' : 'WARN');
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  }
})();
