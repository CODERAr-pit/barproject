"use client";
import { Suspense, useEffect, useState } from "react";
import BarberCard from "@/components/BarberCard";

function SearchPageContent() {
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
          if (!data.data || data.data.length === 0) {
            setError("No barbers found nearby");
          }
        } else {
          setError(data.error || "Failed to fetch nearby barbers");
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

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-white">
          Finding barbers near you...
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-gray-300">Loading barbers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Nearby Barbers
        </h1>
        <p className="text-gray-300">
          Found {barbers.length} barber{barbers.length !== 1 ? 's' : ''} nearby
        </p>
      </div>

      <BarberCard data={barbers} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading search results...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
