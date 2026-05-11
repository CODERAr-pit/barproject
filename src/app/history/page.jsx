"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function BookingHistory() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Don't fetch if the user isn't logged in yet
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setError("Please log in to view your booking history.");
      setIsLoading(false);
      return;
    }

    // 2. Fetch the data from your Scenario A backend route
    const fetchHistory = async () => {
      try {
        const userId = session?.user?.id;
        const res = await fetch(`/api/bookings?userId=${userId}`);
        const result = await res.json();

        if (!res.ok) throw new Error(result.error || "Failed to load history");

        setHistory(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [session, status]);

  // Helper functions to make the ugly database dates look pretty
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return new Date(timeString).toLocaleTimeString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">My Appointments</h1>
        <p className="text-slate-400 mb-8">View your past and upcoming barber visits.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {history.length === 0 && !error ? (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <h2 className="text-xl font-semibold text-slate-300">No bookings yet</h2>
            <p className="text-slate-500 mt-2">When you book an appointment, it will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((booking) => {
              // Determine if the booking is in the past to change UI slightly
              const isPast = new Date(booking.endTime) < new Date();

              return (
                <div 
                  key={booking._id} 
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border transition-all ${
                    isPast 
                      ? "bg-slate-900/50 border-slate-800 opacity-75" 
                      : "bg-slate-900 border-slate-700 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/5"
                  }`}
                >
                  {/* Left Side: Shop Info & Time */}
                  <div className="flex items-center gap-5 mb-4 sm:mb-0">
                    <img 
                      src={booking.barber?.shopImage || "https://www.shutterstock.com/image-photo/sun-sets-behind-mountain-ranges-600nw-2479236003.jpg"} 
                      alt="Shop" 
                      className={`w-16 h-16 rounded-xl object-cover ${isPast ? 'grayscale' : ''}`}
                    />
                    <div>
                      {/* Using optional chaining (?.) just in case the barber was deleted from the DB */}
                      <h3 className="text-lg font-bold text-slate-100">
                        {booking.barber?.shopName || "Unknown Shop"}
                      </h3>
                      <div className="text-sm text-slate-400 mt-1">
                        <span className="font-medium text-red-400">{formatDate(booking.date)}</span>
                        <span className="mx-2">•</span>
                        <span>{formatTime(booking.startTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Services & Status */}
                  <div className="flex flex-col sm:items-end w-full sm:w-auto">
                    <div className="text-sm text-slate-300 font-medium mb-2 truncate max-w-[200px]">
                      {/* Handling both Array and String just in case */}
                      {Array.isArray(booking.serviceType) 
                        ? booking.serviceType.join(", ") 
                        : booking.serviceType}
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold w-max ${
                      booking.status === "confirmed" 
                        ? isPast 
                            ? "bg-slate-800 text-slate-400 border border-slate-700" 
                            : "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}>
                      {isPast ? "COMPLETED" : booking.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}