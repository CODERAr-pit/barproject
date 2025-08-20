const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the Users collection
    required: true
  },
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BarberShop', // References the BarberShop collection
    required: true
  },
  slot: {
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/ // Validates HH:MM format
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/ // Validates YYYY-MM-DD format
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent double booking same slot
bookingSchema.index({ barberId: 1, date: 1, slot: 1 }, { unique: true });

// Index for client queries
bookingSchema.index({ clientId: 1, date: 1 });

// Index for barber queries
bookingSchema.index({ barberId: 1, date: 1 });

// Index for status queries
bookingSchema.index({ status: 1 });

// Method to confirm booking
bookingSchema.methods.confirm = function() {
  this.status = 'confirmed';
  return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Static method to find active bookings
bookingSchema.statics.findActiveBookings = function(barberId, date) {
  return this.find({
    barberId: barberId,
    date: date,
    status: 'confirmed'
  });
};

// Static method to check if slot is available
bookingSchema.statics.isSlotAvailable = async function(barberId, date, slot) {
  const existingBooking = await this.findOne({
    barberId: barberId,
    date: date,
    slot: slot,
    status: 'confirmed'
  });
  return !existingBooking;
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;