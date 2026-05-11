"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BookingGrid from "@/components/BookingGrid";
import Hashids from 'hashids';

const hashids = new Hashids("your_secret_salt", 8);

// Basic SVG Icons
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [online, setOnline] = useState(true);
  
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [barbers, setBarbers] = useState([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  useEffect(() => {
    console.log("Barbers state updated:", barbers);
  }, [barbers]);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  useEffect(() => {
    const fetchBarber = async () => {
      try {
        const res = await fetch("/api/barber", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location: "" }), 
        });
        const data = await res.json(); 
        setBarbers(data); 
        console.log(data);
      } catch (error) {
        console.error("Error fetching default barbers:", error);
      }
    };

    fetchBarber(); 
  }, []); 

  const handleClick = (item) => {
  // Accept either the full object or just the ID string
  const barberId = typeof item === 'string' ? item : item._id;

  // Safety Check
  if (!barberId) {
    alert("Oops! This barber is missing a valid ID. Check the console.");
    return;
  }

  // Encode and navigate
  try {
    const shortId = hashids.encodeHex(barberId);
    router.push(`/barber/${shortId}`);
  } catch (error) {
    console.error("🚨 Hashids failed to encode. Make sure the ID is a valid hex string:", barberId);
  }
};

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const body = JSON.stringify({ lat, lng, query: userMessage });

          const res = await fetch("/api/groq", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: body,
          });

          const data = await res.json();

          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: data.response,
              uiType: data.uiType,
              payload: data.data,
            },
          ]);

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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950">
      
      <div className="p-8 flex flex-col gap-2 items-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to <span className="text-red-500">Ur-Umbrella</span> Barbers
        </h1>
        <p className="text-slate-400 text-xl">XeNum Tech</p>
        <button onClick={handleLocation} className="bg-red-500 hover:cursor-pointer p-2 rounded-3xl">
          Check Locality
        </button>
        
        {/* Barber Cards Grid */}
        <div className="w-full max-w-6xl mt-12 grid grid-cols-1 md:grid-rows-3 gap-6">
          
          {barbers && barbers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {barbers.map((item, index) => (
                <div
                  onClick={() => handleClick(item._id)}
                  key={index}
                  className="bg-slate-900 hover:cursor-grabbing border border-slate-800 rounded-2xl p-5 shadow-lg hover:shadow-slate-800/40 hover:border-slate-700 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    
                    {/* Image */}
                    <div className="shrink-0">
                      <img
                        src="https://www.shutterstock.com/image-photo/sun-sets-behind-mountain-ranges-600nw-2479236003.jpg"
                        alt="Barber Shop"
                        className="w-28 h-28 rounded-xl object-cover border border-slate-700"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 w-full">
                      
                      {/* Top Section */}
                      <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                        
                        {/* Top Left: Takes 50% */}
                        <div className="md:flex-1">
                          <h1 className="text-2xl font-bold text-white">
                            {item.shopName}
                          </h1>
                          <p className="text-slate-400 mt-1">
                            Owner: {item.firstName}
                          </p>
                        </div>

                        {/* Top Center: Shrinks to fit */}
                        <div className="flex items-center md:justify-center text-slate-300 shrink-0">
                          {item.services && item.services.length > 0 && (
                            <div className="text-center">
                              {item.services[0]} {item.services[1]}...
                            </div>
                          )}
                        </div>
                          
                        {/* Top Right: Takes 50% and pushes to right */}
                        <div className="md:flex-1 flex md:justify-end">
                          <div className="bg-slate-800 px-4 py-2 rounded-lg text-yellow-400 font-semibold text-sm w-max">
                            ⭐ {item.rating || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* --- BOTTOM INFO SECTION (FIXED ALIGNMENT) --- */}
                      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-4 w-full">
                        
                        {/* Bottom Left: Takes 50% (Phone + Distance) */}
                        <div className="md:flex-1 flex flex-col sm:flex-row gap-12 sm:items-center">
                          <div className="text-slate-300">
                            <p className="text-sm text-slate-400">Phone Number</p>
                            <p className="font-medium">{item.phone}</p>
                          </div>
                          {item.distance && (
                            <div className="text-slate-400 text-sm mt-1 sm:mt-0">
                              {item.distance} away
                            </div>
                          )}
                        </div>
                        
                        {/* Bottom Center: Shrinks to fit (Perfectly aligns with Top Center) */}
                        <div className="flex items-center md:justify-center shrink-0">
                          {item.isAvailable ? (
                            <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                              Available
                            </div>
                          ) : (
                            <div className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              Not Available
                            </div>
                          )}
                        </div>
                        
                        {/* Bottom Right: Takes 50% and pushes to right */}
                        <div className="md:flex-1 flex md:justify-end">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition duration-200 font-medium whitespace-nowrap">
                            Book Appointment
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white col-span-3 text-center">Loading barbers or no barbers found...</p>
          )}
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div 
        className={`fixed bottom-24 left-6 w-[380px] h-[600px] max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-left ${
          isChatOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-red-600 p-4 rounded-t-2xl flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">AI Assistant</h3>
          <button onClick={() => setIsChatOpen(false)} className="hover:text-slate-200 transition">
             <CloseIcon />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400">
            <p>Please sign in to chat with the bot and book appointments.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-red-500 [&::-webkit-scrollbar-thumb]:rounded-lg hover:[&::-webkit-scrollbar-thumb]:bg-red-600">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500">
                  <p>Say hello to start finding barbers!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col w-full ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {msg.text && (
                      <div
                        className={`max-w-[85%] p-3 rounded-lg text-sm ${
                          msg.sender === "user"
                            ? "bg-red-600 text-white rounded-br-none"
                            : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}

                    {msg.uiType === "barber_ui" && (
                      <div className="mt-2 w-full bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
                        <BookingGrid barberInfo={msg.response} />
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 p-3 rounded-lg rounded-bl-none border border-slate-700 animate-pulse text-sm">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 rounded-b-2xl"
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 p-2 bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-red-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-6 left-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 hover:scale-105 ${
          isChatOpen ? "bg-slate-800 text-red-500 rotate-90" : "bg-red-600 text-white rotate-0"
        }`}
      >
        {isChatOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

    </div>
  );
}