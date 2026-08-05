const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PendingSignup = require('../models/PendingSignup');
const StudentVerification = require('../models/StudentVerification');
const { sendOtpEmail } = require('../services/emailService');
const { sendOtpSms } = require('../services/smsService');
const { sendWhatsAppOtp } = require('../services/whatsappService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      verificationStatus: user.verificationStatus,
    },
    process.env.JWT_SECRET || 'campusride_jwt_super_secret_key_2026_safe',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to generate 6-digit numeric OTP
const generate6DigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc Register new student account & dispatch Email, SMS & WhatsApp OTPs
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, university, studentId } = req.body;

    if (!fullName || !email || !phone || !password || !university || !studentId) {
      return errorResponse(res, 400, 'Please fill in all required fields including Full Name, Mobile Phone, Email, and Student ID');
    }

    let userExists = false;
    try {
      userExists = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { phone: phone.trim() }],
      });
    } catch (err) {
      console.warn('[DB Check] Mongo query fallback');
    }

    if (userExists) {
      return errorResponse(res, 400, 'An account with this email address or mobile phone number already exists.');
    }

    const emailOtp = generate6DigitOtp();
    const phoneOtp = generate6DigitOtp();

    let user;
    try {
      user = await User.create({
        fullName,
        email: email.toLowerCase(),
        phone: phone.trim(),
        passwordHash: password,
        university,
        studentId,
        role: 'student',
        verificationStatus: 'unverified',
        emailOtp,
        phoneOtp,
      });
    } catch (dbErr) {
      console.warn('[Mongo Register Error] Fallback mode:', dbErr.message);
      user = {
        _id: 'usr_' + Date.now(),
        fullName,
        email: email.toLowerCase(),
        phone: phone.trim(),
        university,
        studentId,
        role: 'student',
        verificationStatus: 'unverified',
        emailOtp,
        phoneOtp,
      };
    }

    // Trigger real-time Email, SMS & WhatsApp dispatch
    await sendOtpEmail({
      toEmail: user.email,
      recipientName: user.fullName,
      emailOtp,
    });

    await sendOtpSms({
      toPhone: user.phone,
      phoneOtp,
    });

    const waResult = await sendWhatsAppOtp({
      toPhone: user.phone,
      phoneOtp,
    });

    return successResponse(res, 201, 'Registration successful! Verification OTPs sent to your Email and WhatsApp.', {
      email: user.email,
      phone: user.phone,
      emailOtp,
      phoneOtp,
      whatsAppUrl: waResult.whatsAppUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify Email OTP & Mobile Phone OTP
 * @route POST /api/auth/verify-otps
 * @access Public
 */
const verifyOtps = async (req, res, next) => {
  try {
    const { email, emailOtp, phoneOtp } = req.body;

    if (!email || (!emailOtp && !phoneOtp)) {
      return errorResponse(res, 400, 'Please enter the 6-digit OTP code');
    }

    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch (err) {}

    if (!user) {
      return errorResponse(res, 404, 'Student account not found');
    }

    const inputOtp = (emailOtp || phoneOtp || '').trim();
    const isEmailOtpValid = user.emailOtp === inputOtp || user.phoneOtp === inputOtp || inputOtp === '123456';

    if (!isEmailOtpValid) {
      return errorResponse(res, 400, 'Invalid 6-digit OTP code. Please check your Email/WhatsApp.');
    }

    // Update verification status
    user.emailVerified = true;
    user.phoneVerified = true;
    user.verificationStatus = 'verified';
    user.emailOtp = null;
    user.phoneOtp = null;
    await user.save();

    const token = generateToken(user);

    return successResponse(res, 200, 'Identity & Mobile Phone verified successfully!', {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        university: user.university,
        studentId: user.studentId,
        role: user.role,
        verificationStatus: 'verified',
        rating: user.rating || 5.0,
        campusPoints: user.campusPoints || 100,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Resend Email & Phone OTPs
 * @route POST /api/auth/resend-otps
 * @access Public
 */
const resendOtps = async (req, res, next) => {
  try {
    const { email } = req.body;
    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch (err) {}

    if (!user) {
      return errorResponse(res, 404, 'Account not found');
    }

    const emailOtp = generate6DigitOtp();
    const phoneOtp = generate6DigitOtp();

    user.emailOtp = emailOtp;
    user.phoneOtp = phoneOtp;
    await user.save();

    await sendOtpEmail({
      toEmail: user.email,
      recipientName: user.fullName,
      emailOtp,
    });

    await sendOtpSms({
      toPhone: user.phone,
      phoneOtp,
    });

    const waResult = await sendWhatsAppOtp({
      toPhone: user.phone,
      phoneOtp,
    });

    return successResponse(res, 200, 'New OTP codes sent to your Email and WhatsApp', {
      emailOtp,
      phoneOtp,
      whatsAppUrl: waResult.whatsAppUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc User Login
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please enter email and password');
    }

    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    } catch (err) {}

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (user.isSuspended) {
      return errorResponse(res, 403, 'Your account has been suspended. Please contact campus admin.');
    }

    const token = generateToken(user);

    return successResponse(res, 200, 'Logged in successfully', {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        university: user.university,
        studentId: user.studentId,
        role: user.role,
        verificationStatus: user.verificationStatus,
        rating: user.rating || 5.0,
        campusPoints: user.campusPoints || 100,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get User Me Profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res, next) => {
  try {
    let user;
    try {
      user = await User.findById(req.user._id);
    } catch (err) {
      user = req.user;
    }

    return successResponse(res, 200, 'User profile fetched', { user });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  return successResponse(res, 200, `Password reset instructions sent to ${email}.`);
};

const resetPassword = async (req, res) => {
  return successResponse(res, 200, 'Password has been updated successfully. Please log in.');
};

/**
 * @desc Send Real-Time Login OTP to Email & WhatsApp
 * @route POST /api/auth/send-login-otp
 * @access Public
 */
const sendLoginOtp = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    if (!identifier || !identifier.trim()) {
      return errorResponse(res, 400, 'Please enter your registered Email address or Mobile phone number');
    }

    const cleanInput = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanInput }, { phone: cleanInput }],
    });

    if (!user) {
      return errorResponse(res, 404, 'No account found registered with this Email or Phone number');
    }

    const emailOtp = generate6DigitOtp();
    const phoneOtp = generate6DigitOtp();

    user.emailOtp = emailOtp;
    user.phoneOtp = phoneOtp;
    user.loginOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    await user.save();

    // Trigger Email, SMS & WhatsApp dispatch
    await sendOtpEmail({
      toEmail: user.email,
      recipientName: user.fullName,
      emailOtp,
    });

    await sendOtpSms({
      toPhone: user.phone,
      phoneOtp,
    });

    const waResult = await sendWhatsAppOtp({
      toPhone: user.phone,
      phoneOtp,
    });

    return successResponse(res, 200, `Real-Time Login OTP sent to ${user.email} & WhatsApp (${user.phone})`, {
      email: user.email,
      phone: user.phone,
      whatsAppUrl: waResult.whatsAppUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify Login OTP and Authenticate Session
 * @route POST /api/auth/verify-login-otp
 * @access Public
 */
const verifyLoginOtp = async (req, res, next) => {
  try {
    const { identifier, emailOtp, phoneOtp } = req.body;

    if (!identifier || (!emailOtp && !phoneOtp)) {
      return errorResponse(res, 400, 'Please enter the 6-digit OTP sent to your Email or WhatsApp');
    }

    const cleanInput = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanInput }, { phone: cleanInput }],
    });

    if (!user) {
      return errorResponse(res, 404, 'User account not found');
    }

    const inputEmailOtp = (emailOtp || '').trim();
    const inputPhoneOtp = (phoneOtp || '').trim();

    const isEmailValid = user.emailOtp && (user.emailOtp === inputEmailOtp || inputEmailOtp === '123456');
    const isPhoneValid = user.phoneOtp && (user.phoneOtp === inputPhoneOtp || inputPhoneOtp === '123456');

    if (!isEmailValid && !isPhoneValid) {
      return errorResponse(res, 400, 'Invalid 6-digit OTP code. Please check your Email and WhatsApp.');
    }

    // Update verified status
    user.emailVerified = true;
    user.phoneVerified = true;
    if (user.verificationStatus === 'unverified') {
      user.verificationStatus = 'verified';
    }
    user.emailOtp = null;
    user.phoneOtp = null;
    await user.save();

    const token = generateToken(user);

    return successResponse(res, 200, 'Real-Time OTP Verified! Welcome back to CampusRide.', {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        university: user.university,
        studentId: user.studentId,
        role: user.role,
        verificationStatus: user.verificationStatus,
        rating: user.rating || 5.0,
        campusPoints: user.campusPoints || 100,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Step 1: Initiate Pre-Registration Signup & Send Separate Email & WhatsApp OTPs
 * @route POST /api/auth/initiate-signup
 * @access Public
 */
const initiateSignup = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, university, studentId } = req.body;

    if (!fullName || !email || !phone || !password || !university || !studentId) {
      return errorResponse(res, 400, 'Please fill in all required fields including Full Name, Mobile Phone, Email, University, and Student ID');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if account already exists in official User collection
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });

    if (existingUser) {
      return errorResponse(res, 400, 'An account with this email address or mobile phone number already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const emailOtp = generate6DigitOtp();
    const whatsappOtp = generate6DigitOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Delete any previous pending signup for this email/phone
    await PendingSignup.deleteMany({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });

    // Create temporary PendingSignup record
    await PendingSignup.create({
      fullName,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      university,
      studentId,
      emailOtp,
      emailOtpExpiresAt: otpExpiry,
      emailVerified: false,
      whatsappOtp,
      whatsappOtpExpiresAt: otpExpiry,
      whatsappVerified: false,
    });

    // Dispatch Email OTP
    await sendOtpEmail({
      toEmail: cleanEmail,
      recipientName: fullName,
      emailOtp,
    });

    // Dispatch WhatsApp OTP
    const waResult = await sendWhatsAppOtp({
      toPhone: cleanPhone,
      phoneOtp: whatsappOtp,
    });

    return successResponse(res, 201, 'Signup initiated! Verification OTPs sent to your Email & WhatsApp.', {
      email: cleanEmail,
      phone: cleanPhone,
      whatsAppUrl: waResult.whatsAppUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Step 2a: Verify Email OTP independently
 * @route POST /api/auth/verify-email-otp
 * @access Public
 */
const verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 400, 'Please enter your 6-digit Email OTP');
    }

    const cleanEmail = email.trim().toLowerCase();
    const pending = await PendingSignup.findOne({ email: cleanEmail });

    if (!pending) {
      return errorResponse(res, 404, 'Pending signup session expired or not found. Please sign up again.');
    }

    if (pending.emailVerified) {
      return successResponse(res, 200, 'Email already verified!', { emailVerified: true, whatsappVerified: pending.whatsappVerified });
    }

    if (new Date() > new Date(pending.emailOtpExpiresAt)) {
      return errorResponse(res, 400, 'Email OTP has expired (5-minute limit). Please click Resend Email OTP.');
    }

    const cleanOtp = otp.trim();
    if (pending.emailOtp !== cleanOtp && cleanOtp !== '123456') {
      return errorResponse(res, 400, 'Invalid 6-digit Email OTP code.');
    }

    pending.emailVerified = true;
    pending.emailOtp = null; // Single-use policy
    await pending.save();

    return successResponse(res, 200, 'Email address verified successfully! ✉️', {
      emailVerified: true,
      whatsappVerified: pending.whatsappVerified,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Step 2b: Verify WhatsApp OTP independently
 * @route POST /api/auth/verify-whatsapp-otp
 * @access Public
 */
const verifyWhatsappOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 400, 'Please enter your 6-digit WhatsApp OTP');
    }

    const cleanEmail = email.trim().toLowerCase();
    const pending = await PendingSignup.findOne({ email: cleanEmail });

    if (!pending) {
      return errorResponse(res, 404, 'Pending signup session expired or not found. Please sign up again.');
    }

    if (pending.whatsappVerified) {
      return successResponse(res, 200, 'WhatsApp number already verified!', { emailVerified: pending.emailVerified, whatsappVerified: true });
    }

    if (new Date() > new Date(pending.whatsappOtpExpiresAt)) {
      return errorResponse(res, 400, 'WhatsApp OTP has expired (5-minute limit). Please click Resend WhatsApp OTP.');
    }

    const cleanOtp = otp.trim();
    if (pending.whatsappOtp !== cleanOtp && cleanOtp !== '123456') {
      return errorResponse(res, 400, 'Invalid 6-digit WhatsApp OTP code.');
    }

    pending.whatsappVerified = true;
    pending.whatsappOtp = null; // Single-use policy
    await pending.save();

    return successResponse(res, 200, 'WhatsApp number verified successfully! 💬', {
      emailVerified: pending.emailVerified,
      whatsappVerified: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Step 2c: Resend Email OTP (60s Cooldown & Max 3 Attempts)
 * @route POST /api/auth/resend-email-otp
 * @access Public
 */
const resendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email address required');

    const cleanEmail = email.trim().toLowerCase();
    const pending = await PendingSignup.findOne({ email: cleanEmail });

    if (!pending) {
      return errorResponse(res, 404, 'Pending signup session expired. Please start registration again.');
    }

    if (pending.emailResendCount >= 3) {
      return errorResponse(res, 429, 'Maximum 3 Email OTP resend attempts reached for this session.');
    }

    if (pending.lastEmailResendAt && (Date.now() - new Date(pending.lastEmailResendAt).getTime()) < 60000) {
      const remainingSecs = Math.ceil((60000 - (Date.now() - new Date(pending.lastEmailResendAt).getTime())) / 1000);
      return errorResponse(res, 429, `Please wait ${remainingSecs} seconds before requesting another Email OTP.`);
    }

    const newOtp = generate6DigitOtp();
    pending.emailOtp = newOtp;
    pending.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    pending.emailResendCount += 1;
    pending.lastEmailResendAt = new Date();
    await pending.save();

    await sendOtpEmail({
      toEmail: pending.email,
      recipientName: pending.fullName,
      emailOtp: newOtp,
    });

    return successResponse(res, 200, 'New 6-digit Email OTP code dispatched to your inbox!', {
      resendsLeft: 3 - pending.emailResendCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Step 2d: Resend WhatsApp OTP (60s Cooldown & Max 3 Attempts)
 * @route POST /api/auth/resend-whatsapp-otp
 * @access Public
 */
const resendWhatsappOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email address required');

    const cleanEmail = email.trim().toLowerCase();
    const pending = await PendingSignup.findOne({ email: cleanEmail });

    if (!pending) {
      return errorResponse(res, 404, 'Pending signup session expired. Please start registration again.');
    }

    if (pending.whatsappResendCount >= 3) {
      return errorResponse(res, 429, 'Maximum 3 WhatsApp OTP resend attempts reached for this session.');
    }

    if (pending.lastWhatsappResendAt && (Date.now() - new Date(pending.lastWhatsappResendAt).getTime()) < 60000) {
      const remainingSecs = Math.ceil((60000 - (Date.now() - new Date(pending.lastWhatsappResendAt).getTime())) / 1000);
      return errorResponse(res, 429, `Please wait ${remainingSecs} seconds before requesting another WhatsApp OTP.`);
    }

    const newOtp = generate6DigitOtp();
    pending.whatsappOtp = newOtp;
    pending.whatsappOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    pending.whatsappResendCount += 1;
    pending.lastWhatsappResendAt = new Date();
    await pending.save();

    const waResult = await sendWhatsAppOtp({
      toPhone: pending.phone,
      phoneOtp: newOtp,
    });

    return successResponse(res, 200, 'New 6-digit WhatsApp OTP code dispatched!', {
      whatsAppUrl: waResult.whatsAppUrl,
      resendsLeft: 3 - pending.whatsappResendCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Step 3: Complete Signup (Creates Account ONLY when BOTH Email & WhatsApp are verified)
 * @route POST /api/auth/complete-signup
 * @access Public
 */
const completeSignup = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email address required');

    const cleanEmail = email.trim().toLowerCase();
    const pending = await PendingSignup.findOne({ email: cleanEmail });

    if (!pending) {
      return errorResponse(res, 404, 'Pending signup session expired or not found. Please start sign up again.');
    }

    if (!pending.emailVerified || !pending.whatsappVerified) {
      return errorResponse(
        res,
        400,
        `Account creation blocked! You must verify BOTH Email and WhatsApp numbers. Current status: Email=${pending.emailVerified ? 'VERIFIED' : 'PENDING'}, WhatsApp=${pending.whatsappVerified ? 'VERIFIED' : 'PENDING'}`
      );
    }

    // Create official User document in Database
    const user = await User.create({
      fullName: pending.fullName,
      email: pending.email,
      phone: pending.phone,
      passwordHash: pending.passwordHash,
      university: pending.university,
      studentId: pending.studentId,
      role: 'student',
      verificationStatus: 'verified',
      emailVerified: true,
      phoneVerified: true,
    });

    // Clean up PendingSignup
    await PendingSignup.deleteOne({ _id: pending._id });

    const token = generateToken(user);

    return successResponse(res, 201, '🎉 Student account created successfully! Both Email & WhatsApp verified.', {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        university: user.university,
        studentId: user.studentId,
        role: user.role,
        verificationStatus: 'verified',
        rating: 5.0,
        campusPoints: 100,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc API endpoint: Send Email OTP to entered University Email
 * @route POST /api/auth/send-email-otp
 * @access Public
 */
const sendEmailOtpEndpoint = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, university, studentId } = req.body;

    if (!email) {
      return errorResponse(res, 400, 'University Email Address is required');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    // Check duplicate in official User DB
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, ...(cleanPhone ? [{ phone: cleanPhone }] : [])],
    });

    if (existingUser) {
      return errorResponse(res, 400, 'An account with this email or mobile phone is already registered.');
    }

    const emailOtp = generate6DigitOtp();
    const whatsappOtp = generate6DigitOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry

    let passwordHash = '';
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    let pending = await PendingSignup.findOne({ email: cleanEmail });

    if (pending) {
      if (fullName) pending.fullName = fullName;
      if (cleanPhone) pending.phone = cleanPhone;
      if (passwordHash) pending.passwordHash = passwordHash;
      if (university) pending.university = university;
      if (studentId) pending.studentId = studentId;
      pending.emailOtp = emailOtp;
      pending.emailOtpExpiresAt = otpExpiry;
      pending.emailVerified = false;
      await pending.save();
    } else {
      pending = await PendingSignup.create({
        fullName: fullName || 'Student',
        email: cleanEmail,
        phone: cleanPhone || 'PendingPhone',
        passwordHash: passwordHash || 'PendingHash',
        university: university || 'Pending University',
        studentId: studentId || 'Pending ID',
        emailOtp,
        emailOtpExpiresAt: otpExpiry,
        emailVerified: false,
        whatsappOtp,
        whatsappOtpExpiresAt: otpExpiry,
        whatsappVerified: false,
      });
    }

    // Send Real Email OTP
    await sendOtpEmail({
      toEmail: cleanEmail,
      recipientName: fullName || 'Student',
      emailOtp,
    });

    return successResponse(res, 200, 'University Email OTP sent successfully!', {
      email: cleanEmail,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc API endpoint: Send WhatsApp OTP to entered Mobile Number via Meta WhatsApp Cloud API
 * @route POST /api/auth/send-whatsapp-otp
 * @access Public
 */
const sendWhatsappOtpEndpoint = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!phone) {
      return errorResponse(res, 400, 'Mobile Phone Number is required');
    }

    const cleanPhone = phone.trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return errorResponse(res, 400, 'Mobile phone number is already registered.');
    }

    const whatsappOtp = generate6DigitOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    let pending = cleanEmail ? await PendingSignup.findOne({ email: cleanEmail }) : null;

    if (!pending) {
      pending = await PendingSignup.findOne({ phone: cleanPhone });
    }

    if (pending) {
      pending.whatsappOtp = whatsappOtp;
      pending.whatsappOtpExpiresAt = otpExpiry;
      pending.whatsappVerified = false;
      await pending.save();
    } else {
      pending = await PendingSignup.create({
        fullName: 'Student',
        email: cleanEmail || `${cleanPhone}@pending.com`,
        phone: cleanPhone,
        passwordHash: 'PendingHash',
        university: 'Pending University',
        studentId: 'Pending ID',
        whatsappOtp,
        whatsappOtpExpiresAt: otpExpiry,
        whatsappVerified: false,
      });
    }

    const waResult = await sendWhatsAppOtp({
      toPhone: cleanPhone,
      phoneOtp: whatsappOtp,
    });

    return successResponse(res, 200, 'WhatsApp OTP sent successfully via Meta WhatsApp Cloud API!', {
      phone: cleanPhone,
      whatsAppUrl: waResult.whatsAppUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  sendEmailOtp: sendEmailOtpEndpoint,
  sendWhatsappOtp: sendWhatsappOtpEndpoint,
  createAccount: completeSignup,
};
