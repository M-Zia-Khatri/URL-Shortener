import type { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { z } from 'zod';
import { rateLimit } from '../../middleware/rate-limit.js';
import type { AnalyticsController } from './analytics.controller.js';

export function analyticsRoutes(app: FastifyInstance, c: AnalyticsController) {
  app.get(
    '/api/urls/:id/analytics',
    {
      schema: { params: z.object({ id: z.string().uuid() }) },
      preHandler: rateLimit(
        app.rateStore,
        'analytics',
        app.config.RATE_LIMIT_ANALYTICS,
        app.config.RATE_LIMIT_WINDOW_SECONDS,
      ),
    },
    c.get as RouteHandlerMethod,
  );
}
