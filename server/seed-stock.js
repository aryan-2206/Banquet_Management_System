/**
 * Seed ONLY stock items into MongoDB (safe — does not touch bookings/events/dishes).
 * Run with: node seed-stock.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Stock = require('./models/Stock');

const stockItems = [
  { name: "Paneer",        category: "dairy",      unit: "kg",  quantity: 8,   maxQuantity: 20,  lowThreshold: 5,   criticalThreshold: 2   },
  { name: "Basmati Rice",  category: "grains",     unit: "kg",  quantity: 3,   maxQuantity: 50,  lowThreshold: 10,  criticalThreshold: 3   },
  { name: "Chicken",       category: "protein",    unit: "kg",  quantity: 15,  maxQuantity: 30,  lowThreshold: 8,   criticalThreshold: 3   },
  { name: "Tomatoes",      category: "produce",    unit: "kg",  quantity: 12,  maxQuantity: 25,  lowThreshold: 6,   criticalThreshold: 2   },
  { name: "Onions",        category: "produce",    unit: "kg",  quantity: 18,  maxQuantity: 30,  lowThreshold: 8,   criticalThreshold: 3   },
  { name: "Ghee",          category: "dairy",      unit: "L",   quantity: 1.5, maxQuantity: 10,  lowThreshold: 3,   criticalThreshold: 1   },
  { name: "Cumin Seeds",   category: "spices",     unit: "kg",  quantity: 0.3, maxQuantity: 2,   lowThreshold: 0.5, criticalThreshold: 0.2 },
  { name: "Dal (Makhani)", category: "grains",     unit: "kg",  quantity: 5,   maxQuantity: 15,  lowThreshold: 4,   criticalThreshold: 1   },
  { name: "Cream",         category: "dairy",      unit: "L",   quantity: 2,   maxQuantity: 10,  lowThreshold: 3,   criticalThreshold: 1   },
  { name: "Naan Flour",    category: "grains",     unit: "kg",  quantity: 20,  maxQuantity: 40,  lowThreshold: 10,  criticalThreshold: 4   },
  { name: "Cooking Oil",   category: "oils",       unit: "L",   quantity: 7,   maxQuantity: 20,  lowThreshold: 5,   criticalThreshold: 2   },
  { name: "Coriander",     category: "produce",    unit: "kg",  quantity: 0.4, maxQuantity: 2,   lowThreshold: 0.5, criticalThreshold: 0.2 },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Upsert each item by name so re-runs are safe
  for (const item of stockItems) {
    await Stock.findOneAndUpdate(
      { name: item.name },
      { $set: item },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${stockItems.length} stock items`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
