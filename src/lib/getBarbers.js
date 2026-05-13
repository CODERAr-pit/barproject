// src/lib/getBarbers.js
import dbConnect from "./db"; 
import Barber from "@/models/Barber"; 

export async function getBarbers() {
  try {
    await dbConnect();

    const barbers = await Barber.find({}).lean();

    // THE FIX: Deep serialize the entire array of objects
    // This instantly converts all nested ObjectIds and Dates to plain strings
    const serializedBarbers = JSON.parse(JSON.stringify(barbers));

    return serializedBarbers;

  } catch (error) {
    console.error("Failed to fetch barbers:", error);
    return []; 
  }
}