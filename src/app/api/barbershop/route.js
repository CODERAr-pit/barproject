import mongoose from "mongoose";
import BarberShop from "@/models/Barber";
import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await dbConnect();
    
    // Parse FormData
    const formData = await req.formData();
    
    // Extract form fields
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const shopName = formData.get('shopName');
    const services = JSON.parse(formData.get('services') || '[]');
    const aadharNumber = formData.get('aadharNumber');
    const dob = formData.get('dob');
    const gender = formData.get('gender');
    const lat=formData.get('lat');
    const lng=formData.get('lng');
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !shopName ||  !aadharNumber || !dob || !gender) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Check if barber already exists
    const existingBarber = await BarberShop.findOne({ email });
    if (existingBarber) {
      return NextResponse.json(
        { error: "A barber with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new barber
    const barber = await BarberShop.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      shopName,
      services,
      aadharNumber,
      dob: new Date(dob),
      gender,
      aadharFront: formData.get('aadharFront')?.name || null,
      aadharBack: formData.get('aadharBack')?.name || null,
      selfieWithAadhar: formData.get('selfieWithAadhar')?.name || null,
      lat,
      lng
    });

    // Remove password from response
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

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET method removed - barber registration doesn't require authentication
