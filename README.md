# Ur-Umbrella ✂️

A modern, high-performance barber booking and real-time tracking platform. Ur-Umbrella is engineered to handle seamless appointment scheduling, intelligent intent-reading via an LLM chatbot, precise geolocation calculations, and serverless asynchronous background tasks, all while maintaining top-tier security and SEO performance.

## ✨ Key Features & Engineering Highlights

*   **Hybrid Rendering (SSR & CSR):** Leverages Next.js App Router to deliver Server-Side Rendered (SSR) pages for maximum SEO and instant initial load times for shop listings, while using Client-Side Rendering (CSR) for highly interactive user dashboards.
*   **Strict Payload Validation:** End-to-end type safety and API request validation using **Zod**. Malformed or malicious booking payloads are caught and rejected before they ever hit the database.
*   **API Security & Rate Limiting:** Built-in rate limiting powered by **Upstash Redis** to prevent abuse, DDoS attacks, and spam on critical endpoints like the booking engine and LLM chatbot.
*   **Serverless Background Emails:** Utilizes a "Push" model message queue via **Upstash QStash** to process email confirmations asynchronously. This keeps the main booking API blazingly fast without requiring dedicated 24/7 worker servers.
*   **Geospatial Tracking:** Calculates exact distances and coordinates between users and barber shops in real-time using Redis GEO.
*   **Smart Scheduling Engine:** Real-time conflict prevention and concurrency locking ensure double-bookings are mathematically impossible.
*   **AI-Powered Chatbot:** An integrated LLM chatbot that reads user intent to assist with the booking process and platform navigation.

## 🛠 Tech Stack

*   **Framework:** Next.js (App Router)
*   **Database:** MongoDB (via Mongoose)
*   **Caching, GEO & Rate Limiting:** Upstash Redis
*   **Message Queue:** Upstash QStash (Serverless Webhooks)
*   **Email Service:** Nodemailer
*   **Validation:** Zod
*   **Authentication:** NextAuth.js (or custom session management)

## 🏗 Architectural Deep Dive

### 1. Rendering Strategy
The application strategically splits rendering methods to optimize for both bots and humans:
*   **SSR (Server-Side Rendering):** Search pages and available time slots are rendered on the server to guarantee users and search engines always receive the most up-to-date availability without client-side loading states.
*   **CSR (Client-Side Rendering):** Private, interactive elements like the user booking management dashboard are rendered on the client for a snappy, app-like feel.

### 2. Serverless Email Queue (QStash)
To ensure maximum performance and maintain a 100% serverless architecture on Vercel, this project avoids long-running polling workers (like BullMQ). When a user books a slot, the API publishes a payload to QStash and immediately returns a `201 Created` response. QStash securely pushes a webhook back to a dedicated Next.js worker route (`/api/worker/email`) to handle Nodemailer logic, complete with automatic retries and exponential backoff.

### 3. Security (Zod + Redis)
Every incoming request to the API is first validated against a strict **Zod schema**. Once validated, the request passes through a **Redis Rate Limiter** to ensure users cannot spam the booking or LLM endpoints, protecting both database integrity and third-party API costs.

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   MongoDB URI
*   Upstash Account (for Redis and QStash)
*   A Gmail account with an "App Password"

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/ur-umbrella.git](https://github.com/yourusername/ur-umbrella.git)
cd ur-umbrella
2. Install dependencies
Bash
npm install
3. Environment Variables
Create a .env.local file in the root directory and add the following keys:

Code snippet
# Database
MONGODB_URI="your_mongodb_connection_string"

# Upstash Redis (For Geolocation, Caching & Rate Limiting)
UPSTASH_REDIS_REST_URL="your_upstash_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"

#AUTH
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET="FKDMKM"

# Upstash QStash (For Background Emails)
QSTASH_TOKEN="your_qstash_token"
QSTASH_CURRENT_SIGNING_KEY="your_current_signing_key"
QSTASH_NEXT_SIGNING_KEY="your_next_signing_key"

# Nodemailer
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_16_character_app_password"

# Base URL (Crucial for QStash webhooks)
# Use your Ngrok URL for local development or Vercel domain for production
NEXT_PUBLIC_SITE_URL="http://localhost:3000" 
4. Local Development with QStash
Because QStash requires a public URL to deliver webhooks, you must use a tunneling service like Ngrok when testing locally.

Start your Next.js server:

Bash
npm run dev

2. In a new terminal, start Ngrok on port 3000:
   ```bash
   ngrok http 3000
   
Copy the Ngrok forwarding URL and update your NEXT_PUBLIC_SITE_URL in .env.local.

📂 Key Directory Structure
Plaintext
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── bookings/route.js        # Main booking API (Zod + Redis Locks + QStash)
│   │   │   └── worker/email/route.js    # QStash secure webhook receiver (Nodemailer)
│   ├── lib/
│   │   ├── mail.js                      # Nodemailer transporter config
│   │   ├── redis.js                     # Upstash Redis connection & Rate Limiter config
│   │   └── validations.js               # Zod schemas for payload validation
│   └── models/                          # Mongoose Schemas (User, Barber, Booking)
🗺 Roadmap
[ ] Integrate Payment Gateway (Stripe/Razorpay) with idempotency keys.

[ ] Implement WebSockets for real-time dashboard updates for Barber shops.

[ ] Expand Dockerization for local microservice testing.
