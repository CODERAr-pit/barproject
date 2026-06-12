from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import time
import json
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage, AIMessage
from langchain.tools import tool
from langchain_groq import ChatGroq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

researcher_llm = ChatGroq(model="llama-3.3-70b-versatile", max_tokens=600)

class ChatRequest(BaseModel):
    query: str
    lat: float
    lng: float
    history: list

@tool
def Search_near_me(lat: float, lng: float) -> str:
    """If you need to search for Barbers near the user, call this tool."""
    NEXTJS_URL = "http://localhost:3000/api/live_location_barber"
    payload = {"lat": lat, "lng": lng} 
    
    try:
        response = requests.post(NEXTJS_URL, json=payload)
        response.raise_for_status()
        data = response.json()
        return json.dumps(data.get("data", []))
    except Exception as e:
        return f"Error fetching barbers: {str(e)}"

@tool
def Book_barber(barber_id: str, date: str, start: str, end: str, service: str) -> str:
    """
    Use this tool ONLY to finalize an appointment when all details are known.
    CRITICAL FORMAT RULES:
    - barber_id: MUST be the unique ID of the barber from the previous search results.
    - date: MUST be strictly formatted as YYYY-MM-DD (e.g., "2026-06-15"). Use the current date provided in the system prompt to calculate relative days like "tomorrow".
    - start: MUST be strictly formatted as HH:MM AM/PM (e.g., "02:30 PM" or "10:00 AM").
    - end: MUST be strictly formatted as HH:MM AM/PM. Calculate this based on a standard 30-minute service duration if not specified.
    - service: The name of the service requested.
    """
    payload = {
        "barber": barber_id, 
        "date": date,
        "start": start,
        "end": end,
        "service": service
    }
    return json.dumps(payload)
    

model_with_tools = researcher_llm.bind_tools([Search_near_me, Book_barber])

@app.post("/ai-ask")
def main_node(req: ChatRequest) -> dict:
    current_time = datetime.now().strftime("%A, %B %d, %Y at %I:%M %p")
    
    messages = [
        SystemMessage(content=(
            f"You are a helpful barber booking assistant. Today's current date and time is: {current_time}.\n"
            "You have two tools, but YOU DO NOT HAVE TO USE THEM on every turn.\n\n"
            "1. Search_near_me: Use this when the user asks for nearby barbers or services.\n"
            "2. Book_barber: Use this ONLY to finalize an appointment.\n\n"
            "CRITICAL RULES FOR BOOKING:\n"
            "- To book, you MUST know: Barber ID, Date, Start Time, and Service.\n"
            "- If the user says 'Book me a slot', but is missing ANY of that information, DO NOT use a tool. "
            "Reply with a text message asking for the missing details.\n"
            "- If you don't know the Barber ID, use the Search_near_me tool first."
        ))
    ]
    
    for msg in req.history:
  
        text = msg.get("text")
        if text:
            if msg.get("sender") == "user":
                messages.append(HumanMessage(content=text))
            else:
                messages.append(AIMessage(content=text))
            
    messages.append(HumanMessage(content=f"User's Request: {req.query}"))
    
    max_retries = 3
    response = None
  
    for attempt in range(max_retries):
        try:
            response = model_with_tools.invoke(messages)
            break
        except Exception as e:
            print(f"⚠️ Groq crash on attempt {attempt + 1}. Retrying...")
            if attempt == max_retries - 1:
                return {
                    "response": "Error: The AI struggled to connect. Please try again.",
                    "uiType": "Simple"
                }
            time.sleep(1) 
            
    if response and response.tool_calls:
        messages.append(response) 
        
        for tool_call in response.tool_calls:
            if tool_call["name"] == "Search_near_me":
                tool_result = Search_near_me.invoke({"lat": req.lat, "lng": req.lng})
                messages.append(ToolMessage(content=tool_result, tool_call_id=tool_call["id"]))
       
                try:
                    final_response = model_with_tools.invoke(messages)
                    final_content = final_response.content
                except Exception:
                    final_content = "I found the barbers, but had trouble formatting the response."
            
                return {
                    "response": final_content,
                    "uiType": "barber_ui", 
                    "payload": json.loads(tool_result)
                }
    
            if tool_call["name"] == "Book_barber":
                tool_result = Book_barber.invoke(tool_call["args"])
                
                booking_payload = json.loads(tool_result)
                
                return {
                    "response": f"I have your {booking_payload['service']} ready! Please confirm the details below to lock in your slot.",
                    "uiType": "booking_ui",  
                    "payload": booking_payload
                }
    else:
        final_content = response.content if response else "No content generated."
        return {
            "response": final_content,
            "uiType": "Simple"
        }