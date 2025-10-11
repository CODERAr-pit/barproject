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
  location: {
    type: String,
    required: true,
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
});

export default mongoose.models.Barber || mongoose.model("Barber", BarberSchema);