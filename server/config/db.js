const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
      retries -= 1;
      console.log(`Retrying connection... (${retries} retries left)`);
      if (retries === 0) {
        process.exit(1);
      }
      // Wait 3 seconds before retrying
      await new Promise(res => setTimeout(res, 3000));
    }
  }
};

module.exports = connectDB;