const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect, adminOnly } = require('../middleware/auth');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isCloudinaryConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

// ─── Multer (memory → Cloudinary) ────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max (videos)
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    ok ? cb(null, true) : cb(new Error('Only image and video files are allowed'), false);
  }
});

// ─── POST /api/upload — Upload images & videos ────────────────────────────────

router.post('/', protect, adminOnly,
  (req, res, next) => {
    upload.array('images', 10)(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      if (!isCloudinaryConfigured()) {
        return res.status(503).json({
          success: false,
          message: 'Cloudinary not configured. Add credentials to server/.env'
        });
      }

      configureCloudinary();

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files provided' });
      }

      const uploadPromises = req.files.map((file) => {
        const isVideo = file.mimetype.startsWith('video/');
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'xtreame-store',
              resource_type: isVideo ? 'video' : 'image',
              ...(isVideo
                ? { chunk_size: 6000000 }
                : { transformation: [{ quality: 'auto', fetch_format: 'auto' }] }
              )
            },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url:      result.secure_url,
                publicId: result.public_id,
                type:     isVideo ? 'video' : 'image'
              });
            }
          );
          stream.end(file.buffer);
        });
      });

      const images = await Promise.all(uploadPromises);
      res.json({ success: true, images });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ─── DELETE /api/upload/:publicId — Delete from Cloudinary ───────────────────

router.delete('/:publicId', protect, adminOnly, async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({ success: false, message: 'Cloudinary not configured' });
    }
    configureCloudinary();
    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
