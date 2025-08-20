const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BarberShop', // References the BarberShop collection
    required: true
  },
  date: {
    type: String, // Using string format "YYYY-MM-DD"
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/ // Validates YYYY-MM-DD format
  },
  times: [{
    type: String,
    required: true,
    match: /^\d{2}:\d{2}$/ // Validates HH:MM format
  }],
  booked: [{
    type: String,
    match: /^\d{2}:\d{2}$/ // Validates HH:MM format
  }]
}, {
  timestamps: true
});

// Compound index to ensure one availability record per barber per date
availabilitySchema.index({ barberId: 1, date: 1 }, { unique: true });

// Index for date queries
availabilitySchema.index({ date: 1 });

// Virtual to get available times (times - booked)
availabilitySchema.virtual('availableTimes').get(function() {
  return this.times.filter(time => !this.booked.includes(time));
});

// Method to book a time slot
availabilitySchema.methods.bookTimeSlot = function(timeSlot) {
  if (this.times.includes(timeSlot) && !this.booked.includes(timeSlot)) {
    this.booked.push(timeSlot);
    return true;
  }
  return false;
};

// Method to cancel a booking
availabilitySchema.methods.cancelBooking = function(timeSlot) {
  const index = this.booked.indexOf(timeSlot);
  if (index > -1) {
    this.booked.splice(index, 1);
    return true;
  }
  return false;
};

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;