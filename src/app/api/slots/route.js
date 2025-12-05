import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Slot from "@/models/Slot";
import Barber from "@/models/Barber";

// GET /api/slots?barberId=&date=
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const barberId = searchParams.get("barberId");
    const date = searchParams.get("date");

    if (!barberId || !date) {
      return NextResponse.json({ error: "barberId and date are required" }, { status: 400 });
    }

    const slots = await Slot.find({ barber: barberId, date }).sort({ time: 1 });
    return NextResponse.json({ data: slots });
  } catch (e) {
    console.error("GET slots error", e);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}

// POST /api/slots  { barberId, date, times: ["10:00","10:30" ] }
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { barberId, date, times } = body;

    if (!barberId || !date || !Array.isArray(times)) {
      return NextResponse.json({ error: "barberId, date, times required" }, { status: 400 });
    }

    const barber = await Barber.findById(barberId);
    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    for (const time of times) {
      try {
        await Slot.create({ barber: barberId, date, time });
      } catch (_) {
        // ignore duplicate key
      }
    }

    const allForDay = await Slot.find({ barber: barberId, date }).sort({ time: 1 });
    return NextResponse.json({ data: allForDay }, { status: 201 });
  } catch (e) {
    console.error("POST slots error", e);
    return NextResponse.json({ error: "Failed to create slots" }, { status: 500 });
  }
}

// DELETE /api/slots?id=
export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await Slot.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE slot error", e);
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}


