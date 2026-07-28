import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ConfigurationError, RateLimitError } from "@/domain/shared/errors";
import { logger } from "@/infrastructure/logging/logger";

let redis: Redis | null = null;
const limiters = new Map<string, Ratelimit>();

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new ConfigurationError(
      "Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }
  if (!redis) {
    redis = new Redis({ url, token });
  }
  return redis;
}

function getLimiter(name: string, limit: number, window: `${number} s` | `${number} m`): Ratelimit {
  const key = `${name}:${limit}:${window}`;
  const existing = limiters.get(key);
  if (existing) return existing;

  const instance = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `mt:rl:${name}`,
    analytics: true,
  });
  limiters.set(key, instance);
  return instance;
}

export type RateLimitResult = { success: true; remaining: number } | { success: false; retryAfterMs: number };

/**
 * Reusable RateLimit service (Upstash Redis).
 */
export async function rateLimit(
  identifier: string,
  options: { name?: string; limit?: number; window?: `${number} s` | `${number} m` } = {},
): Promise<RateLimitResult> {
  const name = options.name ?? "default";
  const limit = options.limit ?? 20;
  const window = options.window ?? "60 s";

  try {
    const limiter = getLimiter(name, limit, window);
    const result = await limiter.limit(identifier);
    if (!result.success) {
      const retryAfterMs = Math.max(0, result.reset - Date.now());
      logger.warn("Rate limit exceeded", { name, identifier, retryAfterMs });
      return { success: false, retryAfterMs };
    }
    return { success: true, remaining: result.remaining };
  } catch (error) {
    if (error instanceof ConfigurationError) throw error;
    logger.error("Rate limit service failure", { error });
    // Fail closed for auth endpoints is safer; callers decide.
    throw error;
  }
}

export async function assertRateLimit(
  identifier: string,
  options?: { name?: string; limit?: number; window?: `${number} s` | `${number} m` },
): Promise<void> {
  const result = await rateLimit(identifier, options);
  if (!result.success) {
    throw new RateLimitError("Too many requests", result.retryAfterMs);
  }
}
