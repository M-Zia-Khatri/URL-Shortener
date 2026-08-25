import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { urls } from './urls.js';

// Click rows are dependent analytics data, so deleting a URL cascades to its clicks.
export const urlClicks = pgTable(
  'url_clicks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id').notNull(),
    urlId: uuid('url_id')
      .notNull()
      .references(() => urls.id, { onDelete: 'cascade' }),
    clickedAt: timestamp('clicked_at', { withTimezone: true }).notNull().defaultNow(),
    referrer: text('referrer'),
    userAgent: text('user_agent'),
    country: text('country'),
  },
  (t) => [
    uniqueIndex('url_clicks_event_id_unique').on(t.eventId),
    index('url_clicks_url_id_idx').on(t.urlId),
    index('url_clicks_clicked_at_idx').on(t.clickedAt),
    index('url_clicks_url_id_clicked_at_idx').on(t.urlId, t.clickedAt),
  ],
);
