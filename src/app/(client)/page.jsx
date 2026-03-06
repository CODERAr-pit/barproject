"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNearby = async () => {
      setLoading(true);
      setError("");
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej)
        );
        const { latitude: lat, longitude: lng } = pos.coords;
        const res = await fetch("/api/live_location_barber", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        });
        const data = await res.json();
        if (res.ok) {
          setBarbers(data.data || []);
        } else {
          setError(data.error || "Failed to fetch barbers");
        }
      } catch (e) {
        console.error(e);
        setError("Location access denied or network error");
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Nearby Barbers</h1>

        {loading && (
          <div className="text-center py-20 text-gray-400">
            <Loader2 className="animate-spin w-8 h-8 mx-auto" />
            <p className="mt-4">Finding barbers near you…</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && barbers.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No barbers found near your location.
          </div>
        )}

        {!loading && !error && barbers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.map((barber) => (
              <Link key={barber._id} href={`/barber/${barber._id}`}>
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
                  {/* Image Area */}
                  <div className="h-48 bg-slate-700 relative">
                    {barber.shopImage ? (
                      <img 
                        src={barber.shopImage} 
                        alt={barber.shopName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">🏪</div>
                    )}
                    {/* Availability Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                      barber.isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {barber.isAvailable ? "OPEN" : "CLOSED"}
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-1 truncate">{barber.shopName}</h3>
                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-2">
                      {barber.services?.slice(0, 3).map((s) => (
                        <span key={s} className="px-2 py-1 bg-slate-700 text-xs rounded-md text-slate-300">
                          {s}
                        </span>
                      ))}
                      {barber.services?.length > 3 && (
                        <span className="px-2 py-1 bg-slate-700 text-xs rounded-md text-slate-300">
                          +{barber.services.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}