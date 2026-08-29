import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.CLIENT_URL = 'http://localhost:5173';
});

const active = { id: 'id', originalUrl: 'https://example.com', shortCode: 'abc1234', isActive: true, expiresAt: null, createdAt: new Date(), updatedAt: new Date() } as any;

describe('UrlService availability', () => {
  it('returns 410 for disabled URLs', async () => {
    const { UrlService } = await import('./url.service.js');
    const repo = { findByShortCode: vi.fn().mockResolvedValue({ ...active, isActive: false }) } as any;
    const cache = { getUrl: vi.fn().mockResolvedValue({ status: 'miss' }), setUrl: vi.fn(), setMissing: vi.fn(), deleteUrl: vi.fn() } as any;
    await expect(new UrlService(repo, cache).getByCode('abc1234')).rejects.toMatchObject({ statusCode: 410, code: 'URL_DISABLED' });
  });

  it('returns 410 for expired URLs', async () => {
    const { UrlService } = await import('./url.service.js');
    const repo = { findByShortCode: vi.fn().mockResolvedValue({ ...active, expiresAt: new Date(Date.now() - 1000) }) } as any;
    const cache = { getUrl: vi.fn().mockResolvedValue({ status: 'miss' }), setUrl: vi.fn(), setMissing: vi.fn(), deleteUrl: vi.fn() } as any;
    await expect(new UrlService(repo, cache).getByCode('abc1234')).rejects.toMatchObject({ statusCode: 410, code: 'URL_EXPIRED' });
  });
});
