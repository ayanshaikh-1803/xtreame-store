const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

// ─── Startup Config Check ─────────────────────────────────────────────────────
const checkConfig = () => {
  const issues = [];
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<username>')) {
    issues.push('❌ MONGO_URI — not set. Get it from MongoDB Atlas → Connect → Drivers');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_super_secret_jwt_key_here') {
    issues.push('⚠️  JWT_SECRET — using default. Change it to a random string for security.');
  }
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    issues.push('ℹ️  EMAIL_USER — not set. OTPs will print to console (dev mode).');
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name' || !process.env.CLOUDINARY_API_KEY) {
    issues.push('ℹ️  CLOUDINARY — not set. Image upload will be disabled.');
  }

  if (issues.length > 0) {
    console.log('\n┌─────────────────────────────────────────────┐');
    console.log('│         XTREAME STORE — Config Check         │');
    console.log('└─────────────────────────────────────────────┘');
    issues.forEach((i) => console.log(' ' + i));
    console.log('');
  }

  // Hard stop only if MongoDB is missing
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<username>')) {
    console.log('🛑 Cannot start without MONGO_URI. See README.md for setup guide.\n');
    process.exit(1);
  }
};

checkConfig();

const app = express();

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/ids',      require('./routes/ids'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/upload',   require('./routes/upload'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🔥 XTREAME STORE API is running!' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─── Database + Server Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔥 XTREAME STORE is live!\n`);
    });
  })
  .catch((err) => {
    console.error('\n❌ MongoDB connection failed:', err.message);
    console.log('\n📋 Troubleshooting:');
    console.log('  1. Check your MONGO_URI in server/.env');
    console.log('  2. Make sure your IP is whitelisted in MongoDB Atlas');
    console.log('     → Atlas → Network Access → Add IP → Allow from anywhere (0.0.0.0/0)');
    console.log('  3. Check your Atlas username and password are correct\n');
    process.exit(1);
  });
