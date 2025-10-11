import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { username, email, password } = await req.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "A user with this username already exists" },
          { status: 400 }
        );
      }
    }

    // Create new user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password, // Password will be hashed by the pre-save middleware
      role: "customer" // Default role
    });

    // Remove password from response
    const { password: _, ...userData } = user.toObject();

    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: userData 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User creation error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A user with this email or username already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
