import { redis } from "../../../lib/redis";
import { NextResponse } from "next/server";

export async function POST(request) {
  const requestBody = await request.json();
  const { lat, lng } = requestBody;

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Latitude and Longitude required" },
      { status: 400 }
    );
  }

  const result = await redis.geosearch(
    "Barber",
    {
      latitude: lat,
      longitude: lng,
    },
    {
      radius: 8,
      unit: "km",
    }
  );

  return NextResponse.json({
    data: result,
  });
}