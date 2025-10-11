"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BarberCard from "@/components/BarberCard";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city");
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city) {
      setError("No city specified");
      return;
    }

    const fetchBarbers = async () => {
      setLoading(true);
      setError("");
      
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city }),
        });

        const data = await res.json();
        
        if (res.ok) {
          setBarbers(data.data || []);
          if (data.count === 0) {
            setError(`No barbers found in ${city}`);
          }
        } else {
          setError(data.error || "Failed to search barbers");
          setBarbers([]);
        }
      } catch (err) {
        console.error("Error fetching barbers:", err);
        setError("Network error. Please try again.");
        setBarbers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, [city]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Searching barbers in <span className="text-blue-500">{city}</span>
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-gray-600">Loading barbers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Search Results for <span className="text-red-500">{city}</span>
        </h1>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Barbers in <span className="text-blue-600">{city}</span>
        </h1>
        <p className="text-gray-600">
          Found {barbers.length} barber{barbers.length !== 1 ? 's' : ''} in this area
        </p>
      </div>

      <BarberCard data={barbers} />
    </div>
  );
}
