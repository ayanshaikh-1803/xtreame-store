const mongoose = require('mongoose');

const idSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'ID title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    idName: {
      type: String,
      trim: true,
      maxlength: [50, 'ID Name cannot exceed 50 characters'],
      default: ''
    },
    uid: {
      type: String,
      required: [true, 'UID is required'],
      unique: true,
      trim: true
    },
    level: {
      type: Number,
      required: [true, 'Level is required'],
      min: 1,
      max: 100
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Basic ID', 'Normal ID', 'Best ID', 'Super ID', 'Extreme ID']
    },
    rank: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Grandmaster'],
      default: 'Bronze'
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        type: { type: String, enum: ['image', 'video'], default: 'image' }
      }
    ],
    skins: {
      type: Number,
      default: 0
    },
    diamonds: {
      type: Number,
      default: 0
    },
    // ─── New Fields ───────────────────────────────────────────────────────────
    voucher: {
      type: Number,
      default: 0       // Vault amount in ₹
    },
    evoGuns: {
      type: Number,
      default: 0       // Number of Evo Guns
    },
    evoMax: {
      type: Number,
      default: 0       // Number of Evo Max skins
    },
    allGunSkins: {
      type: Number,
      default: 0       // Total gun skins count
    },
    rareItems: {
      type: String,
      default: ''      // e.g. "Paloma Bundle, Cobra Bundle"
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required']
    },
    whatsappLink: {
      type: String,
      default: ''
    },
    contact2: {
      type: String,
      default: ''
    },
    instagramLink: {
      type: String,
      default: ''
    },
    whatsappChannel: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available'
    },
    featured: {
      type: Boolean,
      default: false
    },
    trending: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// Auto-assign category based on price only if category not already set
idSchema.pre('save', function (next) {
  if (!this.category || this.isModified('price')) {
    const p = this.price;
    if (p < 5000)       this.category = 'Basic ID';
    else if (p < 10000) this.category = 'Normal ID';
    else if (p < 15000) this.category = 'Best ID';
    else if (p < 20000) this.category = 'Super ID';
    else                this.category = 'Extreme ID';
  }
  next();
});

module.exports = mongoose.model('ID', idSchema);
