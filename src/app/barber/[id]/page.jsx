"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react"; 

export default function BarberDetailPage() {
  // 1. Grab the safe HashID straight from the URL
  const { id } = useParams(); 
  const { data: session } = useSession(); 

  const [barber, setBarber] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Cleaned up unused states!
  const [selectedServices, setSelectedServices] = useState([]);
 
  const serviceDurations = {
    "Haircut": 30,
    "Spa": 60,
    "Beardset": 20,
    "Hairwash": 15,
    "Facewash": 15,
    "Men": 0,
    "Women": 0,
    "Children (18-)": 0
  };

  // Load Barber Details
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/barber/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load barber");
        setBarber(data.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);


  const handleChange = (e, item) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedServices((prev) => [...prev, item]);
    } else {
      setSelectedServices((prev) => prev.filter((service) => service !== item));
    }
  }

  const totalTime = selectedServices.reduce((total, service) => {
    return total + (serviceDurations[service] || 0);
  }, 0);

  // 2. FIXED: Use `id` from the URL, not barber.id!
  const fetchSlots = async () => {
    if (!id || !date) return; 
    
    try {
      const res = await fetch(`/api/bookings?barberId=${id}&date=${date}`);
      const result = await res.json();
      
      if (res.ok && result.data) {
          setSlots(result.data); 
      } else {
          setSlots([]);
      }
      setSelectedSlot(null);
    } catch (err) {
      console.error("Failed to fetch slots", err);
      setSlots([]);
    }
  };

  useEffect(() => { fetchSlots(); }, [id, date]);


  const handleBook = async () => {
    try {
      // 3. FIXED: Check selectedServices correctly
      if (!selectedSlot || selectedServices.length === 0) {
        return alert("Please select a time slot and at least one service.");
      }

      // 4. Require login
      if (!session || !session.user) {
        return alert("Please log in to book an appointment.");
      }

      const startDate = new Date(selectedSlot);
      const endDate = new Date(startDate.getTime() + totalTime * 60000);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            // We removed user: userId because the backend securely grabs it from the session now!
            barber: id, 
            user: null,   // 👈 FIXED: Use the HashID from the URL
            date: date,
            start: startDate,      
            end: endDate,
            service: selectedServices // 👈 FIXED: Matches the backend Zod schema!
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || data.error || "Booking failed"); 
      
      alert("Booking confirmed!");
      fetchSlots(); // Refresh to remove the booked slot
      setSelectedServices([]); // Clear the form
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!barber) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-gray-900 text-gray-100">
      {/* Header Section */}
      <div className="flex gap-6 mb-8 bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="w-48 h-48 bg-gray-700 rounded-xl overflow-hidden shadow-inner">
          {barber.shopImage ? (
            <img src={barber.shopImage} alt={barber.shopName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🏪</div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2">{barber.shopName}</h1>
          <p className="text-gray-400 text-sm">Owner: {barber.firstName} {barber.lastName}</p>
          
          <div className="mt-4">
            {barber.isAvailable === false ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700">
                Not available {barber.nextAvailableAt ? `• Next: ${new Date(barber.nextAvailableAt).toLocaleString()}` : ""}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700">
                Available now
              </span>
            )}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {barber.services?.map((s) => (
              <span key={s} className="px-3 py-1 bg-indigo-900/50 border border-indigo-700 text-indigo-200 text-xs rounded-full shadow-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Controls */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-gray-400 mb-1">Select Date</label>
            <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
            />
          </div>
          <div className="w-full sm:w-auto flex-1">
      <label className="block text-xs font-medium text-gray-400 mb-1">
        Select Service
      </label>

      <div className="mb-3 text-sm text-green-500 font-semibold">
        Estimated Time: {totalTime} mins
      </div>

      <div className="flex flex-col gap-2">
        {barber.services?.map((s, index) => (
          <label key={index} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => handleChange(e, s)}
              checked={selectedServices.includes(s)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">
              {s} {serviceDurations[s] > 0 && `(${serviceDurations[s]} mins)`}
            </span>
          </label>
        ))}
      </div>
    </div>
          <button 
            onClick={fetchSlots} 
            className="w-full sm:w-auto px-6 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            Refresh Slots
          </button>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">Available Time Slots</h2>
        
        {/* Added a friendly warning if they aren't logged in! */}
        {!session && (
           <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 text-yellow-400 text-sm rounded-lg">
             Please log in to view available time slots and make a booking.
           </div>
        )}

        {slots.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-xl text-gray-500">
                No slots available for this date.
            </div>
        ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {slots.map((timeString) => {
                const timeLabel = new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isSelected = selectedSlot === timeString;

                return (
                    <button
                        key={timeString} 
                        onClick={() => setSelectedSlot(timeString)}
                        className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${
                            isSelected 
                            ? "bg-blue-600 text-white shadow-lg scale-105" 
                            : "bg-gray-900 text-gray-300 hover:bg-gray-700 border border-gray-700"
                        }`}
                    >
                        {timeLabel}
                    </button>
                );
            })}
            </div>
        )}

        <div className="mt-8 border-t border-gray-700 pt-6 flex justify-end">
          <button 
            disabled={!selectedSlot || selectedServices.length === 0} 
            onClick={handleBook} 
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}