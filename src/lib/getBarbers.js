// src/lib/getBarbers.js
import dbConnect from "./db"; 
import Barber from "@/models/Barber"; 
import { hashids } from "@/lib/hash"; // 

export async function getBarbers() {
  try {
    await dbConnect();

    // .lean() gets the plain objects
    const barbers = await Barber.find({}).lean();

    const hashedBarbers = barbers.map((barber) => {
      const safeBarber = {
        ...barber,
        id: hashids.encodeHex(barber._id.toString()), 
      };

      // Deleting the raw MongoDB ID so it never reaches the frontend
      delete safeBarber._id; 
      
      return safeBarber;
    });
    // returns `createdAt` and `dob` as complex JavaScript Date objects. 
    const serializedBarbers = JSON.parse(JSON.stringify(hashedBarbers));

    return serializedBarbers;

  } catch (error) {
    console.error("Failed to fetch barbers:", error);
    return []; 
  }
}