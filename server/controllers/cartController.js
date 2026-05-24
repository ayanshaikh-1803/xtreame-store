const User = require('../models/User');
const ID = require('../models/ID');

// ─── Get Cart ─────────────────────────────────────────────────────────────────
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.id');
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Add to Cart ──────────────────────────────────────────────────────────────
exports.addToCart = async (req, res) => {
  try {
    const { idId } = req.body;

    const gameId = await ID.findById(idId);
    if (!gameId) return res.status(404).json({ success: false, message: 'ID not found' });
    if (gameId.status === 'sold') {
      return res.status(400).json({ success: false, message: 'This ID is already sold' });
    }

    const user = await User.findById(req.user._id);
    const alreadyInCart = user.cart.some((item) => item.id.toString() === idId);

    if (alreadyInCart) {
      return res.status(400).json({ success: false, message: 'Already in cart' });
    }

    user.cart.push({ id: idId });
    await user.save();

    res.json({ success: true, message: 'Added to cart!', cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Remove from Cart ─────────────────────────────────────────────────────────
exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter((item) => item.id.toString() !== req.params.idId);
    await user.save();

    res.json({ success: true, message: 'Removed from cart', cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Clear Cart ───────────────────────────────────────────────────────────────
exports.clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
