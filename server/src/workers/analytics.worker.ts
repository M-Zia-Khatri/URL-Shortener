import { setTimeout as delay } from 'node:timers/promises';
import { createRedis } from '../cache/redis.js';
import {
  CLICK_DEAD_LETTER_STREAM,
  CLICK_GROUP,
  CLICK_STREAM,
  WORKER_BATCH_SIZE,
  WORKER_BLOCK_MS,
  WORKER_IDLE_CLAIM_MS,
  WORKER_RETRY_CAP,
} from '../config/constants.js';
import { db } from '../db/index.js';
import { urlClicks } from '../db/schema/url-clicks.js';

const redis = createRedis();
const consumer = `worker-${process.pid}`;
let stopping = false;
let processed = 0;
let failures = 0;

type StreamMessage = [string, string[]];

function fieldsToObject(fields: string[]) {
  return Object.fromEntries(Array.from({ length: fields.length / 2 }, (_, i) => [fields[i * 2], fields[i * 2 + 1]]));
}

async function ensureGroup() {
  try {
    await redis.xgroup('CREATE', CLICK_STREAM, CLICK_GROUP, '$', 'MKSTREAM');
  } catch (error: any) {
    if (!String(error?.message ?? '').includes('BUSYGROUP')) throw error;
  }
}

async function retry<T>(fn: () => Promise<T>) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await delay(attempt * 100);
    }
  }
  throw lastError;
}

async function deadLetter(id: string, data: Record<string, string>, reason: string) {
  await redis.xadd(
    CLICK_DEAD_LETTER_STREAM,
    '*',
    'sourceId',
    id,
    'eventId',
    data.eventId ?? '',
    'urlId',
    data.urlId ?? '',
    'reason',
    reason,
  );
  await redis.xack(CLICK_STREAM, CLICK_GROUP, id);
  console.error(JSON.stringify({ event: 'ANALYTICS_DEAD_LETTERED', id, eventId: data.eventId, urlId: data.urlId, reason }));
}

async function handleMessage([id, fields]: StreamMessage) {
  const data = fieldsToObject(fields);
  if (!data.eventId || !data.urlId) {
    await deadLetter(id, data, 'missing-required-fields');
    return;
  }

  const pending = (await redis.xpending(CLICK_STREAM, CLICK_GROUP, id, id, 1)) as any[];
  const deliveries = Number(pending?.[0]?.[3] ?? 1);
  if (deliveries > WORKER_RETRY_CAP) {
    await deadLetter(id, data, 'retry-cap-exceeded');
    return;
  }

  try {
    await retry(() =>
      db
        .insert(urlClicks)
        .values({
          eventId: data.eventId,
          urlId: data.urlId,
          referrer: data.referrer || null,
          userAgent: data.userAgent || null,
          country: data.country || null,
        })
        .onConflictDoNothing({ target: urlClicks.eventId }),
    );
    await redis.xack(CLICK_STREAM, CLICK_GROUP, id);
    processed++;
    console.log(JSON.stringify({ event: 'ANALYTICS_PROCESSED', id, eventId: data.eventId, urlId: data.urlId, processed }));
  } catch (error) {
    failures++;
    console.error(JSON.stringify({ event: 'ANALYTICS_PROCESS_FAILED', id, eventId: data.eventId, failures, error }));
    // Do not ACK on insert failure; another worker or XAUTOCLAIM can retry this message.
  }
}

async function claimPending() {
  const result = (await redis.xautoclaim(
    CLICK_STREAM,
    CLICK_GROUP,
    consumer,
    WORKER_IDLE_CLAIM_MS,
    '0-0',
    'COUNT',
    WORKER_BATCH_SIZE,
  )) as [string, StreamMessage[]];
  const messages = result?.[1] ?? [];
  if (messages.length) console.log(JSON.stringify({ event: 'ANALYTICS_CLAIMED', count: messages.length }));
  for (const message of messages) await handleMessage(message);
}

async function logMonitoring() {
  const [length, pending] = await Promise.all([
    redis.xlen(CLICK_STREAM).catch(() => -1),
    redis.xpending(CLICK_STREAM, CLICK_GROUP).catch(() => null),
  ]);
  console.log(JSON.stringify({ event: 'ANALYTICS_MONITOR', streamLength: length, pending }));
}

async function shutdown(signal: string) {
  stopping = true;
  console.log(JSON.stringify({ event: 'ANALYTICS_WORKER_SHUTDOWN', signal, processed, failures }));
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));

async function run() {
  await ensureGroup();
  let lastClaim = 0;
  let lastMonitor = 0;
  while (!stopping) {
    const now = Date.now();
    if (now - lastClaim > WORKER_IDLE_CLAIM_MS) {
      await claimPending();
      lastClaim = now;
    }
    if (now - lastMonitor > 60000) {
      await logMonitoring();
      lastMonitor = now;
    }

    const rows = (await redis.xreadgroup(
      'GROUP',
      CLICK_GROUP,
      consumer,
      'COUNT',
      WORKER_BATCH_SIZE,
      'BLOCK',
      WORKER_BLOCK_MS,
      'STREAMS',
      CLICK_STREAM,
      '>',
    )) as any;
    if (!rows) continue;
    for (const [, messages] of rows) for (const message of messages as StreamMessage[]) await handleMessage(message);
  }
  await redis.quit().catch(() => undefined);
}

run().catch((error) => {
  console.error(JSON.stringify({ event: 'ANALYTICS_WORKER_FATAL', error }));
  process.exit(1);
});
