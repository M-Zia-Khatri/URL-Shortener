import { describe, expect, it, vi } from 'vitest';

vi.mock('../config/env.js', () => ({ env: { BLOCK_PRIVATE_URLS: true } }));
vi.mock('node:dns/promises', () => ({
  lookup: vi.fn(async (host: string) => {
    if (host === 'rebind.test' || host === 'redirect-chain.test') return [{ address: '127.0.0.1' }];
    return [{ address: '93.184.216.34' }];
  }),
}));

describe('URL security validation', () => {
  it('rejects encoded scheme tricks and malformed URLs', async () => {
    const { validateUrl } = await import('./url.js');
    await expect(validateUrl('java%0ascript:alert(1)')).rejects.toThrow('valid URL');
    await expect(validateUrl('https://example.com/%0d%0aLocation:%20http://127.0.0.1')).resolves.toContain('https://example.com/');
  });

  it('blocks DNS-rebinding style hostnames resolving to private addresses', async () => {
    const { validateUrl } = await import('./url.js');
    await expect(validateUrl('https://rebind.test/path')).rejects.toThrow('private or internal');
  });

  it('blocks a redirect-chain origin when its hostname resolves internally', async () => {
    const { validateUrl } = await import('./url.js');
    await expect(validateUrl('https://redirect-chain.test/start')).rejects.toThrow('private or internal');
  });
});
