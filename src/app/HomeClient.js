// src/app/HomeClient.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Hashids from "hashids";

const hashids = new Hashids("your_secret_salt", 8);

const ScissorsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export default function HomeClient({ initialBarbers, page }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const messagesEndRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [barbers, setBarbers] = useState(initialBarbers || []);
  const [pager, setPager] = useState(page || 1);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [bookingmsg,setBookingmsg]=useState("");
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (initialBarbers) setBarbers(initialBarbers);
  }, [initialBarbers]);

  const handleLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch("/api/live_location_barber", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          });
          const data = await res.json();
          setBarbers(data.data);
        } catch (e) {
          console.error(e);
        }
        setLocating(false);
      },
      (error) => {
        console.error(error);
        setLocating(false);
      }
    );
  };
  
  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [messages, isChatOpen,bookingmsg]);

  const handleClick = (id) => {
    router.push(`/barber/${id}`);
  };
  const handleBook = async (payload) => {
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          barber: payload.barber, 
          date: payload.date,
          start: payload.start,      
          end: payload.end,
          service: payload.service 
        }),
      });

      const result = await res.json();

      if (res.status === 201) {
        setMessages((prev) => [...prev, { 
          sender: "bot", 
          text: ` Booking Confirmed for ${payload.start}! Please be on time.` 
        }]);
      } else {
        setMessages((prev) => [...prev, { 
          sender: "bot", 
          text: ` Booking failed: ${result.message || "Slots might be taken or details were incorrect."}` 
        }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { 
        sender: "bot", 
        text: " Network error while booking. Please try again." 
      }]);
    }
  };
  const handlePage = () => {
    const nextPage = pager + 1;
    setPager(nextPage);
    router.push(`/?page=${nextPage}`);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch("http://localhost:8000/ai-ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: userMessage,lat, lng,history:messages }),
          });
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: data.response, uiType: data.uiType, payload: data.payload },
          ]);
        } catch (e) {
          setMessages((prev) => [...prev, { sender: "bot", text: "Something went wrong. Please try again." }]);
        }
        setIsLoading(false);
      },
      () => {
        setMessages((prev) => [...prev, { sender: "bot", text: "Unable to access your location. Please allow location access." }]);
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0F]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                  <ScissorsIcon />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                Ur-Umbrella<br />
                <span className="text-red-500">Barbers</span>
              </h1>
              <p className="mt-3 text-slate-400 text-base max-w-sm">
                Find and book skilled barbers near you — instantly.
              </p>
            </div>

            <button
              onClick={handleLocation}
              disabled={locating}
              className="group flex items-center gap-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 whitespace-nowrap self-start md:self-auto"
            >
              <LocationIcon />
              {locating ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Finding you…
                </span>
              ) : (
                "Barbers near me"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Barber list ───────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-slate-400">
            {barbers.length > 0 ? `${barbers.length} barbers` : "All barbers"}
          </h2>
        </div>

        {barbers && barbers.length > 0 ? (
          <div className="flex flex-col divide-y divide-white/0.02">
            {barbers.map((item, index) => (
              <div
                key={index}
                onClick={() => handleClick(item.id)}
                className="group flex items-start gap-5 py-6 cursor-pointer bg-white/[0.02] hover:bg-white/[0.08] -mx-4 px-4 rounded-xl transition-colors duration-200"
              >
                {/* Availability dot + image */}
                <div className="relative shrink-0">
                  <img
                    src="https://www.shutterstock.com/image-photo/sun-sets-behind-mountain-ranges-600nw-2479236003.jpg"
                    alt={item.shopName}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0A0A0F] ${item.isAvailable ? "bg-emerald-400" : "bg-slate-600"}`} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-semibold text-base leading-tight group-hover:text-red-400 transition-colors">
                        {item.shopName}
                      </h3>
                      <p className="text-slate-400 text-sm mt-0.5">{item.firstName}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-amber-400"><StarIcon /></span>
                      <span className="text-white text-sm font-semibold">{item.rating || "—"}</span>
                    </div>
                  </div>

                  {/* Services */}
                  {item.services && item.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {item.services.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                      {item.services.length > 3 && (
                        <span className="text-xs text-slate-500 px-2 py-0.5">
                          +{item.services.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <PhoneIcon />
                        {item.phone}
                      </span>
                      {item.distance && (
                        <span className="flex items-center gap-1.5">
                          <MapPinIcon />
                          {item.distance}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleClick(item.id); }}
                      className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-sm font-semibold px-4 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500 transition-all duration-200"
                    >
                      Book
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-400">
              <ScissorsIcon />
            </div>
            <p className="text-slate-400">No barbers found yet.</p>
            <p className="text-slate-500 text-sm mt-1">Try searching by your location.</p>
          </div>
        )}

        {/* Pagination */}
        {barbers.length > 0 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handlePage}
              className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 px-6 py-2.5 rounded-xl transition-all duration-200"
            >
              Load more
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>

      {/* ── Chat panel ──────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[80vh] bg-[#111118] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right ${
          isChatOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <ScissorsIcon />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Barber Assistant</p>
              <p className="text-emerald-400 text-xs mt-0.5">Online</p>
            </div>
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Chat body */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <p className="text-slate-300 text-sm font-medium">Sign in to chat</p>
            <p className="text-slate-500 text-xs">Sign in to chat with the assistant and book appointments.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-center pb-4">
                  <p className="text-slate-500 text-sm">Ask me to find a barber,<br />check availability, or book a slot.</p>
                  <div className="flex flex-col gap-2 mt-4 w-full">
                    {["Find barbers near me", "Who's available right now?"].map((s) => (
                      <button
                        key={s}
                        onClick={() => { setInput(s); }}
                        className="text-xs text-slate-400 border border-white/8 hover:border-white/16 hover:text-white bg-white/3 hover:bg-white/6 rounded-lg px-3 py-2 text-left transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    {msg.text && (
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-red-500 text-white rounded-br-sm"
                            : "bg-white/8 text-slate-200 rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}

                    {msg.uiType === "barber_ui" && msg.payload && (
                      <div className="mt-2 w-full space-y-2">
                        {msg.payload.map((barber, idx) => (
                          <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-white text-sm font-semibold truncate">{barber.shopName}</p>
                                <p className="text-slate-400 text-xs mt-0.5">{barber.firstName} · {barber.distance}</p>
                              </div>
                              <button
                                onClick={() => handleClick(barber.id)}
                                className="shrink-0 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                              >
                                Book
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.uiType === "booking_ui" && msg.payload && (
                      <div className="mt-2 bg-white/5 border border-amber-500/30 rounded-xl p-4">
                        <p className="text-amber-400 text-sm font-semibold mb-2">Review Details:</p>
                        <div className="text-sm text-slate-300 space-y-1 mb-4">
                          {/* Note: changed payload.Date to payload.date to match Python schema */}
                          <div><span className="text-slate-500">Date:</span> {msg.payload.date}</div>
                          <div><span className="text-slate-500">Time:</span> {msg.payload.start} to {msg.payload.end}</div>
                          <div><span className="text-slate-500">Service:</span> {msg.payload.service}</div>
                        </div>
                        
                        <button 
                          onClick={() => handleBook(msg.payload)} 
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition-colors"
                        >
                          Confirm Appointment
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="shrink-0 p-3 border-t border-white/8 flex gap-2"
            >
              <input
                type="text"
                placeholder="Message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-white/6 border border-white/10 focus:border-red-500/50 text-white placeholder-slate-500 text-sm px-3.5 py-2.5 rounded-xl outline-none transition-colors disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 disabled:bg-white/8 disabled:text-slate-600 text-white rounded-xl transition-colors"
              >
                <SendIcon />
              </button>
            </form>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg shadow-red-500/20 flex items-center justify-center z-50 transition-all duration-300 bg-red-500 hover:bg-red-600 text-white hover:scale-105 active:scale-95"
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
      >
        <div className={`transition-transform duration-300 ${isChatOpen ? "rotate-90 scale-90" : "rotate-0"}`}>
          {isChatOpen ? <CloseIcon /> : <ChatIcon />}
        </div>
      </button>
    </div>
  );
}