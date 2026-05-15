import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Barber from "@/models/Barber"; 
import User from "@/models/User"; 
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BookingValidation, GetQueryValidation, hashedMongoId } from "@/lib/validations";
import { Client } from "@upstash/qstash";
// ... (Your getBusySlots helper stays exactly the same) ...
const qstash = new Client({ token: process.env.QSTASH_TOKEN });

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


  if (barber && barber.schedule && (barber.schedule.blockedSlots || []).length > 0) {
    const dayBlock = barber.schedule.blockedSlots.find(bs => bs.date === dateString);

    if (dayBlock && dayBlock.slots && dayBlock.slots.length > 0) {
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
    }
  }
  const allBusy = [...bookedSlots, ...formattedBlockedSlots];
  return allBusy;
};
export async function GET(request) {
  const session = await getServerSession(authOptions);
    
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawQueryParams = Object.fromEntries(searchParams.entries());
    const result = GetQueryValidation.safeParse(rawQueryParams);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid URL parameters", details: result.error.format() },
        { status: 400 }
      );
    }

    const { userId, barberId, date, scope } = result.data; 
    await dbConnect();

    // --- SCENARIO 1: User History ---
    if (userId) {
      // SECURITY: Prevent users from fetching other people's history!
      if (session.user.id !== userId && session.user.role !== "barber") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }


      const history = await Booking.find({ user: userId })
        .populate('barber', 'shopName shopImage')
        .sort({ startTime: -1 });
        
      return NextResponse.json({ data: history }, { status: 200 });
    }



    // --- SCENARIO 2: Upcoming Bookings (Barber Dashboard) ---
    if (barberId && scope === 'upcoming') {
      console.log("yha -1")
      // SECURITY: Ensure the logged-in barber is fetching their OWN dashboard
      if (session.user.id !== rawQueryParams.barberId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    console.log("yha 0")
      const today = new Date();
      const nextDay = new Date();
      nextDay.setDate(today.getDate() + 7); 
      
      // FIX: Extract the actual string
      console.log("yha 1")
      const upcomingBookings = await Booking.find({
        barber: barberId,
        startTime: { $gte: today, $lte: nextDay }, 
        status: "confirmed"
      })
      .populate('user', 'firstName lastName phone') 
      .sort({ startTime: 1 }); 
      console.log("yha 2")
      return NextResponse.json({ data: upcomingBookings }, { status: 200 });
    }

    // --- SCENARIO 3: Calculate Free Slots (For Booking Page) ---
    if (barberId && date) {
      // FIX: Parse the BARBER ID, not the User ID!

      const busySlots = await getBusySlots(barberId, date);
      
      // ... (Your exact free slot calculation loop stays here) ...
      let cursor = new Date(`${date}T03:30:00.000Z`); 
      const endCursor = new Date(`${date}T17:30:00.000Z`); 
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// NEW BOOKING (POST)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized. Please log in to book." }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // SECURITY FIX: Overwrite whatever user ID the frontend sent with the SECURE session ID.
    // This makes it impossible to book under someone else's name!
    body.user = session.user.id; 

    // Now validate the payload (Assuming BookingValidation handles decoding HashIDs internally)
    const result = BookingValidation.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid booking data", details: result.error.format() },
        { status: 400 }
      );
    }
    await dbConnect();
    
    const { barber,user, date, start, end, service } = result.data;
    
    const startTimeStamp = new Date(start).getTime();
    const lockKey = `lock:barber:${barber}:time:${startTimeStamp}`;

    const lockAcquired = await redis.set(lockKey, "locked", { nx: true, ex: 10 });

    if (!lockAcquired) {
      return NextResponse.json(
        { message: "High demand! Someone else is currently viewing this slot. Try again." }, 
        { status: 409 }
      );
    }

    try {
      // ... (Your exact Timezone, Blocked Slots, and Overlap logic stays here) ...
      const barberDoc = await Barber.findById(barber);
      
      if (barberDoc && barberDoc.schedule && barberDoc.schedule.blockedSlots) {
        const dateStr = new Date(date).toISOString().split('T')[0];
        const dayBlock = barberDoc.schedule.blockedSlots.find(bs => bs.date === dateStr);
        
        if (dayBlock && dayBlock.slots) {
          const slotStart = new Date(start);
          const istDate = new Date(slotStart.getTime() + 5.5 * 60 * 60 * 1000);
          let hours12 = istDate.getUTCHours();
          const meridiem = hours12 >= 12 ? 'PM' : 'AM';
          if (hours12 > 12) hours12 -= 12;
          if (hours12 === 0) hours12 = 12;
          const slotMinutes = String(istDate.getUTCMinutes()).padStart(2, '0');
          const timeStr = `${String(hours12).padStart(2, '0')}:${slotMinutes} ${meridiem}`;
          
          if (dayBlock.slots.includes(timeStr)) {
            return NextResponse.json({ message: "This slot has been blocked." }, { status: 409 });
          }
        }
      }
      const currUser = await User.findById(user);
      const email = currUser.email;
      const shop = await Barber.findById(barber);
      const shopName = shop.shopName;

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

    await qstash.publishJSON({
    url: "https://barproject.vercel.app/api/email", //"https://unfitted-cornbread-progress.ngrok-free.dev/api/email"
    body: {
      email: email,
      barberName: shopName,
      time: start
    },
  });

      return NextResponse.json({ success: true, data: newBooking }, { status: 201 });

    } finally {
      await redis.del(lockKey);
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}