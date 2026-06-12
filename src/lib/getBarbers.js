// src/lib/getBarbers.js
import dbConnect from "./db"; 
import Barber from "@/models/Barber"; 
import { hashids } from "@/lib/hash"; 

export async function getBarbers(page = 1, limit = 10) {
  try {
    await dbConnect();

    const skipAmount = (page - 1) * limit;

    const barbers = await Barber.find({})
      .skip(skipAmount)
      .limit(limit)
      .lean();

    const hashedBarbers = barbers.map((barber) => {
      const safeBarber = {
        ...barber,
        id: hashids.encodeHex(barber._id.toString()), 
      };
      delete safeBarber._id; 
      return safeBarber;
    });

    return JSON.parse(JSON.stringify(hashedBarbers));

  } catch (error) {
    console.error("Failed to fetch barbers:", error);
    return []; 
  }
}