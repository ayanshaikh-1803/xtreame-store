const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const {
  register, verifyEmail, resendOTP, login,
  forgotPassword, verifyForgotOTP, resetPassword,
  sendMobileOTP, verifyMobileOTP,
  getMe
} = require('../controllers/authController');

// Strict rate limiter for login: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register',           register);
router.post('/verify-email',       verifyEmail);
router.post('/resend-otp',         resendOTP);
router.post('/login',              loginLimiter, login);
router.post('/forgot-password',    forgotPassword);
router.post('/verify-forgot-otp',  verifyForgotOTP);
router.post('/reset-password',     resetPassword);
router.post('/send-mobile-otp',    sendMobileOTP);
router.post('/verify-mobile-otp',  verifyMobileOTP);
router.get('/me',                  protect, getMe);

module.exports = router;
