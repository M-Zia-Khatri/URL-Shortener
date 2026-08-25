import { sql } from 'drizzle-orm';
import { boolean, check, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const urls = pgTable(
  'urls',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    originalUrl: text('original_url').notNull(),
    shortCode: varchar('short_code', { length: 16 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('urls_short_code_unique').on(t.shortCode),
    index('urls_expires_at_idx').on(t.expiresAt),
    check('urls_original_url_http_check', sql`${t.originalUrl} ~* '^https?://'`),
    check('urls_short_code_not_blank_check', sql`length(trim(${t.shortCode})) > 0`),
    check('urls_updated_after_created_check', sql`${t.updatedAt} >= ${t.createdAt}`),
  ],
);
