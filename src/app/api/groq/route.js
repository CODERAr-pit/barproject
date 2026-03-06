import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  console.log("Received request at /api/groq");
  const requestBody = await request.json();
  console.log("Request body:", requestBody);
  const completion = await getGroqChatCompletion(requestBody);

  const content = completion.choices[0].message.content;
  const chatCompletion = JSON.parse(content);

  if (chatCompletion.action === "live_location_barber") {

    const res = await fetch(`${process.env.BASE_URL}/api/live_location_barber`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: requestBody.lat,
        lng: requestBody.lng
      })
    });

    if (res.ok) {

      const data = await res.json();

      const comp = await getGroqChatCompletion({
        context:"You are a chatbot for a barber booking platform. Based on the nearby barbers data, respond with a user-friendly message listing the barbers and their details. If no barbers are found, respond accordingly.",
        message: JSON.stringify(data)
      });

      return NextResponse.json({
        data: comp.choices[0].message.content
      });
    }

    return NextResponse.json({
      msg: "No barbers found in your location"
    });
  }

  else if (chatCompletion.action === "book_slot") {

    const bookingRes = await fetch(`${process.env.BASE_URL}/api/bookfetch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        barber: chatCompletion.barber_id,
        user: chatCompletion.user_id,
        start_time: chatCompletion.start_time,
        end_time: chatCompletion.end_time
      })
    });

    if (bookingRes.ok) {

      const data = await bookingRes.json();

      const comp = await getGroqChatCompletion({
        message: JSON.stringify(data)
      });

      return NextResponse.json({
        data: comp.choices[0].message.content,
        booking_id: data.booking_id
      });
    }
  }

  else if (chatCompletion.action === "noaction") {

    return NextResponse.json({
      response: chatCompletion.response
    });
  }
}

async function getGroqChatCompletion(requestBody) {

  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
You are a chatbot for a barber booking platform.

if you recive barbers name or shop name or location or services then respond with:
{
these are the details of the barbershop near the you or the details of the barber you asked for}

If the user asks for nearby barbers or services based on location then respond with:
return JSON like:

{
 "action":"live_location_barber",
}

If the user asks for booking a slot with a barber:

{
 "action":"book_slot",
 "barber_id":"id",
 "user_id":"id",
 "start_time":"time",
 "end_time":"time"
}

Otherwise respond:

{
 "action":"noaction",
 "response":"text"
}

Always respond ONLY in JSON.
Never include explanations.
`
      },
      {
        role: "user",
        content: requestBody.query
      }
    ],
    model: "openai/gpt-oss-20b"
  });
}