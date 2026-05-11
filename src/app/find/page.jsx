"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Hashids from "hashids";

const hashids = new Hashids("your_secret_salt", 8);

// SVG Icons for UI
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

export default function FindBarbers() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [barbers, setBarbers] = useState([]);
  const [filteredBarbers, setFilteredBarbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch all barbers on page load
  useEffect(() => {
    const handleLocation = () => {
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const body = JSON.stringify({ lat, lng });
          const res = await fetch("/api/live_location_barber", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: body,
          });

          const data = await res.json();
          console.log("value", data);
          setBarbers(data.data);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Unable to access your location. Please allow location access." },
          ]);
          setIsLoading(false);
        }
      );
    } catch (e) {
      console.error("Error during chat:", e);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong. Please try again." },
      ]);
      setIsLoading(false);
    }
  };

    handleLocation();
  }, []);

  // 2. Filter barbers instantly as the user types
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBarbers(barbers);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    
    const filtered = barbers.filter((barber) => {
      // Search by shop name, owner name, or services offered
      const shopMatch = barber.shopName?.toLowerCase().includes(lowerCaseSearch);
      const nameMatch = barber.firstName?.toLowerCase().includes(lowerCaseSearch);
      const serviceMatch = barber.services?.some(service => 
        service.toLowerCase().includes(lowerCaseSearch)
      );

      return shopMatch || nameMatch || serviceMatch;
    });

    setFilteredBarbers(filtered);
  }, [searchTerm, barbers]);

  // 3. Navigate to Barber Profile
  const handleBarberClick = (barberId) => {
    if (!barberId) return;
    try {
      const shortId = hashids.encodeHex(barberId);
      router.push(`/barber/${shortId}`);
    } catch (error) {
      console.error("Hashids failed to encode:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find your next <span className="text-red-500">Cut</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Search by shop name, barber name, or specific services like "Skin Fade" or "Beard Trim".
          </p>
        </div>

        {/* Sticky Search Bar */}
        <div className="sticky top-4 z-10 mb-10">
          <div className="relative w-full max-w-2xl shadow-2xl shadow-red-500/10">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search for barbers, shops, or styles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-12 pr-4 bg-slate-900 border border-slate-700 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder-slate-500 text-lg"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : filteredBarbers.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <h2 className="text-2xl font-semibold text-slate-300 mb-2">No barbers found</h2>
            <p className="text-slate-500">Try adjusting your search terms or checking your spelling.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBarbers.map((barber, index) => (
              <div
                key={barber._id || index}
                onClick={() => handleBarberClick(barber._id)}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Shop Image Banner */}
                <div className="h-40 w-full overflow-hidden relative">
                  <img
                    src={barber.shopImage || "https://www.shutterstock.com/image-photo/sun-sets-behind-mountain-ranges-600nw-2479236003.jpg"}
                    alt={barber.shopName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">⭐</span>
                    <span className="text-white text-sm font-bold">{barber.rating || "New"}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-white truncate max-w-[200px]">
                        {barber.shopName || "Untitled Shop"}
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        by {barber.firstName || "Owner"}
                      </p>
                    </div>
                  </div>

                  {/* Services Tags (Show up to 3) */}
                  <div className="flex flex-wrap gap-2 mt-4 mb-4">
                    {barber.services?.slice(0, 3).map((service, i) => (
                      <span key={i} className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                        {service}
                      </span>
                    ))}
                    {barber.services?.length > 3 && (
                      <span className="text-xs font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                        +{barber.services.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Bottom Info: Distance & Availability */}
                  <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <LocationIcon />
                      <span>{barber.distance ? `${barber.distance} away` : "Verified"}</span>
                    </div>
                    
                    <div>
                      {barber.isAvailable !== false ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Busy
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}