const Ride = require('../models/Ride');
const RideRequest = require('../models/RideRequest');
const { computeMatchScore } = require('../services/matchingService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @route   GET /api/my-rides/offered
const getOfferedRides = async (req, res, next) => {
  try {
    let rides = [];
    try {
      const rawRides = await Ride.find({ driverId: req.user._id })
        .populate('vehicleId')
        .sort({ createdAt: -1 })
        .lean();

      rides = await Promise.all(
        rawRides.map(async (ride) => {
          const requests = await RideRequest.find({ rideId: ride._id })
            .populate('passengerId', 'fullName university rating profileImage verificationStatus phone')
            .sort({ createdAt: -1 });
          return {
            ...ride,
            incomingRequests: requests,
          };
        })
      );
    } catch (err) {}

    return successResponse(res, 200, 'Offered rides retrieved', rides);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/my-rides/booked
const getBookedRides = async (req, res, next) => {
  try {
    let requests = [];
    try {
      requests = await RideRequest.find({ passengerId: req.user._id })
        .populate({
          path: 'rideId',
          populate: [
            { path: 'driverId', select: 'fullName email phone university rating profileImage verificationStatus' },
            { path: 'vehicleId' },
          ],
        })
        .sort({ createdAt: -1 });
    } catch (err) {}

    return successResponse(res, 200, 'Booked rides retrieved', requests);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/my-rides/backup-suggestions/:rideId
const getBackupSuggestions = async (req, res, next) => {
  try {
    const cancelledRideId = req.params.rideId;
    let cancelledRide = null;

    try {
      cancelledRide = await Ride.findById(cancelledRideId);
    } catch (err) {}

    const source = cancelledRide ? cancelledRide.source : 'Mohali Phase 7';
    const destination = cancelledRide ? cancelledRide.destination : 'Campus Gate';

    let alternatives = [];
    try {
      const dbMatches = await Ride.find({
        _id: { $ne: cancelledRideId },
        status: 'scheduled',
        availableSeats: { $gt: 0 },
      }).populate('driverId', 'fullName university rating verificationStatus profileImage');

      alternatives = dbMatches.map((r) => {
        const obj = r.toObject();
        obj.matchScore = computeMatchScore(obj, { source, destination });
        return obj;
      });
    } catch (err) {}

    return successResponse(res, 200, 'Backup ride suggestions generated', alternatives);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOfferedRides,
  getBookedRides,
  getBackupSuggestions,
};
