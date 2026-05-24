const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');
const validateEmail = require('../utils/emailValidator');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const isEmailConfigured = () =>
  process.env.EMAIL_USER &&
  process.env.EMAIL_USER !== 'your_email@gmail.com' &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_PASS !== 'your_app_password_here';

const sendOTPEmail = async (email, name, otp, subject = 'Verify Your Email') => {
  if (!isEmailConfigured()) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 DEV MODE — ${subject}`);
    console.log(`   To : ${email}`);
    console.log(`   OTP: ${otp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  await sendEmail({
    to: email,
    subject: `🔥 XTREAME STORE — ${subject}`,
    html: `
      <div style="background:#0a0a0a;color:#fff;padding:40px;font-family:Arial,sans-serif;
                  border-radius:12px;max-width:500px;margin:0 auto;border:1px solid #ff003333;">
        <h1 style="color:#ff0033;text-align:center;font-size:26px;letter-spacing:3px;margin-bottom:4px;">
          ⚡ XTREAME STORE
        </h1>
        <p style="text-align:center;color:#888;margin-bottom:32px;font-size:13px;">Gaming Marketplace</p>
        <h2 style="text-align:center;margin-bottom:8px;">${subject}</h2>
        <p style="color:#aaa;">Hi <strong style="color:#fff;">${name}</strong>,</p>
        <p style="color:#aaa;">Your OTP code is:</p>
        <div style="background:#111;border:2px solid #ff0033;border-radius:10px;
                    padding:28px;text-align:center;margin:20px 0;">
          <h1 style="color:#ff0033;font-size:52px;letter-spacing:14px;margin:0;
                     font-family:monospace;">${otp}</h1>
        </div>
        <p style="color:#666;font-size:13px;">⏱ Expires in <strong style="color:#fff;">10 minutes</strong>.</p>
        <p style="color:#444;font-size:12px;margin-top:24px;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `
  });
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    if (name.trim().length < 2)
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    // ── Fake email detection ──────────────────────────────────────────────────
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.reason });
    }

    // Check existing
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      // If registered but not verified — resend OTP
      if (!existing.isVerified) {
        const otp = generateOTP();
        existing.emailOTP = otp;
        existing.emailOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
        await existing.save();
        await sendOTPEmail(email, existing.name, otp, 'Verify Your Email');
        return res.status(200).json({
          success: true,
          message: 'Account exists but not verified. New OTP sent!',
          userId: existing._id
        });
      }
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    }

    const otp = generateOTP();
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      emailOTP: otp,
      emailOTPExpire: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOTPEmail(email, name, otp, 'Verify Your Email');

    res.status(201).json({
      success: true,
      message: 'Account created! OTP sent to your email.',
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VERIFY EMAIL OTP ─────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp)
      return res.status(400).json({ success: false, message: 'userId and OTP are required' });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isVerified)
      return res.status(400).json({ success: false, message: 'Email already verified. Please login.' });

    if (user.emailOTP !== otp.toString())
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check again.' });

    if (user.emailOTPExpire < Date.now())
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });

    user.isVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '🎉 Email verified! Welcome to XTREAME STORE!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified)
      return res.status(400).json({ success: false, message: 'Already verified. Please login.' });

    // Rate limit — don't allow resend within 60 seconds
    if (user.emailOTPExpire && user.emailOTPExpire > Date.now() + 9 * 60 * 1000) {
      return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new OTP.' });
    }

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, user.name, otp, 'New OTP Code');
    res.json({ success: true, message: 'New OTP sent to your email!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isVerified) {
      // Resend OTP automatically
      const otp = generateOTP();
      user.emailOTP = otp;
      user.emailOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendOTPEmail(user.email, user.name, otp, 'Verify Your Email');

      return res.status(403).json({
        success: false,
        message: 'Email not verified. New OTP sent!',
        userId: user._id,
        needsVerification: true
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! 🔥`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── FORGOT PASSWORD — Send OTP ───────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: 'Email is required' });

    // Basic fake email check for forgot password too
    const emailCheck = await validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.reason });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success (don't reveal if email exists — security)
    if (!user) {
      return res.json({
        success: true,
        message: 'If this email is registered, you will receive an OTP.'
      });
    }

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, user.name, otp, 'Reset Your Password');

    res.json({
      success: true,
      message: 'OTP sent to your email!',
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── FORGOT PASSWORD — Verify OTP ─────────────────────────────────────────────
exports.verifyForgotOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (user.emailOTP !== otp.toString())
      return res.status(400).json({ success: false, message: 'Invalid OTP' });

    if (user.emailOTPExpire < Date.now())
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });

    // OTP verified — give a short-lived reset token
    const resetToken = generateToken(user._id);

    // Clear OTP
    user.emailOTP = undefined;
    user.emailOTPExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'OTP verified!', resetToken, userId: user._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── FORGOT PASSWORD — Reset Password ────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword; // pre-save hook will hash it
    user.isVerified = true;
    await user.save();

    res.json({ success: true, message: '✅ Password reset successfully! Please login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.id')
      .populate('wishlist');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SEND MOBILE OTP ──────────────────────────────────────────────────────────
exports.sendMobileOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Enter valid 10-digit Indian mobile number' });
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    // Find or create user by mobile
    let user = await User.findOne({ mobile });

    if (!user) {
      // New user — create temp account
      user = await User.create({
        name: `User${mobile.slice(-4)}`,
        email: `mobile_${mobile}@xtreamestore.temp`,
        password: `temp_${otp}_${Date.now()}`,
        mobile,
        emailOTP: otp,
        emailOTPExpire: otpExpire,
        isVerified: false
      });
    } else {
      user.emailOTP = otp;
      user.emailOTPExpire = otpExpire;
      await user.save();
    }

    await sendSMS(mobile, otp);

    res.json({
      success: true,
      message: 'OTP sent to your mobile!',
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VERIFY MOBILE OTP ────────────────────────────────────────────────────────
exports.verifyMobileOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.emailOTP !== otp.toString())
      return res.status(400).json({ success: false, message: 'Invalid OTP' });

    if (user.emailOTPExpire < Date.now())
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });

    user.isVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '🎉 Mobile verified! Welcome to XTREAME STORE!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
