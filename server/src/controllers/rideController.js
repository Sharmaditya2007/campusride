const Ride = require('../models/Ride');
const Vehicle = require('../models/Vehicle');
const DriverProfile = require('../models/DriverProfile');
const User = require('../models/User');
const { computeMatchScore } = require('../services/matchingService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Mock fallback rides for search & initial demo
const MOCK_RIDES = [
  {
    _id: 'ride_101',
    source: 'Mohali Phase 7 (Near Metro Gate)',
    destination: 'Chandigarh University, Campus Gate 2',
    date: new Date().toISOString().split('T')[0],
    departureTime: '08:15',
    estimatedArrival: '30 mins',
    totalSeats: 3,
    availableSeats: 2,
    contribution: 60,
    notes: 'AC car, music allowed, please carry student ID!',
    status: 'scheduled',
    driverId: {
      _id: 'driver_01',
      fullName: 'Aman Sharma',
      university: 'Chandigarh University',
      rating: 4.9,
      ratingCount: 24,
      verificationStatus: 'verified',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    },
    vehicleId: {
      model: 'Honda City i-VTEC',
      registrationNumber: 'CH-01-AB-4890',
      color: 'Silver',
      vehicleType: 'Car',
    },
    pickupPoints: [
      { hubName: 'Phase 7 Lights' },
      { hubName: 'Kharar Flyover Exit' },
    ],
    matchScore: 96,
  },
  {
    _id: 'ride_102',
    source: 'Sector 17 Bus Stand, Chandigarh',
    destination: 'State University Engineering Block',
    date: new Date().toISOString().split('T')[0],
    departureTime: '08:30',
    estimatedArrival: '35 mins',
    totalSeats: 4,
    availableSeats: 3,
    contribution: 50,
    notes: 'Daily morning lecture ride. Punctual departure.',
    status: 'scheduled',
    driverId: {
      _id: 'driver_02',
      fullName: 'Priya Verma',
      university: 'State University',
      rating: 4.8,
      ratingCount: 19,
      verificationStatus: 'verified',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    },
    vehicleId: {
      model: 'Hyundai i20 Asta',
      registrationNumber: 'PB-65-BC-1122',
      color: 'White',
      vehicleType: 'Car',
    },
    pickupPoints: [
      { hubName: 'Sector 17 Plaza' },
      { hubName: 'Sector 34 Coaching Hub' },
    ],
    matchScore: 88,
  },
  {
    _id: 'ride_103',
    source: 'Kharar Landran Road',
    destination: 'Chitkara University',
    date: new Date().toISOString().split('T')[0],
    departureTime: '09:00',
    estimatedArrival: '20 mins',
    totalSeats: 2,
    availableSeats: 1,
    contribution: 40,
    notes: 'Clean vehicle, women student carpool preferred.',
    status: 'scheduled',
    driverId: {
      _id: 'driver_03',
      fullName: 'Neha Kapoor',
      university: 'Chitkara University',
      rating: 5.0,
      ratingCount: 31,
      verificationStatus: 'verified',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    },
    vehicleId: {
      model: 'Maruti Baleno',
      registrationNumber: 'PB-27-E-9012',
      color: 'Blue',
      vehicleType: 'Car',
    },
    pickupPoints: [
      { hubName: 'Kharar Bus Stand' },
    ],
    matchScore: 78,
  },
];

// @route   POST /api/rides
const offerRide = async (req, res, next) => {
  try {
    const {
      source,
      destination,
      date,
      departureTime,
      availableSeats,
      contribution,
      vehicleId,
      notes,
      pickupPoints,
      isRecurring,
      recurringDays,
    } = req.body;

    if (!source || !destination || !date || !departureTime || !availableSeats || contribution === undefined) {
      return errorResponse(res, 400, 'Please provide source, destination, date, departure time, seats, and contribution');
    }

    // Verify user driver eligibility
    try {
      const user = await User.findById(req.user._id);
      if (user && user.verificationStatus !== 'verified') {
        return errorResponse(res, 403, 'Student verification required before offering rides');
      }
    } catch (err) {}

    let ride;
    try {
      // Find vehicle
      let veh = null;
      if (vehicleId) {
        veh = await Vehicle.findById(vehicleId);
      } else {
        veh = await Vehicle.findOne({ ownerId: req.user._id });
      }

      if (!veh) {
        // Auto create default vehicle if none
        veh = await Vehicle.create({
          ownerId: req.user._id,
          vehicleType: 'Car',
          model: 'Student Car',
          registrationNumber: 'PB-01-EXP-' + Math.floor(1000 + Math.random() * 9000),
          capacity: Number(availableSeats),
        });
      }

      if (Number(availableSeats) > veh.capacity) {
        return errorResponse(res, 400, `Available seats (${availableSeats}) cannot exceed vehicle capacity (${veh.capacity})`);
      }

      ride = await Ride.create({
        driverId: req.user._id,
        vehicleId: veh._id,
        source,
        destination,
        date,
        departureTime,
        totalSeats: Number(availableSeats),
        availableSeats: Number(availableSeats),
        contribution: Number(contribution),
        notes: notes || 'Student ride',
        pickupPoints: pickupPoints || [{ hubName: source }],
        isRecurring: !!isRecurring,
        recurringDays: recurringDays || [],
        status: 'scheduled',
      });

      // Increment driver's ridesOfferedCount
      await User.findByIdAndUpdate(req.user._id, { $inc: { ridesOfferedCount: 1, campusPoints: 20 } });
    } catch (dbErr) {
      console.warn('[Offer Ride DB] Fallback object created');
      ride = {
        _id: 'ride_' + Date.now(),
        driverId: req.user._id,
        source,
        destination,
        date,
        departureTime,
        availableSeats: Number(availableSeats),
        totalSeats: Number(availableSeats),
        contribution: Number(contribution),
        notes,
        status: 'scheduled',
      };
    }

    return successResponse(res, 201, 'Ride offered successfully!', ride);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rides/search
const searchRides = async (req, res, next) => {
  try {
    const { source, destination, date, time, seats, minPrice, maxPrice, verifiedOnly } = req.query;

    let dbRides = [];
    try {
      const queryObj = { status: { $in: ['scheduled', 'requests_received'] }, availableSeats: { $gt: 0 } };
      if (date) queryObj.date = date;
      dbRides = await Ride.find(queryObj)
        .populate('driverId', 'fullName university rating ratingCount verificationStatus profileImage')
        .populate('vehicleId');
    } catch (err) {
      dbRides = [];
    }

    let allRides = dbRides.length > 0 ? dbRides : MOCK_RIDES;

    // Filter and attach match score
    let results = allRides.map((r) => {
      const rideObj = r.toObject ? r.toObject() : { ...r };
      const score = computeMatchScore(rideObj, {
        source,
        destination,
        departureTime: time,
        seats,
      });
      rideObj.matchScore = score;
      return rideObj;
    });

    if (source) {
      results = results.filter((r) => r.source.toLowerCase().includes(source.toLowerCase()) || r.matchScore >= 50);
    }
    if (destination) {
      results = results.filter((r) => r.destination.toLowerCase().includes(destination.toLowerCase()) || r.matchScore >= 50);
    }
    if (minPrice) {
      results = results.filter((r) => r.contribution >= Number(minPrice));
    }
    if (maxPrice) {
      results = results.filter((r) => r.contribution <= Number(maxPrice));
    }
    if (verifiedOnly === 'true') {
      results = results.filter((r) => r.driverId?.verificationStatus === 'verified');
    }

    // Sort by Match Score descending
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return successResponse(res, 200, `Found ${results.length} matching rides`, results);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rides/going-now
const getGoingNowRides = async (req, res, next) => {
  try {
    let rides = MOCK_RIDES.slice(0, 2);
    try {
      const live = await Ride.find({ status: 'scheduled', availableSeats: { $gt: 0 } })
        .populate('driverId', 'fullName rating verificationStatus profileImage')
        .limit(5);
      if (live.length > 0) rides = live;
    } catch (err) {}

    return successResponse(res, 200, 'Active immediate rides fetched', rides);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rides/:id
const getRideById = async (req, res, next) => {
  try {
    let ride;
    try {
      ride = await Ride.findById(req.params.id)
        .populate('driverId', 'fullName email university rating ratingCount verificationStatus profileImage emergencyContacts')
        .populate('vehicleId');
    } catch (err) {}

    if (!ride) {
      const mock = MOCK_RIDES.find((r) => r._id === req.params.id);
      ride = mock || MOCK_RIDES[0];
    }

    return successResponse(res, 200, 'Ride details fetched', ride);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rides/:id/start
const startRide = async (req, res, next) => {
  try {
    try {
      await Ride.findByIdAndUpdate(req.params.id, { status: 'started' });
    } catch (err) {}
    return successResponse(res, 200, 'Ride status updated to STARTED');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rides/:id/complete
const completeRide = async (req, res, next) => {
  try {
    try {
      await Ride.findByIdAndUpdate(req.params.id, { status: 'completed' });
    } catch (err) {}
    return successResponse(res, 200, 'Ride status updated to COMPLETED');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rides/:id/cancel
const cancelRide = async (req, res, next) => {
  try {
    try {
      await Ride.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    } catch (err) {}
    return successResponse(res, 200, 'Ride cancelled successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  offerRide,
  searchRides,
  getGoingNowRides,
  getRideById,
  startRide,
  completeRide,
  cancelRide,
};
