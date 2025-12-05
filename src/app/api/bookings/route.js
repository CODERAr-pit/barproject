import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Barber from "@/models/Barber"; 
import User from "@/models/User"; // Import User to populate customer details

// ... (Keep your existing getBusySlots helper here) ...
const getBusySlots = async (barberID, dateString) => {
  const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateString}T23:59:59.999Z`);
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
    const scope = searchParams.get('scope'); // New param to detect 'upcoming'

    // --- SCENARIO A: Get Customer History (For User Profile) ---
    if (userId) {
      const history = await Booking.find({ user: userId })
        .populate('barber', 'shopName location shopImage')
        .sort({ startTime: -1 });
      return NextResponse.json({ data: history }, { status: 200 });
    }

    // --- SCENARIO B: Get Barber's Upcoming 7 Days (For Barber Dashboard) ---
    // Triggered when we send ?barberId=...&scope=upcoming
    if (barberId && scope === 'upcoming') {
        
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7); // Add 7 days

        const upcomingBookings = await Booking.find({
            barber: barberId,
            startTime: { $gte: today, $lte: nextWeek }, // Between Now and 7 days
            status: "confirmed"
        })
        .populate('user', 'firstName lastName phone') // Show who the customer is!
        .sort({ startTime: 1 }); // Sort by SOONEST first

        return NextResponse.json({ data: upcomingBookings }, { status: 200 });
    }

    // --- SCENARIO C: Calculate Free Slots (For Booking Page) ---
    if (barberId && date) {
      const busySlots = await getBusySlots(barberId, date);
      let cursor = new Date(`${date}T09:00:00.000Z`); 
      const endCursor = new Date(`${date}T17:00:00.000Z`);
      const freeSlots = [];

      while (cursor < endCursor) {
        const slotStart = new Date(cursor);
        const slotEnd = new Date(cursor.getTime() + 30 * 60000); 
        let isConflict = false;

        for (let booking of busySlots) {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          if (slotStart < bookingEnd && slotEnd > bookingStart) {
            isConflict = true;
            break;
          }
        }
        if (!isConflict) freeSlots.push(slotStart.toISOString());
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
// --- SCENARIO C: Create New Booking ---
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { barber, user, date, start, end, service } = body;

    // Conflict Check: confirmed bookings for barber on date overlapping the requested time
    const existingBooking = await Booking.findOne({
      barber,
      date,
      status: "confirmed",
      $and: [
        { startTime: { $lt: new Date(end) } },
        { endTime: { $gt: new Date(start) } },
      ],
    });

    if (existingBooking) {
      return NextResponse.json({ message: "Slot already taken" }, { status: 409 });
    }

    const newBooking = await Booking.create({
      barber,
      user,
      date,
      startTime: new Date(start),
      endTime: new Date(end),
      serviceType: service,
      status: "confirmed",
    });

    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}