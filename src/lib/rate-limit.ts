import { Redis } from '@upstash/redis';
import { env } from './env';

// Initialize Redis client if credentials are available
const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

interface RateLimitOptions {
  interval: number;  // Time window in milliseconds
  uniqueTokenPerInterval?: number;  // Max number of unique tokens per interval
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new Map<string, number[]>();
  const now = Date.now();
  const windowStart = now - options.interval;

  return {
    check: async (limit: number, token: string) => {
      if (!redis) {
        // Fallback to in-memory rate limiting if Redis is not available
        const tokenTimestamps = tokenCache.get(token) || [];
        const windowTimestamps = tokenTimestamps.filter(ts => ts > windowStart);
        
        if (windowTimestamps.length >= limit) {
          throw new Error('Rate limit exceeded');
        }
        
        windowTimestamps.push(now);
        tokenCache.set(token, windowTimestamps);
        return;
      }

      // Use Redis for rate limiting
      const key = `ratelimit:${token}`;
      const requests = await redis.incr(key);
      
      if (requests === 1) {
        await redis.expire(key, Math.ceil(options.interval / 1000));
      }
      
      if (requests > limit) {
        throw new Error('Rate limit exceeded');
      }
    },
  };
}

// Clean up old entries periodically
if (!redis) {
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
} 