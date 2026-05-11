import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Barber from "@/models/Barber"; // 1. Using the correct import name
import Hashids from 'hashids';
import { getServerSession } from "next-auth";
// 👇 Change this line to point to your lib/auth file!
import { authOptions } from "@/lib/auth";

const hashids = new Hashids("your_secret_salt", 8);

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. You must be logged in." }, 
        { status: 401 }
      );
    }
  try {
    await dbConnect();
    const resolvedParams = await params; 
  
    // Check if ID is a valid MongoDB ObjectId (24 hex chars) or Hashid
    let originalId = resolvedParams.id;
    const isValidMongoId = /^[0-9a-f]{24}$/i.test(originalId);
    
    if (!isValidMongoId) {
      // Try to decode as Hashid
      originalId = hashids.decodeHex(originalId);
    }
    
    if (!originalId || originalId === "") {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }
    
    // 2. Direct lookup
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
    
    const resolvedParams = await params;
    let originalId = resolvedParams.id;
    const isValidMongoId = /^[0-9a-f]{24}$/i.test(originalId);
    
    if (!isValidMongoId) {
      // Try to decode as Hashid
      originalId = hashids.decodeHex(originalId);
    }
    
    if (!originalId || originalId === "") {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }
    
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