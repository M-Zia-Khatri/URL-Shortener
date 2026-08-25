import type { FastifyError, FastifyInstance } from 'fastify';
import { AppError } from '../lib/errors.js';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const status = error instanceof AppError ? error.statusCode : error.validation ? 400 : 500;
    const code = error instanceof AppError ? error.code : status === 400 ? 'BAD_REQUEST' : 'INTERNAL_ERROR';
    const message = status === 500 ? 'Unexpected server error' : error.message;

    if (status === 500) app.log.error({ error, reqId: request.id }, 'Unhandled request error');
    if (status === 429) app.log.warn({ event: 'RATE_LIMITED', path: request.url, ip: request.ip }, 'Rate limit exceeded');

    reply.code(status).send({ success: false, error: { code, message } });
  });
}
