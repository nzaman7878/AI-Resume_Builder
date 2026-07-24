import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only initialize if the URL is provided, otherwise export null to avoid crashing app when unconfigured
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

// Auth endpoints limit: 5 requests per minute
export const authRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
}) : null;

// AI generation limit: 10 requests per minute
export const aiRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
}) : null;

export function getIpAddress(req: Request) {
  return req.headers.get("x-forwarded-for") ?? "127.0.0.1";
}
