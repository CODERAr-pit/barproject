import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { lat, lng, query } = await request.json();

    if (!query) {
      return new NextResponse("Query is required", { status: 400 });
    }

    // PHASE 1: Routing (Needs strict JSON)
    const routingPrompt = `You are a routing assistant. 
    If the user asks for nearby barbers or services based on location, respond ONLY with this JSON: { "action": "live_location_barber" }
    Otherwise, respond ONLY with this JSON: { "action": "noaction", "response": "Your friendly reply here about the intended question" }
    Do not include markdown or explanations. ONLY valid JSON.`;

    const completion = await getGroqChatCompletion(query, routingPrompt);
    const content = completion.choices[0].message.content;

    let chatCompletion;
    try {
      chatCompletion = JSON.parse(content);
    } catch {
      return new NextResponse("LLM returned non-JSON response during routing", { status: 502 });
    }

    // PHASE 2: Fetch and Summarize (Needs Plain Text)
    if (chatCompletion.action === "live_location_barber") {
      const res = await fetch(`${process.env.BASE_URL}/api/live_location_barber`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lng, lat }),
      });

      if (!res.ok) {
        return new NextResponse("Sorry, I couldn't find any barbers in your location right now.");
      }

      const data = await res.json();
      
      // Tell Llama to summarize the data normally, NO JSON
      const summaryPrompt = `You are a friendly barber booking assistant. Read the provided barber data and give a short, concise, and friendly summary of the nearby barbers and their distances. Do NOT use JSON. Answer in plain, conversational text.`;
      
      const comp = await getGroqChatCompletion(JSON.stringify(data), summaryPrompt);

      // Return plain text
      return new NextResponse(comp.choices[0].message.content, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (chatCompletion.action === "noaction") {
      // Return plain text for general chats
      return new NextResponse(chatCompletion.response, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new NextResponse("Unrecognised action from LLM", { status: 400 });

  } catch (e) {
    console.error("Error in Groq API route:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Updated helper function to accept a dynamic system prompt
async function getGroqChatCompletion(userContent, systemPrompt) {
  return groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    model: "llama-3.1-8b-instant",
  });
}