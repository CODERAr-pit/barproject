"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn,signOut, } from "next-auth/react";
export default function Home() {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [disable,setDisable]=useState([]);
  const router = useRouter();

  const handleSearch = () => {
    if (!city) return;
    router.push(`/search?city=${encodeURIComponent(city)}`); // ✅ redirect
  };

  const handleInput = async (e) => {
    const value = e.target.value;
    setCity(value);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${value}&limit=5&countryIds=IN`,
        {
          headers: {
            "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );

      const data = await res.json();

      if (data && data.data) {
        const unique = Array.from(
          new Set(data.data.map((c) => `${c.city}, ${c.country}`))
        );
        setSuggestions(unique);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setSuggestions([]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="mb-6 text-4xl font-bold">
        Search <span className="text-red-500">Barbers</span> Near You!
      </h1>

      {/* Input + Button */}
      <div className="relative flex flex-col">
        <div className="flex">
          <input
            type="text"
            value={city}
            onChange={handleInput}
            placeholder="Enter city"
            className="bg-white rounded-3xl rounded-r-none text-black p-2 w-96 text-center"
          />
          <button
            
            onClick={handleSearch}
            className="bg-red-500 text-white px-4 rounded-3xl rounded-l-none hover:bg-red-600"
          >
            Go
          </button>
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute top-12 left-0 w-96 bg-white shadow-lg rounded-lg text-black z-10">
            {suggestions.map((c) => (
              <li
                key={c}
                onClick={() => {
                  setCity(c);
                  setSuggestions([]); // ✅ clear dropdown after selection
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
