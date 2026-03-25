/**
 * Run with: node seed/seed.js
 * Populates DB with Mehta Wedding + Sharma Corporate + 12 stock items
 */
const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const Event     = require("../models/Event");
const Dish      = require("../models/Menu");
const PrepQueue = require("../models/Prepqueue");
const Stock     = require("../models/Stock");

const today = new Date();
today.setHours(12, 0, 0, 0);

const stockItems = [
  { name: "Paneer",        category: "dairy",    unit: "kg",  quantity: 8,   maxQuantity: 20,  lowThreshold: 5,  criticalThreshold: 2  },
  { name: "Basmati Rice",  category: "grains",   unit: "kg",  quantity: 3,   maxQuantity: 50,  lowThreshold: 10, criticalThreshold: 3  },
  { name: "Chicken",       category: "protein",  unit: "kg",  quantity: 15,  maxQuantity: 30,  lowThreshold: 8,  criticalThreshold: 3  },
  { name: "Tomatoes",      category: "produce",  unit: "kg",  quantity: 12,  maxQuantity: 25,  lowThreshold: 6,  criticalThreshold: 2  },
  { name: "Onions",        category: "produce",  unit: "kg",  quantity: 18,  maxQuantity: 30,  lowThreshold: 8,  criticalThreshold: 3  },
  { name: "Ghee",          category: "dairy",    unit: "L",   quantity: 1.5, maxQuantity: 10,  lowThreshold: 3,  criticalThreshold: 1  },
  { name: "Cumin Seeds",   category: "spices",   unit: "kg",  quantity: 0.3, maxQuantity: 2,   lowThreshold: 0.5,criticalThreshold: 0.2},
  { name: "Dal (Makhani)", category: "grains",   unit: "kg",  quantity: 5,   maxQuantity: 15,  lowThreshold: 4,  criticalThreshold: 1  },
  { name: "Cream",         category: "dairy",    unit: "L",   quantity: 2,   maxQuantity: 10,  lowThreshold: 3,  criticalThreshold: 1  },
  { name: "Naan Flour",    category: "grains",   unit: "kg",  quantity: 20,  maxQuantity: 40,  lowThreshold: 10, criticalThreshold: 4  },
  { name: "Cooking Oil",   category: "oils",     unit: "L",   quantity: 7,   maxQuantity: 20,  lowThreshold: 5,  criticalThreshold: 2  },
  { name: "Coriander",     category: "produce",  unit: "kg",  quantity: 0.4, maxQuantity: 2,   lowThreshold: 0.5,criticalThreshold: 0.2},
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  // Clear existing
  await Promise.all([
    Event.deleteMany({}), Dish.deleteMany({}),
    PrepQueue.deleteMany({}), Stock.deleteMany({}),
  ]);

  // Create stock
  const stocks = await Stock.insertMany(stockItems);
  console.log(`Seeded ${stocks.length} stock items`);

  // Create events
  const [mehta, sharma] = await Event.insertMany([
    { name: "Mehta Wedding",    type: "wedding",   date: today, venue: "Grand Ballroom", plannedPax: 350, arrivedPax: 320, status: "active" },
    { name: "Sharma Corporate", type: "corporate", date: today, venue: "Conf Hall A",    plannedPax: 80,  arrivedPax: 75,  status: "active" },
  ]);
  console.log(`Seeded events: ${mehta.name}, ${sharma.name}`);

  // Dishes for Mehta Wedding
  const mehtaDishes = await Dish.insertMany([
    { eventId: mehta._id, name: "Paneer Tikka",       course: "starters",  status: "Served", portions: { prepared: 350, served: 300 }, dietaryTags: ["veg"],     sortOrder: 1 },
    { eventId: mehta._id, name: "Chicken Seekh",      course: "starters",  status: "Active", portions: { prepared: 200, served: 150 }, dietaryTags: ["non-veg"], sortOrder: 2, isUrgent: true },
    { eventId: mehta._id, name: "Tomato Shorba",      course: "soup",      status: "Served", portions: { prepared: 350, served: 320 }, dietaryTags: ["veg"],     sortOrder: 3 },
    { eventId: mehta._id, name: "Dal Makhani",        course: "mains",     status: "Active", portions: { prepared: 300, served: 200 }, dietaryTags: ["veg"],     sortOrder: 4, batchGroup: "gravy-base", stockRefs: [stocks[7]._id, stocks[8]._id] },
    { eventId: mehta._id, name: "Butter Chicken",     course: "mains",     status: "Active", portions: { prepared: 250, served: 180 }, dietaryTags: ["non-veg"], sortOrder: 5, batchGroup: "gravy-base", stockRefs: [stocks[2]._id] },
    { eventId: mehta._id, name: "Paneer Butter Masala",course: "mains",   status: "Pending",portions: { prepared: 0,   served: 0   }, dietaryTags: ["veg"],     sortOrder: 6, batchGroup: "gravy-base", stockRefs: [stocks[0]._id] },
    { eventId: mehta._id, name: "Veg Biryani",        course: "rice",      status: "Pending",portions: { prepared: 0,   served: 0   }, dietaryTags: ["veg"],     sortOrder: 7, stockRefs: [stocks[1]._id] },
    { eventId: mehta._id, name: "Butter Naan",        course: "breads",    status: "Active", portions: { prepared: 700, served: 600 }, dietaryTags: ["veg"],     sortOrder: 8, stockRefs: [stocks[9]._id] },
    { eventId: mehta._id, name: "Gulab Jamun",        course: "desserts",  status: "Pending",portions: { prepared: 0,   served: 0   }, dietaryTags: ["veg"],     sortOrder: 9 },
    { eventId: mehta._id, name: "Rasmalai",           course: "desserts",  status: "Pending",portions: { prepared: 0,   served: 0   }, dietaryTags: ["veg"],     sortOrder: 10 },
  ]);

  // Dishes for Sharma Corporate
  const sharmaDishes = await Dish.insertMany([
    { eventId: sharma._id, name: "Veg Spring Rolls",  course: "starters", status: "Served",  portions: { prepared: 80,  served: 78  }, dietaryTags: ["veg"],     sortOrder: 1 },
    { eventId: sharma._id, name: "Grilled Chicken",   course: "mains",    status: "Active",  portions: { prepared: 50,  served: 30  }, dietaryTags: ["non-veg"], sortOrder: 2 },
    { eventId: sharma._id, name: "Steamed Rice",      course: "rice",     status: "Pending", portions: { prepared: 0,   served: 0   }, dietaryTags: ["veg"],     sortOrder: 3 },
    { eventId: sharma._id, name: "Chocolate Mousse",  course: "desserts", status: "Pending", portions: { prepared: 0,   served: 0   }, dietaryTags: ["veg"],     sortOrder: 4 },
  ]);

  console.log(`Seeded ${mehtaDishes.length + sharmaDishes.length} dishes`);

  // Prep queue tasks
  const allDishes = [...mehtaDishes, ...sharmaDishes];
  const prepTasks = await PrepQueue.insertMany([
    { dishId: mehtaDishes[5]._id, eventId: mehta._id, taskName: "Prep Paneer Butter Masala", status: "pending", isUrgent: false, assignedTo: "Ravi", scheduledAt: new Date(Date.now() + 30*60000) },
    { dishId: mehtaDishes[6]._id, eventId: mehta._id, taskName: "Cook Veg Biryani",          status: "pending", isUrgent: true,  assignedTo: "Suresh", scheduledAt: new Date(Date.now() + 15*60000) },
    { dishId: mehtaDishes[8]._id, eventId: mehta._id, taskName: "Fry Gulab Jamun",           status: "pending", isUrgent: false, assignedTo: "Ramesh", scheduledAt: new Date(Date.now() + 45*60000) },
    { dishId: mehtaDishes[7]._id, eventId: mehta._id, taskName: "Butter Naan Station",       status: "active",  isUrgent: false, assignedTo: "Live Counter", startedAt: new Date() },
    { dishId: sharmaDishes[2]._id,eventId: sharma._id,taskName: "Boil Steamed Rice",         status: "pending", isUrgent: false, assignedTo: "Priya" },
  ]);

  console.log(`Seeded ${prepTasks.length} prep queue tasks`);
  console.log("✅ Seed complete");
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });