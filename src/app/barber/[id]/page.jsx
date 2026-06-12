"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react"; 

export default function BarberDetailPage() {
  const { id } = useParams(); 
  const { data: session } = useSession(); 

  const [barber, setBarber] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

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
  };

  const totalTime = selectedServices.reduce((total, service) => {
    return total + (serviceDurations[service] || 0);
  }, 0);

  const fetchSlots = async () => {
    if (!id || !date) return; 
    
    try {
      const res = await fetch(`/api/bookings?barberId=${id}&date=${date}&duration=${totalTime}`);
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

  useEffect(() => { 
    if (totalTime > 0) {
      fetchSlots(); 
    } else {
      setSlots([]);
      setSelectedSlot(null);
    }
  }, [id, date, totalTime]);

  const handleBook = async () => {
    try {
      if (!selectedSlot || selectedServices.length === 0) {
        return alert("Please select a time slot and at least one service.");
      }

      if (!session || !session.user) {
        return alert("Please log in to book an appointment.");
      }

      setIsBooking(true);

      const startDate = new Date(selectedSlot);
      const endDate = new Date(startDate.getTime() + totalTime * 60000);

      const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            barber: id, 
            user: null,   
            date: date,
            start: formatTime(startDate),      
            end: formatTime(endDate),
            service: selectedServices 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || data.error || "Booking failed"); 
      
      alert("Booking confirmed!");
      fetchSlots(); 
      setSelectedServices([]); 
    } catch (e) {
      alert(e.message);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0F]">
        <div className="w-8 h-8 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0F] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Shop Not Found</h2>
        <p className="text-slate-400 max-w-md">{error}</p>
      </div>
    );
  }

  if (!barber) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-[#111118] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center z-10">
            {barber.shopImage ? (
              <img src={barber.shopImage} alt={barber.shopName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">💈</span>
            )}
          </div>
          
          <div className="flex-1 z-10">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">{barber.shopName}</h1>
              {barber.isAvailable ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold whitespace-nowrap">
                  Open Now
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-xs font-semibold whitespace-nowrap">
                  Closed
                </span>
              )}
            </div>
            
            <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                {barber.firstName?.charAt(0)}
              </span>
              Owned by {barber.firstName} {barber.lastName}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {barber.services?.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 text-xs rounded-lg font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Services & Date */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#111118] border border-white/5 rounded-3xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-red-500">1.</span> Select Date
              </h2>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                min={new Date().toISOString().slice(0, 10)}
                className="w-full bg-[#1A1A24] border border-white/10 focus:border-red-500/50 text-white rounded-xl px-4 py-3 outline-none transition-colors [color-scheme:dark]" 
              />
            </div>

            <div className="bg-[#111118] border border-white/5 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-red-500">2.</span> Choose Services
                </h2>
                {totalTime > 0 && (
                  <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md">
                    {totalTime} mins
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {barber.services?.map((s, index) => (
                  <label 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedServices.includes(s) 
                      ? "bg-red-500/10 border-red-500/30" 
                      : "bg-[#1A1A24] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={selectedServices.includes(s)} 
                        onChange={(e) => handleChange(e, s)} 
                      />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        selectedServices.includes(s) ? "bg-red-500 border-red-500" : "border-white/20 bg-transparent"
                      }`}>
                        {selectedServices.includes(s) && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-200">{s}</span>
                    </div>
                    {serviceDurations[s] > 0 && (
                      <span className="text-xs text-slate-500">{serviceDurations[s]}m</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Time Slots */}
          <div className="lg:col-span-7">
            <div className="bg-[#111118] border border-white/5 rounded-3xl p-6 h-full min-h-[400px] flex flex-col">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-red-500">3.</span> Pick a Time
              </h2>

              {!session && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                  <span className="text-amber-500 mt-0.5">⚠️</span>
                  <div>
                    <p className="text-amber-400 text-sm font-semibold">Authentication Required</p>
                    <p className="text-amber-500/70 text-xs mt-1">Please log in to view availability and book appointments.</p>
                  </div>
                </div>
              )}

              {session && totalTime === 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-slate-400 text-sm font-medium">Select a service to see available times.</p>
                 </div>
              )}

              {session && totalTime > 0 && slots.length === 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-slate-400 text-sm font-medium">No {totalTime}-minute blocks available.</p>
                    <p className="text-slate-500 text-xs mt-1">Try a different date or fewer services.</p>
                 </div>
              )}

              {session && totalTime > 0 && slots.length > 0 && (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
                    {slots.map((timeString) => {
                      const timeLabel = new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const isSelected = selectedSlot === timeString;

                      return (
                        <button
                          key={timeString} 
                          onClick={() => setSelectedSlot(timeString)}
                          className={`py-2.5 px-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                              isSelected 
                              ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] ring-2 ring-red-500 ring-offset-2 ring-offset-[#111118]" 
                              : "bg-[#1A1A24] text-slate-300 hover:bg-white/10 border border-white/5"
                          }`}
                        >
                          {timeLabel}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5">
                    <button 
                      disabled={!selectedSlot || isBooking} 
                      onClick={handleBook} 
                      className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-white/5 disabled:text-slate-500 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {isBooking ? (
                         <>
                           <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                           Confirming...
                         </>
                      ) : (
                         `Confirm Appointment`
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}