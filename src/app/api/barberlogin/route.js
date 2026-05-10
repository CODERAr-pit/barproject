import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BarberShop from "@/models/Barber";
import bcrypt from "bcryptjs";



export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase for case-insensitive search
    const normalizedEmail = email.toLowerCase().trim();
    console.log("🔍 Searching for barber with email:", normalizedEmail);
    const user = await BarberShop.findOne({ email: normalizedEmail });

    if (!user) {
      console.error("❌ No barber found with email:", normalizedEmail);
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    console.log("✅ Barber found:", user.email);

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return redirect URL instead of using NextResponse.redirect
    const username = user.email.split("@")[0];
    const redirectUrl = `/dashboard/${username}`;

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        redirectUrl,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}