import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // Ensure this matches your file path
import Barber from "@/models/Barber"; // Standard model naming

// We use GET because we are fetching data, not creating it.
export async function GET(req) {
  try {
    await connectDB();

    // 1. Get the city from URL Query Params
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    // 2. Validate Input
    if (!city || city.trim() === '') {
      return NextResponse.json(
        { error: "City parameter is required" },
        { status: 400 }
      );
    }

    // 3. Sanitize Input (Prevent Regex crashes with special chars)
    // If user types "Delhi+", the "+" would break regex without this.
    const safeCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 4. Search in Database
    // $regex with 'i' makes it Case Insensitive (delhi == Delhi == DELHI)
    const results = await Barber.find({ 
      location: { $regex: safeCity, $options: "i" },
      isAvailable: true // Optional: Only show available barbers?
    })
    .select('-password -aadharNumber -aadharFront -aadharBack -selfieWithAadhar');

    // 5. Return Results
    return NextResponse.json({ 
      success: true,
      count: results.length,
      data: results 
    }, { status: 200 });

  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch barbers" }, 
      { status: 500 }
    );
  }
}