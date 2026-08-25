import { NotFoundError } from '../../lib/errors.js';
import { UrlRepository } from '../urls/url.repository.js';
import { AnalyticsRepository } from './analytics.repository.js';

export type AnalyticsInput = { from?: Date; to?: Date; page?: number; pageSize?: number };

export class AnalyticsService {
  constructor(private urls: UrlRepository, private analytics: AnalyticsRepository) {}

  async get(id: string, input: AnalyticsInput = {}) {
    if (!(await this.urls.findById(id))) throw new NotFoundError();
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const query = { from: input.from, to: input.to, offset: (page - 1) * pageSize, limit: pageSize };
    const [counts, topReferrers, topCountries, recentClicks] = await Promise.all([
      this.analytics.counts(id, query),
      this.analytics.top(id, 'referrer', query),
      this.analytics.top(id, 'country', query),
      this.analytics.recentClicks(id, query),
    ]);
    return {
      totalClicks: counts.total_clicks ?? 0,
      clicksToday: counts.clicks_today ?? 0,
      clicksLast7Days: counts.clicks_last_7_days ?? 0,
      clicksLast30Days: counts.clicks_last_30_days ?? 0,
      topReferrers,
      topCountries,
      recentClicks: recentClicks.map((click) => ({
        id: click.id,
        clickedAt: click.clicked_at,
        referrer: click.referrer,
        country: click.country,
        userAgent: click.user_agent,
      })),
      pagination: { page, pageSize, hasMore: recentClicks.length === pageSize },
    };
  }
}
