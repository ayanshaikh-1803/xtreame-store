const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  addID, updateID, deleteID, markSold, markAvailable,
  getAllUsers, deleteUser, getAnalytics
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

router.post('/ids', addID);
router.put('/ids/:id', updateID);
router.delete('/ids/:id', deleteID);
router.patch('/ids/:id/sold', markSold);
router.patch('/ids/:id/available', markAvailable);

module.exports = router;
