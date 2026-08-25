import type { FastifyInstance, RouteHandlerMethod } from 'fastify';
import { z } from 'zod';
import { rateLimit } from '../../middleware/rate-limit.js';
import type { AnalyticsController } from './analytics.controller.js';

const analyticsQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export function analyticsRoutes(app: FastifyInstance, c: AnalyticsController) {
  app.get(
    '/api/urls/:id/analytics',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        querystring: analyticsQuery,
      },
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
