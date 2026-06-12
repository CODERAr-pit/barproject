import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Barber from "@/models/Barber";
import mongoose from "mongoose";
import { hashids } from "@/lib/hash";

export async function POST(request) {
  try {
    await connectDB();
    
    const { lng, lat, limit = 10 } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and Longitude required" },
        { status: 400 }
      );
    }

    const redisRes = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/geosearch/Barber/FROMLONLAT/${Number(lng)}/${Number(lat)}/BYRADIUS/5/km/ASC/WITHDIST/COUNT/${Number(limit)}`,
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

    const barbersWithDistance = barbers.map(barber => {
      const rawIdStr = barber._id.toString();
      const safeData = barber.toObject();
      
      delete safeData._id; 

      return {
        ...safeData,
        id: hashids.encodeHex(rawIdStr), 
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