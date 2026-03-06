"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleInput = (e) => {
    setQuery(e.target.value);
  };

  useEffect(() => {}, [response]);

  async function handleClick() {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const body = JSON.stringify({ lat, lng, query });

      const res = await fetch("/api/groq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      const data = await res.json();
      setResponse(data.response);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="relative z-30 flex flex-col items-center">
        <h1 className="mb-6 text-4xl font-bold text-white text-center">
          Search <span className="text-red-500">Barbers</span> Near You!
        </h1>

        <div className="bg-pink-700 rounded-lg shadow-lg p-6 w-full max-w-md">
          <input
            type="text"
            placeholder="Enter your query..."
            value={query}
            onChange={handleInput}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={handleClick}
            className="mt-4 w-full bg-red-500 text-black py-3 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Search
          </button>
        </div>
      </div>

      {response && (
        <div className="absolute mt-28 top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-black text-yellow-500 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Chatbot Response</h2>
            <p>{response}</p>
          </div>
        </div>
      )}
    </div>
  );
}