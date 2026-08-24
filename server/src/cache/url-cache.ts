import type { FastifyBaseLogger } from 'fastify';
import type { Redis } from 'ioredis';
import type { UrlRow } from '../modules/urls/url.repository.js';

type CacheLookup = { status: 'hit'; url: UrlRow } | { status: 'negative-hit' } | { status: 'miss' };

const NEGATIVE_CACHE_VALUE = '__missing__';

export class UrlCache {
  constructor(
    private redis: Redis,
    private ttl: number,
    private negativeTtl: number,
    private log?: FastifyBaseLogger,
  ) {}

  private key(code: string) {
    return `url:${code}`;
  }

  async getUrl(code: string): Promise<CacheLookup> {
    try {
      const value = await this.redis.get(this.key(code));
      if (!value) {
        this.log?.info({ shortCode: code, cache: 'miss' }, 'URL cache miss');
        return { status: 'miss' };
      }
      if (value === NEGATIVE_CACHE_VALUE) {
        this.log?.info({ shortCode: code, cache: 'negative-hit' }, 'URL negative cache hit');
        return { status: 'negative-hit' };
      }
      this.log?.info({ shortCode: code, cache: 'hit' }, 'URL cache hit');
      return { status: 'hit', url: JSON.parse(value) as UrlRow };
    } catch (error) {
      this.log?.warn({ error, shortCode: code }, 'URL cache read failed; falling through to Postgres');
      return { status: 'miss' };
    }
  }

  async setUrl(url: UrlRow) {
    try {
      await this.redis.set(this.key(url.shortCode), JSON.stringify(url), 'EX', this.ttl);
    } catch (error) {
      this.log?.warn({ error, shortCode: url.shortCode }, 'URL cache write failed; continuing');
    }
  }

  async setMissing(code: string) {
    try {
      await this.redis.set(this.key(code), NEGATIVE_CACHE_VALUE, 'EX', this.negativeTtl);
    } catch (error) {
      this.log?.warn({ error, shortCode: code }, 'URL negative cache write failed; continuing');
    }
  }

  async deleteUrl(code: string) {
    try {
      await this.redis.del(this.key(code));
    } catch (error) {
      this.log?.warn({ error, shortCode: code }, 'URL cache invalidation failed; continuing');
    }
  }
}
