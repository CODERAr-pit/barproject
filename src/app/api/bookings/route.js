import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Barber from "@/models/Barber"; 
import User from "@/models/User"; 
import { redis } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BookingValidation, GetQueryValidation } from "@/lib/validations";
import { Client } from "@upstash/qstash";
import Hashids from "hashids";

const hashids = new Hashids("your_secret_salt", 8); 
const qstash = new Client({ token: process.env.QSTASH_TOKEN });

function createIstDate(dateStr, timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");

  if (hours === "12") hours = modifier === "AM" ? "00" : "12";
  else if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();

  const formattedHours = hours.padStart(2, '0');
  const formattedMinutes = minutes.padStart(2, '0');

  return new Date(`${dateStr}T${formattedHours}:${formattedMinutes}:00+05:30`);
}

const getBusySlots = async (barberID, dateString) => {
  const barber = await Barber.findById(barberID);
  
  if (!barber) {
    throw new Error("Barber not found");
  }

  // 🚨 THE FIX: If the DB doesn't have a schedule yet, build a temporary default one!
  const schedule = barber.schedule || {
    openTime: "09:00",
    closeTime: "17:00",
    breakStart: null,
    breakEnd: null,
    blockedSlots: []
  };

  const startOfDay = new Date(`${dateString}T00:00:00+05:30`);
  const endOfDay = new Date(`${dateString}T23:59:59+05:30`);
  
  const bookedSlots = await Booking.find({
    barber: barberID,
    startTime: { $gte: startOfDay, $lte: endOfDay },
    status: "confirmed",
  });
  
  let allBusy = [...bookedSlots];

  // Notice we now use 'schedule.' instead of 'barber.schedule.'
  if (schedule.breakStart && schedule.breakEnd) {
    allBusy.push({
      startTime: new Date(`${dateString}T${schedule.breakStart}:00+05:30`),
      endTime: new Date(`${dateString}T${schedule.breakEnd}:00+05:30`)
    });
  }

  if (schedule.blockedSlots?.length > 0) {
    const dayBlock = schedule.blockedSlots.find(bs => bs.date === dateString);
    if (dayBlock?.slots?.length > 0) {
      const formattedBlockedSlots = dayBlock.slots.map((timeStr) => {
        const slotStart = createIstDate(dateString, timeStr);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000); 
        return { startTime: slotStart, endTime: slotEnd };
      });
      allBusy = [...allBusy, ...formattedBlockedSlots];
    }
  }

  return {
    busySlots: allBusy,
    openTime: new Date(`${dateString}T${schedule.openTime || "09:00"}:00+05:30`),
    closeTime: new Date(`${dateString}T${schedule.closeTime || "17:00"}:00+05:30`)
  };
};

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const rawQueryParams = Object.fromEntries(searchParams.entries());
    const result = GetQueryValidation.safeParse(rawQueryParams);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid parameters", details: result.error.format() }, { status: 400 });
    }

    const { userId, barberId, date, scope, duration } = result.data; 
    await dbConnect();

    if (barberId && scope === 'upcoming') {
      if (session.user.id !== barberId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      
      const today = new Date();
      const nextDay = new Date();
      nextDay.setDate(today.getDate() + 7); 
      
      const rawBarberId = hashids.decodeHex(barberId);
      const upcomingBookings = await Booking.find({
        barber: rawBarberId,
        startTime: { $gte: today, $lte: nextDay }, 
        status: "confirmed"
      }).populate('user', 'firstName lastName phone').sort({ startTime: 1 }); 
      
      return NextResponse.json({ data: upcomingBookings }, { status: 200 }); 
    }
    // 1. User History
    // 1. User History
    if (userId) {
      // Decode BOTH the URL ID and the Session ID to compare Apples to Apples
      let rawUserId = hashids.decodeHex(userId) || (userId.length === 24 ? userId : null);
      let sessionMongoId = hashids.decodeHex(session.user.id) || (session.user.id.length === 24 ? session.user.id : null);

      if (!rawUserId) return NextResponse.json({ error: "Invalid User ID format." }, { status: 400 });

      // 🚨 THE FIX: Compare decoded IDs
      if (sessionMongoId !== rawUserId && session.user.role !== "barber") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      
      const history = await Booking.find({ user: rawUserId }).populate('barber', 'shopName shopImage').sort({ startTime: -1 });
      return NextResponse.json({ data: history }, { status: 200 });
    }

    // 2. Barber Dashboard
    if (barberId && scope === 'upcoming') {
      let rawBarberId = hashids.decodeHex(barberId) || (barberId.length === 24 ? barberId : null);
      let sessionMongoId = hashids.decodeHex(session.user.id) || (session.user.id.length === 24 ? session.user.id : null);

      if (!rawBarberId) return NextResponse.json({ error: "Invalid Barber ID format." }, { status: 400 });

      // 🚨 THE FIX: Compare decoded IDs
      if (sessionMongoId !== rawBarberId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      
      const today = new Date();
      const nextDay = new Date();
      nextDay.setDate(today.getDate() + 7); 
      
      const upcomingBookings = await Booking.find({
        barber: rawBarberId,
        startTime: { $gte: today, $lte: nextDay }, 
        status: "confirmed"
      }).populate('user', 'firstName lastName phone').sort({ startTime: 1 }); 
      
      return NextResponse.json({ data: upcomingBookings }, { status: 200 }); 
    }
    // 1. User History
    if (userId) {
     
      let rawUserId = hashids.decodeHex(userId);
      if (!rawUserId && userId.length === 24) {
        rawUserId = userId;
      }
      if (!rawUserId || rawUserId.length !== 24) {
        return NextResponse.json({ error: "Invalid User ID format." }, { status: 400 });
      }
      if (session.user.id !== rawUserId && session.user.role !== "barber") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      
      const history = await Booking.find({ user: rawUserId })
        .populate('barber', 'shopName shopImage')
        .sort({ startTime: -1 });
        
      return NextResponse.json({ data: history }, { status: 200 });
    }
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  } catch (error) {
    console.error("GET Bookings Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ==========================================
// POST ROUTE: Create a New Booking
// ==========================================
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });

  try {
    const body = await request.json();
    body.user = session.user.id; 
    
    const result = BookingValidation.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid booking data", details: result.error.format() }, { status: 400 });
    }

    const { barber, user, date, start, end, service } = result.data;
    
    // ---------------------------------------------------------
    // 1. DECODE BARBER ID
    // ---------------------------------------------------------
    let rawBarberId = hashids.decodeHex(barber);
    if (!rawBarberId && barber.length === 24) {
      rawBarberId = barber;
    }
    if (!rawBarberId || rawBarberId.length !== 24) {
      return NextResponse.json({ error: "Invalid Barber ID format." }, { status: 400 });
    }

    // ---------------------------------------------------------
    // 2. DECODE USER ID 
    // ---------------------------------------------------------
    let rawUserId = hashids.decodeHex(user);
    if (!rawUserId && user.length === 24) {
      rawUserId = user;
    }
    if (!rawUserId || rawUserId.length !== 24) {
      return NextResponse.json({ error: "Invalid User ID format." }, { status: 400 });
    }

    const dbStartTime = createIstDate(date, start);
    const dbEndTime = createIstDate(date, end);
    const dbDateOnly = new Date(`${date}T00:00:00+05:30`);
    const startTimeStamp = dbStartTime.getTime();

    const lockKey = `lock:barber:${rawBarberId}:time:${startTimeStamp}`;
    const lockAcquired = await redis.set(lockKey, "locked", { nx: true, ex: 10 });

    if (!lockAcquired) {
      return NextResponse.json({ message: "High demand! Someone else is currently viewing this slot. Try again." }, { status: 409 });
    }

    await dbConnect();

    try {
      const barberDoc = await Barber.findById(rawBarberId);
      if (barberDoc?.schedule?.blockedSlots) {
        const dayBlock = barberDoc.schedule.blockedSlots.find(bs => bs.date === date);
        if (dayBlock?.slots?.includes(start)) { 
          return NextResponse.json({ message: "This slot has been manually blocked by the barber." }, { status: 409 });
        }
      }

      const existingBooking = await Booking.findOne({
        barber: rawBarberId,
        date: dbDateOnly,
        status: "",
        $and: [
          { startTime: { $lt: dbEndTime } },
          { endTime: { $gt: dbStartTime } },
        ],
      });

      if (existingBooking) return NextResponse.json({ message: "Slot already taken" }, { status: 409 });
      
      const newBooking = await Booking.create({
        barber: rawBarberId,
        user: rawUserId,
        date: dbDateOnly,
        startTime: dbStartTime,
        endTime: dbEndTime,
        serviceType: service,
        status: "confirmed",
      });

      const currUser = await User.findById(rawUserId);
      if (currUser && barberDoc) {
        await qstash.publishJSON({
          url: "https://barproject.vercel.app/api/email", 
          body: {
            email: currUser.email,
            barberName: barberDoc.shopName,
            time: start
          },
        }).catch(e => console.error("Qstash Email Error:", e)); 
      }

      return NextResponse.json({ success: true, data: newBooking }, { status: 201 });

    } finally {
      await redis.del(lockKey);
    }

  } catch (error) {
    console.error("Booking POST Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}