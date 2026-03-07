"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
export default function Home() {

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // Stores the chat history
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // Used to auto-scroll to the bottom

  const router = useRouter();
  const { data: session, status } = useSession();
   const isAuthenticated = status === "authenticated";
  // Auto-scroll to the latest message whenever the messages array updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput(""); // Clear the input field immediately
    
    // Add user's message to the chat
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

          const textData = await res.text();
          
          // Add bot's response to the chat
          setMessages((prev) => [...prev, { sender: "bot", text: textData }]);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Unable to access your location. Please allow location access and try again." }
          ]);
          setIsLoading(false);
        }
      );
    } catch (e) {
      console.error("Error during chat:", e);
      setMessages((prev) => [...prev, { sender: "bot", text: "Something went wrong. Please try again." }]);
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
    <div className="min-h-screen flex flex-col items-center bg-slate-950 p-4">
      <h1 className="my-6 text-4xl font-bold text-white text-center">
        Search <span className="text-red-500">Barbers</span> Near You!
      </h1>

      {/* Chat Window */}
      { !isAuthenticated &&
        <div className="flex flex-col flex-1 text-center w-full h-16 max-w-2xl bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden mb-6">
          <p>Please sign in to chat with the bot.</p></div>}
     {isAuthenticated &&<div className="flex flex-col flex-1 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden mb-6">
      
<div className="flex-1 p-4 overflow-y-auto space-y-4 h-[60vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-red-500 [&::-webkit-scrollbar-thumb]:rounded-lg hover:[&::-webkit-scrollbar-thumb]:bg-red-600">
  {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-500">
              <p>Say hello to start finding barbers!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-red-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 p-3 rounded-lg rounded-bl-none border border-slate-700 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSendMessage} 
          className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={handleInput}
            disabled={isLoading}
            className="flex-1 p-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>}
    </div>
  );
}