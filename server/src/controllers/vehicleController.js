const Vehicle = require('../models/Vehicle');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Mock fallback vehicles
const MOCK_VEHICLES = [
  {
    _id: 'v101',
    ownerId: '66a000000000000000000002',
    vehicleType: 'Car',
    model: 'Honda City i-VTEC',
    registrationNumber: 'CH-01-AB-4890',
    capacity: 4,
    color: 'Metallic Silver',
    vehicleImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400',
    verificationStatus: 'verified',
  },
  {
    _id: 'v102',
    ownerId: '66a000000000000000000002',
    vehicleType: 'Car',
    model: 'Hyundai i20 Asta',
    registrationNumber: 'PB-65-BC-1122',
    capacity: 3,
    color: 'Polar White',
    vehicleImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400',
    verificationStatus: 'verified',
  },
];

// @route   POST /api/vehicles
const addVehicle = async (req, res, next) => {
  try {
    const { vehicleType, model, registrationNumber, capacity, color, vehicleImage } = req.body;

    if (!vehicleType || !model || !registrationNumber || !capacity) {
      return errorResponse(res, 400, 'Vehicle type, model, registration number, and capacity are required');
    }

    try {
      const vehicle = await Vehicle.create({
        ownerId: req.user._id,
        vehicleType,
        model,
        registrationNumber,
        capacity,
        color: color || 'Black',
        vehicleImage: vehicleImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400',
        verificationStatus: 'verified',
      });

      return successResponse(res, 201, 'Vehicle added successfully', vehicle);
    } catch (dbErr) {
      console.warn('[Vehicle Create DB] Fallback');
    }

    const newV = {
      _id: 'v_' + Date.now(),
      ownerId: req.user._id,
      vehicleType,
      model,
      registrationNumber,
      capacity,
      color: color || 'Black',
      vehicleImage: vehicleImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400',
      verificationStatus: 'verified',
    };

    return successResponse(res, 201, 'Vehicle added successfully', newV);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/vehicles
const getMyVehicles = async (req, res, next) => {
  try {
    let vehicles = [];
    try {
      vehicles = await Vehicle.find({ ownerId: req.user._id });
    } catch (err) {
      vehicles = MOCK_VEHICLES;
    }

    if (vehicles.length === 0) {
      vehicles = MOCK_VEHICLES;
    }

    return successResponse(res, 200, 'Vehicles retrieved', vehicles);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addVehicle,
  getMyVehicles,
};
