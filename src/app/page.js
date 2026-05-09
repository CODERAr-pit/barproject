"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BookingGrid from "@/components/BookingGrid";
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
  
  // Renamed to make more sense, defaults to false (closed)
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [barbers,setBarbers]=useState([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLocation=()=>{
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
          setBarbers(data);
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
    }}

// You can keep this for debugging if you want, or delete it.
  useEffect(() => {
    console.log("Barbers state updated:", barbers);
  }, [barbers]);

  // 1. Handle Chat Scrolling (Only scrolls when messages or chat state changes)
  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  // 2. Fetch Default Barbers ONLY ONCE on page load
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
      } catch (error) {
        console.error("Error fetching default barbers:", error);
      }
    };

    fetchBarber(); 
  }, []); // The empty array here is the magic that stops the infinite overwriting! // Empty array ensures it never runs again and overwrites your location data!

  const handleInput = (e) => {
    setInput(e.target.value);
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
      {/* 
        ====================================================
        MAIN CONTENT AREA (CENTER/BACKGROUND)
        Put your barber listings, maps, banners, etc. here
        ====================================================
      */}
      <div className="p-8 flex flex-col items-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to <span className="text-red-500">Ur-Umbrella</span> Barbers
        </h1>
        <p className="text-slate-400 text-xl">
           XeNum Tech
        </p>
        <button onClick={handleLocation}>
          Update Location
        </button>
        {/* Placeholder for your main dashboard */}
        {/* Barber Cards Grid */}
<div className="w-full max-w-6xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
  
  {/* Check if barbers exist and length is > 0 */}
  {barbers && barbers.length > 0 ? (
    barbers.map((item, index) => (
      <div 
        key={index} 
        className="h-64 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-white"
      >
        <h3 className="text-2xl font-bold">{item.firstName}</h3>
        <p className="text-slate-400">Rating: {item.email || "N/A"}</p>
      </div>
    ))
  ) : (
    <p className="text-white col-span-3 text-center">Loading barbers or no barbers found...</p>
  )}

</div>
      </div>

      {/* 
        ====================================================
        FLOATING CHAT WIDGET (BOTTOM LEFT)
        ====================================================
      */}
      
      {/* 1. The Chat Window (Toggles opacity and visibility) */}
      <div 
        className={`fixed bottom-24 left-6 w-[380px] h-[600px] max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-left ${
          isChatOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Chat Header */}
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
            {/* Chat Messages */}
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

            {/* Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 rounded-b-2xl"
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={handleInput}
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

      {/* 2. The Floating Action Button (FAB) */}
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