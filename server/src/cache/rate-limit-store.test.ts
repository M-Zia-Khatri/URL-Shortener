import { describe, expect, it, vi } from 'vitest';
import { RateLimitStore } from './rate-limit-store.js';

describe('RateLimitStore', () => {
  it('increments and sets expiry atomically', async () => {
    const exec = vi.fn().mockResolvedValue([[null, 1], [null, 1], [null, 60]]);
    const chain: any = { incr: () => chain, expire: () => chain, ttl: () => chain, exec };
    const redis = { multi: () => chain } as any;
    await expect(new RateLimitStore(redis).increment('create:ip', 60)).resolves.toEqual({ count: 1, ttl: 60, failed: false });
  });

  it('marks Redis failures as fail-open results', async () => {
    const redis = { multi: () => { throw new Error('down'); } } as any;
    await expect(new RateLimitStore(redis).increment('create:ip', 60)).resolves.toEqual({ count: 0, ttl: 60, failed: true });
  });
});
