import mongoose from "mongoose";

const BarberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  shopName: {
    type: String,
    required: true,
    trim: true,
  },
  services: {
    type: [String],
    default: [],
  },
  shopImage: {
    type: String, // store image URL or path
    default: null,
  },
  barberImage: {
    type: String,
    default: null,
  },
  aadharNumber: {
    type: String,
    required: true,
    trim: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  aadharFront: {
    type: String,
    required: true,
  },
  aadharBack: {
    type: String,
    required: true,
  },
  selfieWithAadhar: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
    lat: {
    type: Number,
    required: true,    // <<–– important
  },
  lng: {
    type: Number,
    required: true,    // <<–– important
  },
  upvote: {
    type: Number,
    default: 0,
  },
  downvote: {
    type: Number,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  nextAvailableAt: {
    type: Date,
    default: null,
  },
  
  // ✅ FIXED SCHEDULE SECTION
  schedule: {
    monday: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
      isOff: { type: Boolean, default: false },
    },
    tuesday: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
      isOff: { type: Boolean, default: false },
    },
    wednesday: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
      isOff: { type: Boolean, default: false },
    },
    thursday: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
      isOff: { type: Boolean, default: false },
    },
    friday: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "20:00" }, // Late night!
      isOff: { type: Boolean, default: false },
    },
    saturday: {
      start: { type: String, default: "10:00" },
      end: { type: String, default: "15:00" },
      isOff: { type: Boolean, default: false },
    },
    sunday: {
      start: { type: String, default: "00:00" },
      end: { type: String, default: "00:00" },
      isOff: { type: Boolean, default: true }, // Default Day Off
    },
  },
});

export default mongoose.models.Barber || mongoose.model("Barber", BarberSchema);