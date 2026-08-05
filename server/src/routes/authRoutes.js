const express = require('express');
const router = express.Router();
const {
  register,
  verifyOtps,
  resendOtps,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  sendLoginOtp,
  verifyLoginOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otps', verifyOtps);
router.post('/resend-otps', resendOtps);
router.post('/login', login);
router.post('/send-login-otp', sendLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
