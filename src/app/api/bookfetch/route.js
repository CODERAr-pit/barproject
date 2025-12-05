import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Barber from "@/models/Barber"; // Required for .populate to work

// Helper: Fetch what is already BOOKED (for slot calculation)
const getBusySlots = async (barberID, dateString) => {
  const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateString}T23:59:59.999Z`);

  // Only consider confirmed bookings; Booking schema uses startTime/endTime
  return await Booking.find({
    barber: barberID,
    startTime: { $gte: startOfDay, $lte: endOfDay },
    status: "confirmed",
  });
};

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const barberId = searchParams.get('barberId');
    const date = searchParams.get('date');

    // --- SCENARIO A: Get User History (For Profile Page) ---
    if (userId) {
      const history = await Booking.find({ user: userId })
        .populate('barber', 'shopName location shopImage') // Get Shop Details
        .sort({ startTime: -1 }); // Newest first

      return NextResponse.json({ data: history }, { status: 200 });
    }

    // --- SCENARIO B: Calculate Free Slots (For Booking Page) ---
    if (barberId && date) {
      const busySlots = await getBusySlots(barberId, date);
      
      // Define Work Day: 9:00 AM to 5:00 PM
      let cursor = new Date(`${date}T09:00:00.000Z`); 
      const endCursor = new Date(`${date}T17:00:00.000Z`);
      const freeSlots = [];

      while (cursor < endCursor) {
        const slotStart = new Date(cursor);
        const slotEnd = new Date(cursor.getTime() + 30 * 60000); // +30 mins
        let isConflict = false;

        for (let booking of busySlots) {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          // Overlap Check: slotStart < bookingEnd AND slotEnd > bookingStart
          if (slotStart < bookingEnd && slotEnd > bookingStart) {
            isConflict = true;
            break;
          }
        }

        // Return ISO Strings (Frontend expects strings)
        if (!isConflict) {
          freeSlots.push(slotStart.toISOString());
        }
        cursor.setTime(cursor.getTime() + 30 * 60 * 1000);
      }
      return NextResponse.json({ data: freeSlots }, { status: 200 });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}