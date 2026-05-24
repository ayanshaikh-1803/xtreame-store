const express = require('express');
const router = express.Router();
const { protect, verifiedOnly } = require('../middleware/auth');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');

router.use(protect, verifiedOnly);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

module.exports = router;
