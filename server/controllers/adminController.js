const ID = require('../models/ID');
const User = require('../models/User');

// ─── Add New ID ───────────────────────────────────────────────────────────────
exports.addID = async (req, res) => {
  try {
    const {
      title, idName, uid, level, price, rank, category,
      description, contact, whatsappLink, contact2, instagramLink, whatsappChannel,
      skins, diamonds, voucher, evoGuns, evoMax, allGunSkins, rareItems,
      featured, trending
    } = req.body;

    // Images come from upload route, passed as array
    const images = req.body.images || [];

    // Auto-assign category from price if not provided
    const getCategory = (p) => {
      if (p < 5000)  return 'Basic ID';
      if (p < 10000) return 'Normal ID';
      if (p < 15000) return 'Best ID';
      if (p < 20000) return 'Super ID';
      return 'Extreme ID';
    };

    const finalCategory = category || getCategory(Number(price));

    const newID = await ID.create({
      title,
      idName:     idName || '',
      uid,
      level:      Number(level),
      price:      Number(price),
      category:   finalCategory,
      rank,
      description,
      contact,
      whatsappLink:    whatsappLink    || '',
      contact2:        contact2        || '',
      instagramLink:   instagramLink   || '',
      whatsappChannel: whatsappChannel || '',
      skins:      Number(skins)    || 0,
      diamonds:   Number(diamonds) || 0,
      voucher:     Number(voucher)     || 0,
      evoGuns:     Number(evoGuns)     || 0,
      evoMax:      Number(evoMax)      || 0,
      allGunSkins: Number(allGunSkins) || 0,
      rareItems:   rareItems           || '',
      images,
      featured: featured === 'true' || featured === true,
      trending: trending === 'true' || trending === true,
      addedBy:  req.user._id
    });

    res.status(201).json({ success: true, message: 'ID added successfully!', id: newID });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update ID ────────────────────────────────────────────────────────────────
exports.updateID = async (req, res) => {
  try {
    const id = await ID.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!id) return res.status(404).json({ success: false, message: 'ID not found' });

    res.json({ success: true, message: 'ID updated successfully!', id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete ID ────────────────────────────────────────────────────────────────
exports.deleteID = async (req, res) => {
  try {
    const id = await ID.findByIdAndDelete(req.params.id);
    if (!id) return res.status(404).json({ success: false, message: 'ID not found' });

    res.json({ success: true, message: 'ID deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Mark as Sold ─────────────────────────────────────────────────────────────
exports.markSold = async (req, res) => {
  try {
    const id = await ID.findByIdAndUpdate(
      req.params.id,
      { status: 'sold' },
      { new: true }
    );

    if (!id) return res.status(404).json({ success: false, message: 'ID not found' });

    res.json({ success: true, message: 'ID marked as sold!', id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Mark as Available ────────────────────────────────────────────────────────
exports.markAvailable = async (req, res) => {
  try {
    const id = await ID.findByIdAndUpdate(
      req.params.id,
      { status: 'available' },
      { new: true }
    );

    if (!id) return res.status(404).json({ success: false, message: 'ID not found' });

    res.json({ success: true, message: 'ID marked as available!', id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete User ──────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json({ success: true, total: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Analytics Dashboard ──────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const totalIDs = await ID.countDocuments();
    const availableIDs = await ID.countDocuments({ status: 'available' });
    const soldIDs = await ID.countDocuments({ status: 'sold' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalViews = await ID.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const categoryStats = await ID.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const recentIDs = await ID.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      analytics: {
        totalIDs,
        availableIDs,
        soldIDs,
        totalUsers,
        totalViews: totalViews[0]?.total || 0,
        categoryStats,
        recentIDs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
