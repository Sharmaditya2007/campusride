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

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusride');
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Ride.deleteMany({});
    await StudentVerification.deleteMany({});
    await DriverProfile.deleteMany({});

    console.log('[Seed] Cleaned existing collections.');

    // 1. Create Admin & Student Users
    const admin = await User.create({
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

    const student1 = await User.create({
      fullName: 'Aman Sharma',
      email: 'aditya@student.edu',
      phone: '+91 98765 12345',
      passwordHash: 'student123',
      university: 'State Tech University',
      studentId: 'STU-2026-99',
      role: 'student',
      verificationStatus: 'verified',
      rating: 4.9,
      ratingCount: 24,
      ridesOfferedCount: 15,
      ridesTakenCount: 8,
      campusPoints: 340,
      bio: 'Final year CS student carpooling daily from Mohali Sector 70 to Campus Gate 1.',
      emergencyContacts: [
        { name: 'Rakesh Sharma (Father)', phone: '+91 98765 43210', relation: 'Family' },
      ],
      savedRoutes: [
        { title: 'Daily Commute', source: 'Mohali Sector 70', destination: 'Main Campus' },
      ],
    });

    const student2 = await User.create({
      fullName: 'Priya Verma',
      email: 'priya@cu.edu',
      phone: '+91 98765 67890',
      passwordHash: 'student123',
      university: 'Chandigarh University',
      studentId: 'CU-2025-44',
      role: 'student',
      verificationStatus: 'verified',
      rating: 4.8,
      ratingCount: 19,
      ridesOfferedCount: 9,
      ridesTakenCount: 12,
      campusPoints: 210,
    });

    console.log('[Seed] Created users successfully.');

    // 2. Create Vehicles
    const vehicle1 = await Vehicle.create({
      ownerId: student1._id,
      vehicleType: 'Car',
      model: 'Honda City i-VTEC',
      registrationNumber: 'CH-01-AB-4890',
      capacity: 4,
      color: 'Silver',
      verificationStatus: 'verified',
    });

    const vehicle2 = await Vehicle.create({
      ownerId: student2._id,
      vehicleType: 'Car',
      model: 'Hyundai i20 Asta',
      registrationNumber: 'PB-65-BC-1122',
      capacity: 3,
      color: 'Polar White',
      verificationStatus: 'verified',
    });

    // 3. Create Driver Profiles
    await DriverProfile.create({
      userId: student1._id,
      licenceNumber: 'DL-04201198822',
      licenceDocumentUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400',
      verificationStatus: 'verified',
    });

    // 4. Create Rides
    const today = new Date().toISOString().split('T')[0];

    await Ride.create({
      driverId: student1._id,
      vehicleId: vehicle1._id,
      source: 'Mohali Phase 7 (Near Metro Gate)',
      destination: 'Main Campus Gate 2',
      date: today,
      departureTime: '08:15',
      estimatedArrival: '30 mins',
      totalSeats: 3,
      availableSeats: 2,
      contribution: 60,
      notes: 'AC car, music allowed, please carry verified student ID pass!',
      pickupPoints: [{ hubName: 'Phase 7 Lights' }, { hubName: 'Kharar Flyover Exit' }],
      status: 'scheduled',
    });

    await Ride.create({
      driverId: student2._id,
      vehicleId: vehicle2._id,
      source: 'Sector 17 Bus Stand, Chandigarh',
      destination: 'State University Engineering Block',
      date: today,
      departureTime: '08:30',
      estimatedArrival: '35 mins',
      totalSeats: 4,
      availableSeats: 3,
      contribution: 50,
      notes: 'Punctual departure for 9 AM lectures.',
      pickupPoints: [{ hubName: 'Sector 17 Plaza' }],
      status: 'scheduled',
    });

    console.log('[Seed] Database seeded successfully! 🚗');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error.message);
    process.exit(1);
  }
};

seedData();
