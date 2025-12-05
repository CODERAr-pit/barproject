"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setBarbers([]);

    try {
      // Call the API with Query Params
      const res = await fetch(`/api/search?city=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.success) {
        setBarbers(data.data);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Find a Barber Nearby</h1>

        {/* --- Search Bar --- */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter your city (e.g. Patna, Delhi)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Search"}
          </button>
        </form>

        {/* --- Results Section --- */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Searching...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Show "No Results" only if searched and list is empty */}
            {hasSearched && barbers.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-400">
                No barbers found in "{query}". Try another city.
              </div>
            )}

            {/* Barber Cards */}
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
                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {barber.location}
                    </div>
                    
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