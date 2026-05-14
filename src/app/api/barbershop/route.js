import mongoose from "mongoose";
import BarberShop from "@/models/Barber";
import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BarberValidation } from "@/lib/validations";
import { Redis } from "@upstash/redis";
// Create instance locally — bypasses Turbopack tree-shaking bug
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(req) {
  try {
    await dbConnect();
    
    // 1. PROPERLY PARSE THE INCOMING DATA
    // Assuming your frontend sends JSON. (If sending FormData for files, let me know!)
    const rawData = await req.json();
    
    // 2. THE SAFETY NET: Check if validation succeeded
    const result = BarberValidation.safeParse(rawData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.format() },
        { status: 400 }
      );
    }

    // 3. OBJECT DESTRUCTURING (No more .get() needed!)
    // Zod already cleaned, trimmed, and converted these to the right types
    const { 
      firstName, lastName, email, phone, password, 
      shopName, services, aadharNumber, dob, gender, 
      lat, lng, aadharFront, aadharBack, selfieWithAadhar 
    } = result.data;

    console.log("📝 Barber signup attempt with email:", email);

    const existingBarber = await BarberShop.findOne({ email });
    if (existingBarber) {
      console.warn("⚠️ Barber already exists with email:", email);
      return NextResponse.json(
        { error: "A barber with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const barber = await BarberShop.create({
      firstName, lastName, email, phone,
      password: hashedPassword,
      shopName, services, aadharNumber,
      dob, // Zod already converted this to a Date object!
      gender,
      aadharFront, 
      aadharBack, 
      selfieWithAadhar,
      lat, lng
    });

    console.log("✅ Barber registered successfully with ID:", barber._id, "Email:", barber.email);

    // geoadd with flat args
    try {
      const geoResult = await fetch(
        `${process.env.UPSTASH_REDIS_REST_URL}/geoadd/Barber/${lng}/${lat}/${barber._id.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          },
        }
      );
      const geoData = await geoResult.json();
      console.log("Barber added to Redis:", geoData);
    } catch (redisError) {
      console.error("Redis geoadd failed:", redisError.message);
    }

    const { password: _, ...barberData } = barber.toObject();
    
    return NextResponse.json(
      { message: "Barber registered successfully", barber: barberData },
      { status: 201 }
    );

  } catch (error) {
    console.error("Barber registration error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A barber with this email already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}