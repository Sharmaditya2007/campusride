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
  initiateSignup,
  verifyEmailOtp,
  verifyWhatsappOtp,
  resendEmailOtp,
  resendWhatsappOtp,
  completeSignup,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otps', verifyOtps);
router.post('/resend-otps', resendOtps);
router.post('/login', login);
router.post('/send-login-otp', sendLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);

// Pre-registration dual OTP verification routes
router.post('/initiate-signup', initiateSignup);
router.post('/verify-email-otp', verifyEmailOtp);
router.post('/verify-whatsapp-otp', verifyWhatsappOtp);
router.post('/resend-email-otp', resendEmailOtp);
router.post('/resend-whatsapp-otp', resendWhatsappOtp);
router.post('/complete-signup', completeSignup);

router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
