const mongoose = require('mongoose');

const barberShopSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the Users collection
    required: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  passWord: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    default:"barber",
    immutable: true
  },
  services: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4,
    immutable: true
  }
}, {
  timestamps: true 
});

// Index for better query performance
barberShopSchema.index({ location: 1 });
barberShopSchema.index({ rating: -1 });
barberShopSchema.index({ userId: 1 });

const BarberShop = mongoose.model('BarberShop', barberShopSchema);

module.exports = BarberShop;