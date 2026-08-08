const Ride = require('../models/Ride');
const Vehicle = require('../models/Vehicle');
const DriverProfile = require('../models/DriverProfile');
const User = require('../models/User');
const { computeMatchScore } = require('../services/matchingService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

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
      registrationNumber,
      vehicleNumber,
      vehicleModel,
      notes,
      pickupPoints,
      isRecurring,
      recurringDays,
    } = req.body;

    if (!source || !destination || !date || !departureTime || !availableSeats || contribution === undefined) {
      return errorResponse(res, 400, 'Please provide source, destination, date, departure time, seats, and contribution');
    }

    // Verify user driver eligibility
    const user = await User.findById(req.user._id);
    if (user && user.verificationStatus !== 'verified') {
      return errorResponse(res, 403, 'Student verification required before offering rides');
    }

    const plateNumber = (registrationNumber || vehicleNumber || '').trim();
    const carModelName = (vehicleModel || '').trim();

    let veh;
    if (vehicleId) {
      veh = await Vehicle.findById(vehicleId);
      if (veh && (plateNumber || carModelName)) {
        if (plateNumber) veh.registrationNumber = plateNumber.toUpperCase();
        if (carModelName) veh.model = carModelName;
        await veh.save();
      }
    } else {
      veh = await Vehicle.findOne({ ownerId: req.user._id });
      if (veh && (plateNumber || carModelName)) {
        if (plateNumber) veh.registrationNumber = plateNumber.toUpperCase();
        if (carModelName) veh.model = carModelName;
        await veh.save();
      }
    }

    if (!veh) {
      // Create new vehicle with driver's provided plate number and model
      veh = await Vehicle.create({
        ownerId: req.user._id,
        vehicleType: 'Car',
        model: carModelName || 'Student Car',
        registrationNumber: plateNumber ? plateNumber.toUpperCase() : ('PB-01-EXP-' + Math.floor(1000 + Math.random() * 9000)),
        capacity: Math.max(Number(availableSeats) + 1, 4),
      });
    }

    if (Number(availableSeats) > veh.capacity) {
      return errorResponse(res, 400, `Available seats (${availableSeats}) cannot exceed vehicle capacity (${veh.capacity})`);
    }

    const ride = await Ride.create({
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

    // Filter and attach match score
    let results = dbRides.map((r) => {
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
    let rides = [];
    try {
      rides = await Ride.find({ status: 'scheduled', availableSeats: { $gt: 0 } })
        .populate('driverId', 'fullName rating verificationStatus profileImage')
        .limit(5);
    } catch (err) {
      rides = [];
    }

    return successResponse(res, 200, 'Active immediate rides fetched', rides);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rides/:id
const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driverId', 'fullName email university rating ratingCount verificationStatus profileImage emergencyContacts')
      .populate('vehicleId');

    if (!ride) {
      return errorResponse(res, 404, 'Ride not found');
    }

    return successResponse(res, 200, 'Ride details fetched', ride);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rides/:id/start
const startRide = async (req, res, next) => {
  try {
    await Ride.findByIdAndUpdate(req.params.id, { status: 'started' });
    return successResponse(res, 200, 'Ride status updated to STARTED');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rides/:id/complete
const completeRide = async (req, res, next) => {
  try {
    await Ride.findByIdAndUpdate(req.params.id, { status: 'completed' });
    return successResponse(res, 200, 'Ride status updated to COMPLETED');
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rides/:id/cancel
const cancelRide = async (req, res, next) => {
  try {
    await Ride.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
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
