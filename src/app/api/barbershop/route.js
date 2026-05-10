import mongoose from "mongoose";
import BarberShop from "@/models/Barber";
import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis"; // ← import class, not singleton

// Create instance locally — bypasses Turbopack tree-shaking bug
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(req) {
  try {
    await dbConnect();
    const formData = await req.formData();

    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email')?.toLowerCase().trim();
    const phone = formData.get('phone');
    const password = formData.get('password');
    const shopName = formData.get('shopName');
    const services = JSON.parse(formData.get('services') || '[]');
    const aadharNumber = formData.get('aadharNumber');
    const dob = formData.get('dob');
    const gender = formData.get('gender');
    const lat = formData.get('lat');
    const lng = formData.get('lng');

    console.log("📝 Barber signup attempt with email:", email);

    if (!firstName || !lastName || !email || !phone || !password || !shopName || !aadharNumber || !dob || !gender || !lat || !lng) {
      return NextResponse.json(
        { error: "All required fields (including location) must be filled" },
        { status: 400 }
      );
    }

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
      dob: new Date(dob), gender,
      aadharFront: formData.get('aadharFront')?.name || null,
      aadharBack: formData.get('aadharBack')?.name || null,
      selfieWithAadhar: formData.get('selfieWithAadhar')?.name || null,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });

    console.log("✅ Barber registered successfully with ID:", barber._id, "Email:", barber.email);

    // geoadd with flat args — same fix as geosearch
    try {
  const geoResult = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/geoadd/Barber/${parseFloat(lng)}/${parseFloat(lat)}/${barber._id.toString()}`,
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