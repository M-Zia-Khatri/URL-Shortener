import { buildApp } from './app.js';
import { connectWithRetry, pool } from './db/client.js';
import { env } from './config/env.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;
const app = await buildApp();
let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  app.log.info({ event: 'API_SHUTDOWN_STARTED', signal }, 'API graceful shutdown started');

  const timeout = setTimeout(() => {
    app.log.error({ event: 'API_SHUTDOWN_TIMEOUT', signal }, 'API graceful shutdown timed out; forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  timeout.unref();

  try {
    // Fastify close() stops accepting new requests and waits for in-flight handlers before onClose hooks run.
    await app.close();
    await pool.end();
    clearTimeout(timeout);
    app.log.info({ event: 'API_SHUTDOWN_COMPLETE', signal }, 'API graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    app.log.error({ event: 'API_SHUTDOWN_FAILED', signal, error }, 'API graceful shutdown failed');
    process.exit(1);
  }
}

process.once('SIGTERM', (signal) => void shutdown(signal));
process.once('SIGINT', (signal) => void shutdown(signal));

try {
  await connectWithRetry();
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  await app.close().catch(() => undefined);
  await pool.end().catch(() => undefined);
  process.exit(1);
}
