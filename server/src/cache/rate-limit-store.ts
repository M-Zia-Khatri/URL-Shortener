import type { Redis } from 'ioredis';

export type RateLimitResult = { count: number; ttl: number; failed: boolean };

export class RateLimitStore {
  constructor(private redis: Redis) {}

  async increment(key: string, windowSeconds: number): Promise<RateLimitResult> {
    try {
      const results = await this.redis
        .multi()
        .incr(key)
        .expire(key, windowSeconds, 'NX')
        .ttl(key)
        .exec();
      const count = Number(results?.[0]?.[1] ?? 0);
      const ttl = Number(results?.[2]?.[1] ?? windowSeconds);
      return { count, ttl: ttl > 0 ? ttl : windowSeconds, failed: false };
    } catch {
      return { count: 0, ttl: windowSeconds, failed: true };
    }
  }
}
