import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BarberShop from "@/models/Barber";
import { getServerSession } from "next-auth"; // assuming you're using next-auth
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { shopName, location, services } = await req.json();

    const newShop = new BarberShop({
      userId: session.user.id, 
      shopName,
      location,
      services,
    });

    await newShop.save();

    return NextResponse.json(newShop, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to register barber shop" },
      { status: 500 }
    );
  }
}
