import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Barber from "@/models/Barber";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    await dbConnect();
    
    const resolvedParams = await params;
    const barberId = resolvedParams.id;
    
    const body = await request.json();
    const { date, slots } = body;

    if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: "Invalid data provided." }, { status: 400 });
    }

    const barber = await Barber.findById(barberId);
    
    if (!barber) {
      return NextResponse.json({ error: "Barber not found." }, { status: 404 });
    }

    // Initialize blockedSlots if it doesn't exist
    if (!barber.schedule.blockedSlots) {
      barber.schedule.blockedSlots = [];
    }

    const dateIndex = barber.schedule.blockedSlots.findIndex(bs => bs.date === date);

    if (dateIndex > -1) {
      const existingSlots = barber.schedule.blockedSlots[dateIndex].slots;
      const mergedSlots = [...new Set([...existingSlots, ...slots])];
      barber.schedule.blockedSlots[dateIndex].slots = mergedSlots;
    } else {
      barber.schedule.blockedSlots.push({ date, slots });
    }

    // Use findByIdAndUpdate to ensure persistence
    const updatedBarber = await Barber.findByIdAndUpdate(
      barberId,
      { "schedule.blockedSlots": barber.schedule.blockedSlots },
      { new: true } // Return updated document
    );

    return NextResponse.json({ 
      success: true, 
      message: `Successfully blocked ${slots.length} slots for ${date}.` 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ BlockSlots API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}