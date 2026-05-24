const ID = require('../models/ID');

// ─── Get All IDs (with filters, search, sort) ─────────────────────────────────
exports.getAllIDs = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      minPrice,
      maxPrice,
      rank,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { uid: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = decodeURIComponent(category);
    if (status) query.status = status;
    if (rank) query.rank = decodeURIComponent(rank);

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'level_desc') sortOption = { level: -1 };
    else if (sort === 'views') sortOption = { views: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ID.countDocuments(query);
    const ids = await ID.find(query).sort(sortOption).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      ids
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Single ID ────────────────────────────────────────────────────────────
exports.getIDById = async (req, res) => {
  try {
    const id = await ID.findById(req.params.id);
    if (!id) return res.status(404).json({ success: false, message: 'ID not found' });

    // Increment views
    id.views += 1;
    await id.save();

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Featured IDs ─────────────────────────────────────────────────────────
exports.getFeaturedIDs = async (req, res) => {
  try {
    const ids = await ID.find({ featured: true, status: 'available' }).limit(6);
    res.json({ success: true, ids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Trending IDs ─────────────────────────────────────────────────────────
exports.getTrendingIDs = async (req, res) => {
  try {
    const ids = await ID.find({ trending: true, status: 'available' }).limit(8);
    res.json({ success: true, ids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get IDs by Category ──────────────────────────────────────────────────────
exports.getIDsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const ids = await ID.find({ category, status: 'available' });
    res.json({ success: true, ids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
