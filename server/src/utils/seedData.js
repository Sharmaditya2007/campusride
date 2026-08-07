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
const StudentVerification = require('../models/StudentVerification');
const DriverProfile = require('../models/DriverProfile');
const RideRequest = require('../models/RideRequest');
const PendingSignup = require('../models/PendingSignup');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Report = require('../models/Report');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusride');
    console.log('[Seed] Connected to MongoDB...');

    // Clear all existing collections & fake data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Ride.deleteMany({});
    await RideRequest.deleteMany({});
    await StudentVerification.deleteMany({});
    await DriverProfile.deleteMany({});
    await PendingSignup.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});

    console.log('[Seed] Cleaned all fake users, vehicles & rides.');

    // Create single Admin user for platform safety management
    await User.create({
      fullName: 'Campus Safety Admin',
      email: 'admin@campusride.edu',
      phone: '+91 99999 00000',
      passwordHash: 'admin123',
      university: 'State Tech University',
      studentId: 'ADM-001',
      role: 'admin',
      verificationStatus: 'verified',
      rating: 5.0,
      campusPoints: 500,
    });

    console.log('[Seed] Created official Admin account successfully (admin@campusride.edu).');
    console.log('[Seed] Database reset completely clean with 0 fake student accounts! 🚗');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error.message);
    process.exit(1);
  }
};

seedData();
