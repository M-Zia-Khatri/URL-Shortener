import { randomUUID } from 'node:crypto';
import type { FastifyBaseLogger } from 'fastify';
import type { Redis } from 'ioredis';
import { CLICK_STREAM } from '../config/constants.js';

export type ClickEvent = { eventId?: string; urlId: string; referrer?: string; userAgent?: string; country?: string };

export async function publishClick(redis: Redis, event: ClickEvent, log?: FastifyBaseLogger) {
  const eventId = event.eventId ?? randomUUID();
  try {
    await redis.xadd(
      CLICK_STREAM,
      '*',
      'eventId',
      eventId,
      'urlId',
      event.urlId,
      'referrer',
      event.referrer ?? '',
      'userAgent',
      event.userAgent ?? '',
      'country',
      event.country ?? '',
    );
    log?.info({ event: 'ANALYTICS_PUBLISHED', eventId, urlId: event.urlId }, 'Analytics event published');
  } catch (error) {
    log?.warn({ error, eventId, urlId: event.urlId }, 'Analytics publish failed; redirect remains best-effort');
  }
}
