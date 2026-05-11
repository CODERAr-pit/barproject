import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import {redis} from "@/lib/redis";

// 1. Standard Limiter (For browsing, booking, etc.)
const standardLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(30, "10 s"), 
});

// 2. Strict Chat Limiter (Protects your Groq API key)
const chatLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // Only 5 messages per minute per user!
});

export async function middleware(request) {
  try {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // Check if the request is going to your Groq chat endpoint
    const isChatRoute = request.nextUrl.pathname.startsWith("/api/chat");

    // Pick the right limiter based on the route
    const currentLimiter = isChatRoute ? chatLimiter : standardLimiter;

    const { success, limit, reset, remaining } = await currentLimiter.limit(
      `ratelimit_${isChatRoute ? 'chat' : 'std'}_${ip}`
    );

    if (!success) {
      return NextResponse.json(
        { 
          error: isChatRoute 
            ? "Chat limit reached. Please wait a minute before sending another message." 
            : "Too many requests, please slow down."
        },
        { status: 429 }
      );
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Rate Limiting Error:", error);
    return NextResponse.next(); 
  }
}

export const config = {
  matcher: ["/api/:path*"],
};