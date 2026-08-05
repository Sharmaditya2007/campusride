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
const PendingSignup = require('../models/PendingSignup');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Report = require('../models/Report');

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
    const pendingCount = await PendingSignup.deleteMany({});
    const txCount = await Transaction.deleteMany({});
    const notifCount = await Notification.deleteMany({});
    const repCount = await Report.deleteMany({});

    console.log('====================================================');
    console.log(`✅ Successfully wiped ALL database collections from MongoDB Atlas!`);
    console.log(`   Deleted Users: ${userCount.deletedCount}`);
    console.log(`   Deleted Rides: ${rideCount.deletedCount}`);
    console.log(`   Deleted Vehicles: ${vehCount.deletedCount}`);
    console.log(`   Deleted Ride Requests: ${reqCount.deletedCount}`);
    console.log(`   Deleted Pending Signups: ${pendingCount.deletedCount}`);
    console.log(`   Deleted Transactions: ${txCount.deletedCount}`);
    console.log(`   Deleted Notifications: ${notifCount.deletedCount}`);
    console.log(`   Deleted Safety Reports: ${repCount.deletedCount}`);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Clear DB Error]', error.message);
    process.exit(1);
  }
};

clearDatabase();
