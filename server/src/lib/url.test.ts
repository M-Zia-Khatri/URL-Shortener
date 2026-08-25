import { describe, expect, it, vi } from 'vitest';

vi.mock('../config/env.js', () => ({ env: { BLOCK_PRIVATE_URLS: true } }));
vi.mock('node:dns/promises', () => ({ lookup: vi.fn(async (host: string) => host === 'private.test' ? [{ address: '10.0.0.1' }] : [{ address: '93.184.216.34' }]) }));

describe('validateUrl', () => {
  it('accepts public http and https URLs', async () => {
    const { validateUrl } = await import('./url.js');
    await expect(validateUrl('https://example.com/path')).resolves.toBe('https://example.com/path');
  });

  it('rejects unsupported schemes', async () => {
    const { validateUrl } = await import('./url.js');
    await expect(validateUrl('javascript:alert(1)')).rejects.toThrow('http or https');
  });

  it('blocks private literal and resolved IPs', async () => {
    const { validateUrl } = await import('./url.js');
    await expect(validateUrl('http://127.0.0.1/admin')).rejects.toThrow('private or internal');
    await expect(validateUrl('http://private.test/admin')).rejects.toThrow('private or internal');
  });
});
