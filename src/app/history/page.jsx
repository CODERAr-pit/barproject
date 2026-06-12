"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function BookingHistory() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setError("Please log in to view your booking history.");
      setIsLoading(false);
      return;
    }
    const handleCancel=(id)=>{
//procced
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex justify-center items-center">
        <div className="w-10 h-10 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
      </div>
    );
  }

  const now = new Date().getTime();
  const upcomingBookings = history.filter(b => new Date(b.endTime).getTime() >= now);
  const pastBookings = history.filter(b => new Date(b.endTime).getTime() < now);

  const BookingCard = ({ booking, isPast }) => (
    <div 
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-3xl border transition-all duration-300 ${
        isPast 
          ? "bg-[#111118]/50 border-white/5 opacity-60 grayscale-[0.5]" 
          : "bg-[#111118] border-white/10 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.05)]"
      }`}
    >
      <div className="flex items-center gap-5 mb-4 sm:mb-0 w-full sm:w-auto">
        <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
          {booking.barber?.shopImage ? (
            <img src={booking.barber.shopImage} alt="Shop" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">💈</span>
          )}
        </div>
        
        <div>
          <h3 className={`text-lg font-bold tracking-tight ${isPast ? 'text-slate-300' : 'text-white'}`}>
            {booking.barber?.shopName || "Unknown Shop"}
          </h3>
          <div className="text-sm mt-1 flex items-center gap-2">
            <span className={`font-semibold ${isPast ? 'text-slate-500' : 'text-red-400'}`}>
              {formatDate(booking.date)}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{formatTime(booking.startTime)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:items-end w-full sm:w-auto gap-2">
        <div className="text-sm text-slate-300 font-medium truncate max-w-[200px]">
          {Array.isArray(booking.serviceType) ? booking.serviceType.join(", ") : booking.serviceType}
        </div>
        
        <div className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider w-max ${
          isPast 
            ? "bg-white/5 text-slate-500 border border-white/10" 
            : booking.status === "confirmed"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        }`}>
          {booking.status.toUpperCase()}
        </div>
        {booking.status=="confirmed"?(<button className="cursor-pointer"onClick={handleCancel}>Cancel</button>):("")}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">My Appointments</h1>
          <p className="text-slate-400">Manage your upcoming visits and view past history.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        {history.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#111118] border border-white/5 rounded-3xl text-center px-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl mb-4">🗓️</div>
            <h2 className="text-xl font-bold text-white mb-2">No bookings yet</h2>
            <p className="text-slate-400 max-w-sm">When you book an appointment with a barber, it will show up here.</p>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Upcoming Section */}
            {upcomingBookings.length > 0 && (
              <section>
                <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-4 pl-2">Upcoming</h2>
                <div className="space-y-3">
                  {upcomingBookings.map(booking => (
                    <BookingCard key={booking._id} booking={booking} isPast={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Section */}
            {pastBookings.length > 0 && (
              <section>
                <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-4 pl-2">Past History</h2>
                <div className="space-y-3">
                  {pastBookings.map(booking => (
                    <BookingCard key={booking._id} booking={booking} isPast={true} />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}