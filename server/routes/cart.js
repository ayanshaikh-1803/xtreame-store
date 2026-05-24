const express = require('express');
const router = express.Router();
const { protect, verifiedOnly } = require('../middleware/auth');
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');

router.use(protect, verifiedOnly);

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove/:idId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
