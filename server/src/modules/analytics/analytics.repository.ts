import { sql } from 'drizzle-orm';
import { db } from '../../db/index.js';

function rows<T>(result: unknown): T[] {
  return ((result as any).rows ?? result ?? []) as T[];
}

export type AnalyticsQuery = { from?: Date; to?: Date; offset: number; limit: number };

export class AnalyticsRepository {
  async counts(urlId: string, query: AnalyticsQuery) {
    const [row] = rows<{ total_clicks: number; clicks_today: number; clicks_last_7_days: number; clicks_last_30_days: number }>(
      await db.execute(sql`
        SELECT
          count(*)::int AS total_clicks,
          count(*) FILTER (WHERE clicked_at >= date_trunc('day', now()))::int AS clicks_today,
          count(*) FILTER (WHERE clicked_at >= now() - interval '7 days')::int AS clicks_last_7_days,
          count(*) FILTER (WHERE clicked_at >= now() - interval '30 days')::int AS clicks_last_30_days
        FROM url_clicks
        WHERE url_id = ${urlId}
          AND (${query.from ?? null}::timestamptz IS NULL OR clicked_at >= ${query.from ?? null})
          AND (${query.to ?? null}::timestamptz IS NULL OR clicked_at <= ${query.to ?? null})
      `),
    );
    return row ?? { total_clicks: 0, clicks_today: 0, clicks_last_7_days: 0, clicks_last_30_days: 0 };
  }

  async top(urlId: string, field: 'referrer' | 'country', query: AnalyticsQuery) {
    return rows<{ key: string; count: number }>(
      await db.execute(sql`
        SELECT coalesce(${sql.identifier(field)}, 'Unknown') AS key, count(*)::int AS count
        FROM url_clicks
        WHERE url_id = ${urlId}
          AND (${query.from ?? null}::timestamptz IS NULL OR clicked_at >= ${query.from ?? null})
          AND (${query.to ?? null}::timestamptz IS NULL OR clicked_at <= ${query.to ?? null})
        GROUP BY key
        ORDER BY count DESC
        LIMIT 10
      `),
    );
  }

  async recentClicks(urlId: string, query: AnalyticsQuery) {
    return rows<{ id: string; clicked_at: Date; referrer: string | null; country: string | null; user_agent: string | null }>(
      await db.execute(sql`
        SELECT id, clicked_at, referrer, country, user_agent
        FROM url_clicks
        WHERE url_id = ${urlId}
          AND (${query.from ?? null}::timestamptz IS NULL OR clicked_at >= ${query.from ?? null})
          AND (${query.to ?? null}::timestamptz IS NULL OR clicked_at <= ${query.to ?? null})
        ORDER BY clicked_at DESC
        LIMIT ${query.limit}
        OFFSET ${query.offset}
      `),
    );
  }
}
