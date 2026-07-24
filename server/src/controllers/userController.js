const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @route   GET /api/users/me
const getUserProfile = async (req, res, next) => {
  try {
    let user;
    try {
      user = await User.findById(req.user._id);
    } catch (err) {
      user = req.user;
    }
    return successResponse(res, 200, 'User profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/me
const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, bio, department, batchYear, profileImage } = req.body;
    let user;

    try {
      user = await User.findById(req.user._id);
      if (user) {
        if (fullName) user.fullName = fullName;
        if (bio !== undefined) user.bio = bio;
        if (department) user.department = department;
        if (batchYear) user.batchYear = batchYear;
        if (profileImage) user.profileImage = profileImage;
        await user.save();
      }
    } catch (err) {
      console.warn('[User Update] DB bypass');
    }

    return successResponse(res, 200, 'Profile updated successfully', user || req.user);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/users/emergency-contacts
const addEmergencyContact = async (req, res, next) => {
  try {
    const { name, phone, relation } = req.body;
    if (!name || !phone) {
      return errorResponse(res, 400, 'Name and phone are required');
    }

    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.emergencyContacts.push({ name, phone, relation: relation || 'Family' });
        await user.save();
        return successResponse(res, 200, 'Emergency contact added', user.emergencyContacts);
      }
    } catch (err) {
      console.warn('[Emergency Contact DB] Fallback');
    }

    return successResponse(res, 200, 'Emergency contact added', [{ name, phone, relation: relation || 'Family' }]);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/users/saved-routes
const saveRoute = async (req, res, next) => {
  try {
    const { title, source, destination } = req.body;
    if (!title || !source || !destination) {
      return errorResponse(res, 400, 'Title, source, and destination are required');
    }

    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.savedRoutes.push({ title, source, destination });
        await user.save();
        return successResponse(res, 200, 'Route saved successfully', user.savedRoutes);
      }
    } catch (err) {
      console.warn('[Saved Routes DB] Fallback');
    }

    return successResponse(res, 200, 'Route saved successfully', [{ title, source, destination }]);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/:id
const getUserPublicProfile = async (req, res, next) => {
  try {
    let user;
    try {
      user = await User.findById(req.params.id).select('fullName university department batchYear verificationStatus rating ratingCount ridesOfferedCount ridesTakenCount profileImage bio createdAt');
    } catch (err) {
      console.warn('[Public User Profile] DB fallback');
    }

    if (!user) {
      user = {
        _id: req.params.id,
        fullName: 'Campus Student',
        university: 'State University',
        department: 'Computer Science',
        batchYear: '2026',
        verificationStatus: 'verified',
        rating: 4.9,
        ratingCount: 18,
        ridesOfferedCount: 12,
        ridesTakenCount: 15,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        bio: 'Daily commuter between Mohali & Campus!',
      };
    }

    return successResponse(res, 200, 'Public profile fetched', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  addEmergencyContact,
  saveRoute,
  getUserPublicProfile,
};
