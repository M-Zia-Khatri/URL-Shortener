import type { FastifyReply, FastifyRequest } from 'fastify';
import { RateLimitError } from '../lib/errors.js';
import type { RateLimitStore } from '../cache/rate-limit-store.js';

type RateLimitCategory = 'create' | 'management' | 'redirect' | 'analytics';

export function rateLimit(store: RateLimitStore, bucket: RateLimitCategory, limit: number, windowSeconds: number) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await store.increment(`${bucket}:${request.ip}`, windowSeconds);

    reply.header('RateLimit-Limit', limit);
    reply.header('RateLimit-Remaining', Math.max(limit - result.count, 0));
    reply.header('RateLimit-Reset', result.ttl);

    if (result.failed) {
      // Redis is not the source of truth. Redirects and write/management requests fail open so a cache outage
      // does not make existing links or API operations unavailable; Postgres still enforces data integrity.
      request.log.warn({ bucket }, 'Rate limit Redis check failed; allowing request');
      return;
    }

    if (result.count > limit) {
      reply.header('Retry-After', result.ttl);
      throw new RateLimitError();
    }
  };
}
