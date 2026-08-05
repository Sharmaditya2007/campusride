const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

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
    console.log('[Clear DB] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);

    const userCount = await User.deleteMany({});
    const vehCount = await Vehicle.deleteMany({});
    const rideCount = await Ride.deleteMany({});
    const reqCount = await RideRequest.deleteMany({});
    const stuCount = await StudentVerification.deleteMany({});
    const drvCount = await DriverProfile.deleteMany({});
    const grpCount = await CommuteGroup.deleteMany({});

    console.log('====================================================');
    console.log(`✅ Successfully wiped fake database records from MongoDB Atlas!`);
    console.log(`   Deleted Users: ${userCount.deletedCount}`);
    console.log(`   Deleted Rides: ${rideCount.deletedCount}`);
    console.log(`   Deleted Vehicles: ${vehCount.deletedCount}`);
    console.log(`   Deleted Ride Requests: ${reqCount.deletedCount}`);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Clear DB Error]', error.message);
    process.exit(1);
  }
};

clearDatabase();
