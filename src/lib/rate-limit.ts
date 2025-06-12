import { Redis } from '@upstash/redis';

// Initialize Redis client if credentials are available
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = upstashUrl && upstashToken
  ? new Redis({
      url: upstashUrl,
      token: upstashToken,
    })
  : null;

interface RateLimitOptions {
  interval: number;  // Time window in milliseconds
  uniqueTokenPerInterval?: number;  // Max number of unique tokens per interval
}

const tokenCache = new Map<string, number[]>();

export function rateLimit(options: RateLimitOptions) {
  // Clean up old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [token, timestamps] of tokenCache.entries()) {
      const validTimestamps = timestamps.filter(ts => ts > now - options.interval);
      if (validTimestamps.length === 0) {
        tokenCache.delete(token);
      } else {
        tokenCache.set(token, validTimestamps);
      }
    }
  }, options.interval);

  return {
    check: async (limit: number, token: string) => {
      const now = Date.now();
      const windowStart = now - options.interval;
      const tokenTimestamps = tokenCache.get(token) || [];
      const windowTimestamps = tokenTimestamps.filter(ts => ts > windowStart);
      
      if (windowTimestamps.length >= limit) {
        throw new Error('Rate limit exceeded');
      }
      
      windowTimestamps.push(now);
      tokenCache.set(token, windowTimestamps);
    },
  };
} 