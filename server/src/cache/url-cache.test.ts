import { describe, expect, it, vi } from 'vitest';
import { UrlCache } from './url-cache.js';

const row = { id: 'id', originalUrl: 'https://example.com', shortCode: 'abc1234', isActive: true, expiresAt: null, createdAt: new Date(), updatedAt: new Date() } as any;

describe('UrlCache', () => {
  it('returns misses and catches Redis errors', async () => {
    const redis = { get: vi.fn().mockRejectedValue(new Error('down')) } as any;
    await expect(new UrlCache(redis, 60, 5).getUrl('abc1234')).resolves.toEqual({ status: 'miss' });
  });

  it('sets and reads cached URL rows', async () => {
    const redis = { get: vi.fn().mockResolvedValue(JSON.stringify(row)), set: vi.fn(), del: vi.fn() } as any;
    await expect(new UrlCache(redis, 60, 5).getUrl(row.shortCode)).resolves.toMatchObject({ status: 'hit', url: { shortCode: row.shortCode } });
  });

  it('supports negative caching', async () => {
    const redis = { get: vi.fn().mockResolvedValue('__missing__'), set: vi.fn(), del: vi.fn() } as any;
    await expect(new UrlCache(redis, 60, 5).getUrl('missing')).resolves.toEqual({ status: 'negative-hit' });
  });
});
