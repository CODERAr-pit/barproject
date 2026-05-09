// components/BookingGrid.js
"use client";
import { useState, useEffect } from "react";

export default function BookingGrid({ barberInfo }) {
  // barberInfo contains { barberId: "...", barberName: "..." }
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. When the component loads, fetch the available slots 
    // for this SPECIFIC barber from your MongoDB
    const fetchSlots = async () => {
      try {
        const res = await fetch(`/api/barbers/${barberInfo.barberId}/slots`);
        const data = await res.json();
        setSlots(data.slots); // e.g., ["10:00 AM", "11:30 AM", "2:00 PM"]
      } catch (error) {
        console.error("Failed to fetch slots");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [barberInfo.barberId]);

  const handleBookSlot = async (time) => {
     // Here is where you will add that Redis Locking logic we talked about!
     alert(`Attempting to book ${time} with ${barberInfo.barberName}!`);
  };

  if (isLoading) return <p className="text-slate-400">Loading slots...</p>;

  return (
    <div>
      <h3 className="text-white font-semibold mb-3">
        Book with {barberInfo.barberName}
      </h3>
      
      <div className="grid grid-cols-3 gap-2 text-sm text-center">
        {slots.length > 0 ? (
          slots.map((time, index) => (
            <button 
              key={index}
              onClick={() => handleBookSlot(time)}
              className="bg-slate-700 text-slate-200 p-2 rounded hover:bg-red-500 hover:text-white transition"
            >
              {time}
            </button>
          ))
        ) : (
          <p className="text-slate-400 col-span-3">No slots available today.</p>
        )}
      </div>
    </div>
  );
}