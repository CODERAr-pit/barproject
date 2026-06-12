import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    // 1. Who is the Barber?
    barber: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Barber", 
      required: true 
    },

    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    date: { 
        type: Date, 
        required: true 
    }, 

    startTime: { type: Date, required: true }, // e.g., 2025-11-30T10:00:00Z
    endTime:   { type: Date, required: true }, // e.g., 2025-11-30T10:30:00Z

    serviceType: [{ type: String, required: true }], // "Haircut", "Shave"
    status: { 
      type: String, 
      enum: ["completed", "empty","upcoming"], 
      default: "empty" 
    }
  },
  { timestamps: true }
);

// COMPOUND INDEX: 
// Makes fetching "all bookings for a barber on a specific date" extremely fast
BookingSchema.index({ barber: 1, date: 1 });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);