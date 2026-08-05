const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Ride = require('../models/Ride');
const RideRequest = require('../models/RideRequest');
const StudentVerification = require('../models/StudentVerification');
const DriverProfile = require('../models/DriverProfile');
const CommuteGroup = require('../models/CommuteGroup');

const clearDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusride';
    console.log('[Clear DB] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Ride.deleteMany({});
    await RideRequest.deleteMany({});
    await StudentVerification.deleteMany({});
    await DriverProfile.deleteMany({});
    await CommuteGroup.deleteMany({});

    console.log('====================================================');
    console.log('✅ Successfully cleared all fake & test data from database!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Clear DB Error]', error.message);
    process.exit(1);
  }
};

clearDatabase();
