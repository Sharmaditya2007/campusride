const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // Non-zero exit code if connection fails during initial startup, or keep server running with in-memory fallback warning
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('[Database Warning] Continuing without MongoDB connection. Some API endpoints will return simulated data if DB is unavailable.');
    }
  }
};

module.exports = connectDB;
