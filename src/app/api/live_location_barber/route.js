import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Barber from "@/models/Barber";
import mongoose from "mongoose";

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

    // Call Upstash REST API directly — no SDK needed
    const redisRes = await fetch(
  `${process.env.UPSTASH_REDIS_REST_URL}/geosearch/Barber/FROMLONLAT/${Number(lng)}/${Number(lat)}/BYRADIUS/5/km/ASC/WITHDIST`,
  {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
  }
);

const redisData = await redisRes.json();
console.log("Geosearch results:", redisData);

// With WITHDIST, result is array of [memberId, distance] pairs
// e.g. [["barberId1", "0.5432"], ["barberId2", "2.1234"]]
const barberIdList = redisData.result;

if (!barberIdList || barberIdList.length === 0) {
  return NextResponse.json({ data: [] });
}

// Separate IDs and distances
const barberIds = barberIdList.map(item => new mongoose.Types.ObjectId(item[0]));
const distanceMap = {};
barberIdList.forEach(item => {
  distanceMap[item[0]] = parseFloat(item[1]).toFixed(2); // km, 2 decimal places
});

const barbers = await Barber.find({
  _id: { $in: barberIds }
}).select("-password");

// Attach distance to each barber object
const barbersWithDistance = barbers.map(barber => ({
  ...barber.toObject(),
  distance: `${distanceMap[barber._id.toString()]} km`
}));

return NextResponse.json({ data: barbersWithDistance });

  } catch (error) {
    console.error("Redis Geosearch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}