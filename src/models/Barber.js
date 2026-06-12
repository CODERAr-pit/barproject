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
    type: String, 
    default: null,
  },
  barberImage: {
    type: String,
    default: null,
  },
  aadharNumber: {
    type: String,
    required: true,
    match: /^\d{12}$/,       
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
  
  schedule: {
    workingDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    
    openTime: { type: String, default: "09:00" }, 
    closeTime: { type: String, default: "17:00" },
    
    breakStart: { type: String, default: "13:00" },
    breakEnd: { type: String, default: "14:00" },
    blockedSlots: [
  {
    date: { type: String, required: true }, 
    slots: [{ type: String }]    
  }
]
  },
});

export default mongoose.models.Barber || mongoose.model("Barber", BarberSchema);