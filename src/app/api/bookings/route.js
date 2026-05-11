import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Barber from "@/models/Barber"; 
import User from "@/models/User"; // Import User to populate customer details
import {redis} from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// ... (Keep your existing getBusySlots helper here) ...
const getBusySlots = async (barberID, dateString) => {
  const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateString}T23:59:59.999Z`);
  
  // 1. Fetch Actual Bookings from Database 
  const bookedSlots = await Booking.find({
    barber: barberID,
    startTime: { $gte: startOfDay, $lte: endOfDay },
    status: "confirmed",
  });
  
  const barber = await Barber.findById(barberID);
  let formattedBlockedSlots = [];

  console.log("🔍 DEBUG - Checking blocked slots for barber:", barberID);
  console.log("🔍 DEBUG - Barber exists:", barber ? "YES" : "NO");
  console.log("🔍 DEBUG - barber.schedule:", barber?.schedule);
  console.log("🔍 DEBUG - barber.schedule.blockedSlots:", barber?.schedule?.blockedSlots);
  console.log("🔍 DEBUG - Looking for date:", dateString);

  if (barber && barber.schedule && (barber.schedule.blockedSlots || []).length > 0) {
    const dayBlock = barber.schedule.blockedSlots.find(bs => bs.date === dateString);
    console.log("🔍 DEBUG - Found dayBlock for date:", dayBlock);

    if (dayBlock && dayBlock.slots && dayBlock.slots.length > 0) {
      console.log("🔍 DEBUG - Converting blocked slots:", dayBlock.slots);
      formattedBlockedSlots = dayBlock.slots.map((timeStr) => {
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":");
        
        if (hours === "12") {
          hours = modifier === "AM" ? "00" : "12";
        } else if (modifier === "PM") {
          hours = (parseInt(hours, 10) + 12).toString();
        }
        const formattedHours = hours.padStart(2, '0');
        const formattedMinutes = minutes.padStart(2, '0');
        const slotStart = new Date(`${dateString}T${formattedHours}:${formattedMinutes}:00.000Z`);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

        console.log(`📍 Blocked: "${timeStr}" → ${slotStart.toISOString()}`);
        return {
          startTime: slotStart,
          endTime: slotEnd
        };
      });
      console.log("✅ Total blocked slots converted:", formattedBlockedSlots.length);
    }
  }
  const allBusy = [...bookedSlots, ...formattedBlockedSlots];
  console.log("⚠️  Total busy slots:", allBusy.length, "(Bookings:", bookedSlots.length, "+ Blocked:", formattedBlockedSlots.length + ")");
  return allBusy;
};

export async function GET(request) {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in to book an appointment." }, 
        { status: 401 }
      );
    }
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const barberId = searchParams.get('barberId');
    const date = searchParams.get('date');
    const scope = searchParams.get('scope'); // New param to detect 'upcoming'

    // --- SCENARIO : Get Customer History (For User Profile) ---
    if (userId) {
      const history = await Booking.find({ user: userId })
        .populate('barber', 'shopName shopImage')
        .sort({ startTime: -1 });
      if(!history){console.log("Issue yhii h")}
      return NextResponse.json({ data: history }, { status: 200 });
    }

    // (For Barber Dashboard) ---
    // Triggered when we send ?barberId=...&scope=upcoming
    if (barberId && scope === 'upcoming') {
        
        const today = new Date();
        const nextDay = new Date();
        nextDay.setDate(today.getDate() + 1); // Add 7 days

        const upcomingBookings = await Booking.find({
            barber: barberId,
            startTime: { $gte: today, $lte: nextDay }, // Between Now and 7 days
            status: "confirmed"
        })
        .populate('user', 'firstName lastName phone') // Show who the customer is!
        .sort({ startTime: 1 }); // Sort by SOONEST first

        return NextResponse.json({ data: upcomingBookings }, { status: 200 });
    }

    // --- SCENARIO : Calculate Free Slots (For Booking Page) ---
    if (barberId && date) {
      const busySlots = await getBusySlots(barberId, date);
      
      // Generate slots from 09:00 AM to 11:00 PM IST (converted to UTC)
      // IST = UTC + 5:30, so 09:00 IST = 03:30 UTC, 23:00 IST = 17:30 UTC
      let cursor = new Date(`${date}T03:30:00.000Z`); // 09:00 AM IST
      const endCursor = new Date(`${date}T17:30:00.000Z`); // 11:00 PM IST
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
//  New Booking ---
 // 👉 Import your existing Redis connection

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { barber, user, date, start, end, service } = body;

    const startTimeStamp = new Date(start).getTime();
    const lockKey = `lock:barber:${barber}:time:${startTimeStamp}`;

    const lockAcquired = await redis.set(lockKey, "locked", { nx: true, ex: 10 });

    if (!lockAcquired) {
      // Someone else clicked book at the exact same millisecond!
      return NextResponse.json(
        { message: "High demand! Someone else is currently viewing this slot. Try again." }, 
        { status: 409 }
      );
    }

    try {
      //THE SAFE LOCKED ZOne

      // 2a. Check if slot is blocked
      const barberDoc = await Barber.findById(barber);
      
      if (barberDoc && barberDoc.schedule && barberDoc.schedule.blockedSlots) {
        const dateStr = new Date(date).toISOString().split('T')[0];
        const dayBlock = barberDoc.schedule.blockedSlots.find(bs => bs.date === dateStr);
        
        if (dayBlock && dayBlock.slots) {
          const slotStart = new Date(start);
          
          // Convert UTC to IST (UTC+5:30)
          const istDate = new Date(slotStart.getTime() + 5.5 * 60 * 60 * 1000);
          let hours12 = istDate.getUTCHours();
          const meridiem = hours12 >= 12 ? 'PM' : 'AM';
          if (hours12 > 12) hours12 -= 12;
          if (hours12 === 0) hours12 = 12;
          const slotMinutes = String(istDate.getUTCMinutes()).padStart(2, '0');
          const timeStr = `${String(hours12).padStart(2, '0')}:${slotMinutes} ${meridiem}`;
          
          console.log("🔍 POST - UTC start:", start);
          console.log("🔍 POST - IST converted:", timeStr);
          console.log("🔍 POST - blocked slots:", dayBlock.slots);
          
          if (dayBlock.slots.includes(timeStr)) {
            console.log("❌ POST - BLOCKED! Returning 409");
            return NextResponse.json(
              { message: "This slot has been blocked by the barber." }, 
              { status: 409 }
            );
          }
        }
      }

      // 3. Double-check MongoDB just in case it was booked 5 minutes ago
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

      // 4. Save the new booking
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

    } finally {
      // 5. CRITICAL: Always delete the lock when  done, 
      // even if the database throws an error!
      await redis.del(lockKey);
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}