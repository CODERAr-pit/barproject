"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react"; // Use NextAuth session

export default function BarberDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession(); // ✅ Hooks must be at the top level

  const [barber, setBarber] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null); // Will store the Time String
  const [service, setService] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [time,setTime]=useState();
 
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
 // 1. Load Barber Details
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

  // 2. Fetch Available Slots
  const [selectedServices, setSelectedServices] = useState([]);

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

  const fetchSlots = async () => {
    if (!barber?._id || !date) return;
    
    // ✅ API returns specific "Free Time Strings", not database objects
    const res = await fetch(`/api/bookings?barberId=${barber._id}&date=${date}`);
    const result = await res.json();
    
    if (result.data) {
        setSlots(result.data); // These are strings like "2025-10-05T09:00:00.000Z"
    } else {
        setSlots([]);
    }
    setSelectedSlot(null);
  };

  useEffect(() => { fetchSlots(); }, [barber?._id, date]);

  const handleBook = async () => {
    try {
      if (!selectedSlot || !service) return alert("Select slot and service");

      const userId = session?.user?.id;
      if (!userId) return alert("Please log in to book");

      const startDate = new Date(selectedSlot);
      const endDate = new Date(startDate.getTime() + totalTime * 60000);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            user: userId,         
            barber: barber._id,    
            date: date,
            start: startDate,      
            end: endDate,
            serviceType: selectedServices 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed"); // API returned 'message'
      
      alert("Booking confirmed!");
      fetchSlots(); // Refresh to remove the booked slot
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
              // Ensure the checkbox UI matches the state
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
        
        {slots.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-xl text-gray-500">
                No slots available for this date.
            </div>
        ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {slots.map((timeString) => {
                // Formatting the time for display (e.g., "10:30 AM")
                const timeLabel = new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isSelected = selectedSlot === timeString;

                return (
                    <button
                        key={timeString} // Use the string itself as the key
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
            disabled={!selectedSlot || !service} 
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