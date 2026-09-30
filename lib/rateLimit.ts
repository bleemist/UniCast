/**
 * In-memory sliding window rate limiter for API endpoints (auth, requests, contact, uploads).
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Periodically clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((t) => now - t < 3600000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    });
  }, 300000);
}

export interface RateLimitOptions {
  windowMs: number; // e.g. 60000 for 1 minute
  maxRequests: number; // e.g. 5 requests per window
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 10 }
): { isAllowed: boolean; currentCount: number; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = memoryStore.get(identifier) || { timestamps: [] };

  // Filter timestamps within current window
  const validTimestamps = record.timestamps.filter((t) => now - t < options.windowMs);

  if (validTimestamps.length >= options.maxRequests) {
    const oldestTimestamp = validTimestamps[0];
    const resetMs = options.windowMs - (now - oldestTimestamp);
    return {
      isAllowed: false,
      currentCount: validTimestamps.length,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  validTimestamps.push(now);
  memoryStore.set(identifier, { timestamps: validTimestamps });

  return {
    isAllowed: true,
    currentCount: validTimestamps.length,
    remaining: options.maxRequests - validTimestamps.length,
    resetMs: options.windowMs,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
