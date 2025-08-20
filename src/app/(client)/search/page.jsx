"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BarberCard from "@/components/BarberCard";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city"); // ✅ read ?city=...
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    if (!city) return;

    const fetchBarbers = async () => {
      try {
        const res = await fetch("/api/barbers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location: city }),
        });

        const data = await res.json();
        setBarbers(data);
      } catch (err) {
        console.error("Error fetching barbers:", err);
      }
    };

    fetchBarbers();
  }, [city]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Barbers in <span className="text-red-500">{city}</span>
      </h1>

      <BarberCard data={barbers} />
    </div>
  );
}
