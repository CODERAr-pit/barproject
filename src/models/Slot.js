import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema(
  {
    barber: { type: mongoose.Schema.Types.ObjectId, ref: "Barber", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD for easy querying
    stime: { type: String, required: true }, // e.g., "10:30"
    etime: { type: String, required: true }, // e.g., "10:30"
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SlotSchema.index({ barber: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.models.Slot || mongoose.model("Slot", SlotSchema);


