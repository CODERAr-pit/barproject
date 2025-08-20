import { NextResponse } from "next/server";
import connectDB from '@/lib/db'
import Barber from '@/models/Barber'
export async function POST(req) {
    await connectDB()
   try{ const {location}=await req.json();
    const barbers=await Barber.find({ location: { $regex: location, $options: "i" } }).sort({ rating: -1 }) //regex for not exact match and options for case insensitive
     return NextResponse.json(barbers);//.sort new for me and .limit restrict only top 10 choices
}
catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}