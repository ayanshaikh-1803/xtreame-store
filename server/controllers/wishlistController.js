const User = require('../models/User');
const ID = require('../models/ID');

// ─── Get Wishlist ─────────────────────────────────────────────────────────────
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Toggle Wishlist ──────────────────────────────────────────────────────────
exports.toggleWishlist = async (req, res) => {
  try {
    const { idId } = req.body;

    const gameId = await ID.findById(idId);
    if (!gameId) return res.status(404).json({ success: false, message: 'ID not found' });

    const user = await User.findById(req.user._id);
    const index = user.wishlist.indexOf(idId);

    let message;
    if (index === -1) {
      user.wishlist.push(idId);
      message = 'Added to wishlist!';
    } else {
      user.wishlist.splice(index, 1);
      message = 'Removed from wishlist';
    }

    await user.save();
    res.json({ success: true, message, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
