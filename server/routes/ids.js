const express = require('express');
const router = express.Router();
const {
  getAllIDs,
  getIDById,
  getFeaturedIDs,
  getTrendingIDs,
  getIDsByCategory
} = require('../controllers/idController');

router.get('/', getAllIDs);
router.get('/featured', getFeaturedIDs);
router.get('/trending', getTrendingIDs);
router.get('/category/:category', getIDsByCategory);
router.get('/:id', getIDById);

module.exports = router;
