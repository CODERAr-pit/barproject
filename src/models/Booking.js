import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    // 1. Who is the Barber?
    barber: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Barber", 
      required: true 
    },

    // 2. Who is the User? (We discussed this earlier)
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // 3. The Date (For filtering queries fast)
    date: { 
        type: Date, 
        required: true 
    }, 

    // 4. The Time Range (Crucial for Conflict Detection)
    startTime: { type: Date, required: true }, // e.g., 2025-11-30T10:00:00Z
    endTime:   { type: Date, required: true }, // e.g., 2025-11-30T10:30:00Z

    // 5. Details
    serviceType: { type: String, required: true }, // "Haircut", "Shave"
    status: { 
      type: String, 
      enum: ["confirmed", "empty"], 
      default: "empty" 
    }
  },
  { timestamps: true }
);

// COMPOUND INDEX: 
// Makes fetching "all bookings for a barber on a specific date" extremely fast
BookingSchema.index({ barber: 1, date: 1 });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);