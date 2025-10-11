import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BarberShop from "@/models/Barber";

export async function POST(req) {
  try {
    await connectDB();

    const { city } = await req.json();

    // Validate input
    if (!city || city.trim() === '') {
      return NextResponse.json(
        { error: "City parameter is required" },
        { status: 400 }
      );
    }

    // Search for barbers in the specified city with case-insensitive matching
    const results = await BarberShop.find({ 
      location: { $regex: city, $options: "i" } 
    }).select('-password -aadharNumber -aadharFront -aadharBack -selfieWithAadhar');

    return NextResponse.json({ 
      data: results,
      count: results.length,
      city: city 
    }, { status: 200 });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch barbers" }, 
      { status: 500 }
    );
  }
}