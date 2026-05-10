import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Barber from "@/models/Barber"; // 1. Using the correct import name
import Hashids from 'hashids';

const hashids = new Hashids("your_secret_salt", 8);

export async function GET(_req, { params }) {
  try {
    await dbConnect();
    
    // Decode the Hashid string back to the original MongoDB hex string
    const originalId = hashids.decodeHex(params.id); 
  
    // 2. Direct lookup (removed redundant BarberModel.findById call)
    const barber = await Barber.findById(originalId).select("-password -aadharNumber -aadharFront -aadharBack -selfieWithAadhar");
    
    if (!barber) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: barber });
    
  } catch (e) {
    console.error("GET barber detail error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    
    // 3. Make sure to decode the ID here too
    const originalId = hashids.decodeHex(params.id); 
    
    const body = await req.json();
    
    // Allow editing safe fields only
    const allowed = ["firstName","lastName","phone","shopName","services","shopImage","barberImage","isAvailable","nextAvailableAt"];
    const update = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }
    
    const barber = await Barber.findByIdAndUpdate(originalId, update, { new: true }).select("-password");
    if (!barber) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    return NextResponse.json({ data: barber });
  } catch (e) {
    console.error("PATCH barber error", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}