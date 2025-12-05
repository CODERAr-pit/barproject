"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      try {
        // Reuse this ID for booking flow later
        localStorage.setItem("userId", session.user.id);
        
        // Call the unified API with userId
        const res = await fetch(`/api/bookings?userId=${session.user.id}`);
        const data = await res.json();
        
        if (res.ok) {
            setBookings(Array.isArray(data.data) ? data.data : []);
        }
      } catch (e) {
        console.error("Failed to load bookings", e);
      } finally {
        setLoading(false);
      }
    };
    
    if (status === "authenticated") {
        load();
    }
  }, [session, status]);

  if (status === "loading" || loading) return <div className="p-6 text-white">Loading...</div>;

  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Your Profile</h1>
        <p className="text-gray-300">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-gray-900 text-gray-100">
      {/* User Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8 flex gap-6 items-center shadow-lg">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-3xl border-2 border-indigo-500">
          {session.user.image ? (
            <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span>👤</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{session.user.name || "User"}</h1>
          <p className="text-gray-400">{session.user.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-indigo-900/50 text-indigo-200 text-xs rounded-full border border-indigo-700">
            {session.user.role || "Customer"}
          </span>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-4">
            Booking History
        </h2>
        
        {bookings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No bookings found. Time for a haircut! ✂️</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              // ✅ FIX: Create a real Date object from the DB string
              const startDate = new Date(b.start);
              
              return (
                <div key={b._id} className="rounded-xl border border-gray-700 p-5 bg-gray-900/50 hover:bg-gray-900 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Barber Details */}
                    <div>
                      <div className="text-xl font-bold text-white mb-1">
                        {b.barber?.shopName || "Unknown Shop"}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <span>📍 {b.barber?.location || "No location"}</span>
                      </div>
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-800">
                        {b.service}
                      </span>
                    </div>

                    {/* Right: Date & Status */}
                    <div className="text-left sm:text-right">
                      <div className="text-white font-mono text-lg">
                        {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-2xl font-bold text-indigo-400">
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className={`text-xs mt-2 font-bold uppercase tracking-wide ${
                        b.status === 'confirmed' ? 'text-green-500' : 
                        b.status === 'cancelled' ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        ● {b.status || 'Pending'}
                      </div>
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