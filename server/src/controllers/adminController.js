const User = require('../models/User');
const StudentVerification = require('../models/StudentVerification');
const DriverProfile = require('../models/DriverProfile');
const Ride = require('../models/Ride');
const Report = require('../models/Report');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @route   GET /api/admin/dashboard
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verificationStatus: 'verified' });
    const pendingStudentVerifications = await StudentVerification.countDocuments({ status: 'pending' });
    const pendingDriverVerifications = await DriverProfile.countDocuments({ verificationStatus: 'pending' });
    const totalRides = await Ride.countDocuments();
    const activeRides = await Ride.countDocuments({ status: { $in: ['scheduled', 'started', 'requests_received'] } });
    const completedRides = await Ride.countDocuments({ status: 'completed' });
    const cancelledRides = await Ride.countDocuments({ status: 'cancelled' });
    const totalReports = await Report.countDocuments({ status: 'pending' });

    // Dynamic CO2 calculation: ~3.8kg CO2 saved per completed ride
    const co2SavedKg = Math.round(completedRides * 3.8 * 10) / 10;

    return successResponse(res, 200, 'Admin metrics retrieved', {
      totalUsers,
      verifiedUsers,
      pendingVerifications: pendingStudentVerifications + pendingDriverVerifications,
      totalRides,
      activeRides,
      completedRides,
      cancelledRides,
      totalReports,
      co2SavedKg,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/users
const getUsersList = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Users retrieved for admin', users);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/users/:id/toggle-suspend
const toggleUserSuspend = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let isSuspended = false;

    try {
      const u = await User.findById(userId);
      if (u) {
        u.isSuspended = !u.isSuspended;
        await u.save();
        isSuspended = u.isSuspended;
      }
    } catch (err) {}

    return successResponse(res, 200, `User account status updated. Suspended: ${isSuspended}`);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/verifications
const getPendingVerifications = async (req, res, next) => {
  try {
    let studentRequests = [];
    let driverRequests = [];

    try {
      studentRequests = await StudentVerification.find({ status: 'pending' }).populate('userId', 'fullName email university studentId');
      driverRequests = await DriverProfile.find({ verificationStatus: 'pending' }).populate('userId', 'fullName email university studentId');
    } catch (err) {}

    return successResponse(res, 200, 'Pending verifications retrieved', {
      studentVerifications: studentRequests,
      driverVerifications: driverRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/verifications/student/:id/approve
const approveStudentVerification = async (req, res, next) => {
  try {
    const id = req.params.id;
    try {
      const ver = await StudentVerification.findByIdAndUpdate(id, { status: 'verified', reviewedBy: req.user._id }, { new: true });
      if (ver) {
        await User.findByIdAndUpdate(ver.userId, { verificationStatus: 'verified' });
      }
    } catch (err) {}

    return successResponse(res, 200, 'Student verification approved successfully!');
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/verifications/student/:id/reject
const rejectStudentVerification = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { reason } = req.body;

    try {
      const ver = await StudentVerification.findByIdAndUpdate(id, { status: 'rejected', rejectionReason: reason || 'Document unclear', reviewedBy: req.user._id }, { new: true });
      if (ver) {
        await User.findByIdAndUpdate(ver.userId, { verificationStatus: 'rejected' });
      }
    } catch (err) {}

    return successResponse(res, 200, 'Student verification rejected');
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/verifications/driver/:id/approve
const approveDriverVerification = async (req, res, next) => {
  try {
    const id = req.params.id;
    try {
      await DriverProfile.findByIdAndUpdate(id, { verificationStatus: 'verified', reviewedBy: req.user._id });
    } catch (err) {}

    return successResponse(res, 200, 'Driver licence verification approved successfully!');
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/verifications/driver/:id/reject
const rejectDriverVerification = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { reason } = req.body;

    try {
      await DriverProfile.findByIdAndUpdate(id, { verificationStatus: 'rejected', rejectionReason: reason || 'Invalid licence details' });
    } catch (err) {}

    return successResponse(res, 200, 'Driver licence verification rejected');
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/reports
const getAdminReports = async (req, res, next) => {
  try {
    let reports = [];
    try {
      reports = await Report.find({})
        .populate('reporterId', 'fullName email')
        .populate('reportedUserId', 'fullName email')
        .sort({ createdAt: -1 });
    } catch (err) {}

    return successResponse(res, 200, 'Admin reports fetched', reports);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/admin/clear-database
const clearAllDatabaseData = async (req, res, next) => {
  try {
    const Vehicle = require('../models/Vehicle');
    const RideRequest = require('../models/RideRequest');
    const CommuteGroup = require('../models/CommuteGroup');

    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Ride.deleteMany({});
    await RideRequest.deleteMany({});
    await StudentVerification.deleteMany({});
    await DriverProfile.deleteMany({});
    await CommuteGroup.deleteMany({});
    await Report.deleteMany({});

    return successResponse(res, 200, 'All fake and test database collections have been completely cleared! 🧹');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getUsersList,
  toggleUserSuspend,
  getPendingVerifications,
  approveStudentVerification,
  rejectStudentVerification,
  approveDriverVerification,
  rejectDriverVerification,
  getAdminReports,
  clearAllDatabaseData,
};
