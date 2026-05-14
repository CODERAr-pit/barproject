import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Barber from "@/models/Barber";
import mongoose from "mongoose";
import { hashids } from "@/lib/hash"; // 👈 1. Import your hash tool!

export async function POST(request) {
  try {
    await connectDB();
    const { lng, lat } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and Longitude required" },
        { status: 400 }
      );
    }

    const redisRes = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/geosearch/Barber/FROMLONLAT/${Number(lng)}/${Number(lat)}/BYRADIUS/5/km/ASC/WITHDIST`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      }
    );

    const redisData = await redisRes.json();

    const barberIdList = redisData.result;

    if (!barberIdList || barberIdList.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const barberIds = barberIdList.map(item => new mongoose.Types.ObjectId(item[0]));
    const distanceMap = {};
    barberIdList.forEach(item => {
      distanceMap[item[0]] = parseFloat(item[1]).toFixed(2); 
    });

    const barbers = await Barber.find({
      _id: { $in: barberIds }
    }).select("-password");

    // 2. 🛡️ THE SHIELD: Convert to HashID right before it leaves the server
    const barbersWithDistance = barbers.map(barber => {
      const rawIdStr = barber._id.toString();
      const safeData = barber.toObject();
      
      // Delete the raw internal ID so hackers can't see it in the network tab
      delete safeData._id; 

      return {
        ...safeData,
        id: hashids.encodeHex(rawIdStr), // 👈 Inject the secure HashID
        distance: `${distanceMap[rawIdStr]} km`
      };
    });

    return NextResponse.json({ data: barbersWithDistance });

  } catch (error) {
    console.error("Redis Geosearch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}