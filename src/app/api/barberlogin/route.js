import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BarberShop from "@/models/Barber";
import bcrypt from "bcryptjs";

// Test endpoint to verify API is working
export async function GET() {
  return NextResponse.json(
    { message: "Barber login API is working! Use POST to login." },
    { status: 200 }
  );
}

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

    const user = await BarberShop.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

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
    const redirectUrl = `/(barber)/dashboard/${username}`;

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        redirectUrl,
        user: {
          email: user.Email,
          username,
        },
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