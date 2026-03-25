require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing database connection...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Database connected successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
