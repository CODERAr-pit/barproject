import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String,
    trim: true 
  }, // For credentials login
  role: { 
    type: String, 
    enum: ["customer", "barber"], 
    default: "customer" 
  },
  image: String, // For OAuth profile images
  emailVerified: Date, // For NextAuth
}, { timestamps: true });

// Hash password before saving (only if password is provided and modified)
userSchema.pre("save", async function(next) {
  if (!this.password || !this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);