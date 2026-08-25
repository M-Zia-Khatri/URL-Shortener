import type { FastifyInstance } from 'fastify';
import { rateLimit } from '../../middleware/rate-limit.js';
import type { UrlController } from './url.controller.js';
import { codeParams, createUrlBody, errorResponse, idParams, listQuery, listUrlResponse, successResponse, updateUrlBody, urlResponse } from './url.schema.js';

export function urlRoutes(app: FastifyInstance, controller: UrlController) {
  app.post(
    '/api/urls',
    { schema: { body: createUrlBody, response: { 201: successResponse(urlResponse), 400: errorResponse, 429: errorResponse, 500: errorResponse } }, preHandler: rateLimit(app.rateStore, 'create', app.config.RATE_LIMIT_CREATE, app.config.RATE_LIMIT_WINDOW_SECONDS) },
    controller.create,
  );
  app.get(
    '/api/urls',
    { schema: { querystring: listQuery, response: { 200: listUrlResponse, 429: errorResponse, 500: errorResponse } }, preHandler: rateLimit(app.rateStore, 'management', app.config.RATE_LIMIT_MANAGEMENT, app.config.RATE_LIMIT_WINDOW_SECONDS) },
    controller.list,
  );
  app.get(
    '/api/urls/:id',
    { schema: { params: idParams, response: { 200: successResponse(urlResponse), 404: errorResponse, 410: errorResponse, 429: errorResponse, 500: errorResponse } }, preHandler: rateLimit(app.rateStore, 'management', app.config.RATE_LIMIT_MANAGEMENT, app.config.RATE_LIMIT_WINDOW_SECONDS) },
    controller.get,
  );
  app.patch(
    '/api/urls/:id',
    { schema: { params: idParams, body: updateUrlBody, response: { 200: successResponse(urlResponse), 400: errorResponse, 404: errorResponse, 429: errorResponse, 500: errorResponse } }, preHandler: rateLimit(app.rateStore, 'management', app.config.RATE_LIMIT_MANAGEMENT, app.config.RATE_LIMIT_WINDOW_SECONDS) },
    controller.update,
  );
  app.delete(
    '/api/urls/:id',
    { schema: { params: idParams, response: { 204: zodEmpty(), 404: errorResponse, 429: errorResponse, 500: errorResponse } }, preHandler: rateLimit(app.rateStore, 'management', app.config.RATE_LIMIT_MANAGEMENT, app.config.RATE_LIMIT_WINDOW_SECONDS) },
    controller.remove,
  );
  app.get(
    '/:code',
    { schema: { params: codeParams, response: { 404: errorResponse, 410: errorResponse, 429: errorResponse, 500: errorResponse } }, preHandler: rateLimit(app.rateStore, 'redirect', app.config.RATE_LIMIT_REDIRECT, app.config.RATE_LIMIT_WINDOW_SECONDS) },
    controller.redirect,
  );
}

function zodEmpty() {
  return { type: 'null' };
}
