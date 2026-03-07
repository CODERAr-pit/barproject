import { Redis } from "@upstash/redis";

console.log("URL:", process.env.UPSTASH_REDIS_REST_URL);
console.log("TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN);

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log("Redis instance:", redis);
console.log("Redis keys:", Object.keys(redis));