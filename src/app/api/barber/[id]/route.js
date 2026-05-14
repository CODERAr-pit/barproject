import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Barber from "@/models/Barber"; 
import { getServerSession } from "next-auth";
import { hashedMongoId } from "@/lib/validations";
import { authOptions } from "@/lib/auth";
import { UpdateBarberValidation } from "@/lib/validations";
export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
    
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized. You must be logged in." }, 
      { status: 401 }
    );
  }

  try {
    const { id } = await params; 
    const result = hashedMongoId.safeParse(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid Barber ID" },
        { status: 400 }
      );
    }
    
    const realMongoId = result.data;
    await dbConnect();
    
    // Direct lookup, hiding sensitive fields
    const barber = await Barber.findById(realMongoId).select("-password -aadharNumber -aadharFront -aadharBack -selfieWithAadhar").lean();
    
    if (!barber) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: barber });
    
  } catch (e) {
    console.error("GET barber detail error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  // 1. SECURITY CHECK: Ensure they are logged in
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || session.user.role !== "barber") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params; 

    // 2. AUTHORIZATION CHECK: Prevent Barber A from editing Barber B!
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden. You can only edit your own profile." }, { status: 403 });
    }

    // 3. Zod validation for the URL parameter
    const result = hashedMongoId.safeParse(id);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid Barber ID" }, { status: 400 });
    }

    const realMongoId = result.data;
    const rawBody = await req.json();

    const bodyResult = UpdateBarberValidation.safeParse(rawBody);

    if (!bodyResult.success) {
      return NextResponse.json(
        { error: "Invalid update data", details: bodyResult.error.format() }, 
        { status: 400 }
      );
    }
    const safeUpdateData = bodyResult.data;
    
    await dbConnect();

    const barber = await Barber.findByIdAndUpdate(
      realMongoId, 
      safeUpdateData, 
      { new: true, runValidators: true } 
    ).select("-password");
    
    if (!barber) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    return NextResponse.json({ data: barber });

  } catch (e) {
    console.error("PATCH barber error", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}