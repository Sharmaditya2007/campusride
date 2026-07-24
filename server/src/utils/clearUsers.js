require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const StudentVerification = require('../models/StudentVerification');

(async () => {
  try {
    let connStr = process.env.MONGODB_URI;
    if (connStr.includes('+srv')) {
      connStr = 'mongodb://campusride2026_db_user:THpiHVh1CNtxTZC9@cluster0-shard-00-00.niatnmu.mongodb.net:27017,cluster0-shard-00-01.niatnmu.mongodb.net:27017,cluster0-shard-00-02.niatnmu.mongodb.net:27017/campusride?ssl=true&replicaSet=atlas-13c5h8-shard-0&authSource=admin&retryWrites=true&w=majority';
    }
    console.log('Connecting to MongoDB Atlas to clear user test data...');
    await mongoose.connect(connStr);

    const userRes = await User.deleteMany({});
    const verifRes = await StudentVerification.deleteMany({});

    console.log(`✅ Successfully deleted ${userRes.deletedCount} user accounts and ${verifRes.deletedCount} verification records.`);
    console.log('Your database is fresh and ready for new student registrations!');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing database:', err.message);
    process.exit(1);
  }
})();
