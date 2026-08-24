import type { FastifyRequest } from 'fastify';
import type { AnalyticsService } from './analytics.service.js';

export class AnalyticsController {
  constructor(private service: AnalyticsService) {}
  get = async (r: FastifyRequest<{ Params: { id: string }; Querystring: any }>) => ({
    success: true,
    data: await this.service.get(r.params.id, r.query as any),
  });
}
