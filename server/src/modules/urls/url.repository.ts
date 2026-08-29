import { count, desc, eq } from 'drizzle-orm';
import type { DatabaseError } from 'pg';
import { db, urls } from '../../db/index.js';

export type UrlRow = typeof urls.$inferSelect;
export type CreateUrl = Pick<UrlRow, 'originalUrl' | 'shortCode' | 'expiresAt'>;

export class ShortCodeCollisionError extends Error {
  constructor(shortCode: string) {
    super(`Short code already exists: ${shortCode}`);
    this.name = 'ShortCodeCollisionError';
  }
}

function isUniqueShortCodeViolation(error: unknown) {
  const pgError = error as Partial<DatabaseError> | undefined;
  return pgError?.code === '23505' && pgError.constraint === 'urls_short_code_unique';
}

export class UrlRepository {
  async create(data: CreateUrl) {
    try {
      const [url] = await db.insert(urls).values(data).returning();
      return url!;
    } catch (error) {
      if (isUniqueShortCodeViolation(error)) throw new ShortCodeCollisionError(data.shortCode);
      throw error;
    }
  }

  findByShortCode(shortCode: string) {
    return db
      .select()
      .from(urls)
      .where(eq(urls.shortCode, shortCode))
      .then((r) => r[0]);
  }

  findById(id: string) {
    return db
      .select()
      .from(urls)
      .where(eq(urls.id, id))
      .then((r) => r[0]);
  }

  async list(page = 1, limit = 20) {
    const [items, totalRows] = await Promise.all([
      db
        .select()
        .from(urls)
        .orderBy(desc(urls.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(urls),
    ]);
    const total = totalRows[0]?.total ?? 0;
    return { items, page, pageSize: limit, total, hasMore: page * limit < total };
  }

  update(id: string, data: Partial<Pick<UrlRow, 'originalUrl' | 'expiresAt' | 'isActive'>>) {
    return db
      .update(urls)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(urls.id, id))
      .returning()
      .then((r) => r[0]);
  }

  async delete(id: string) {
    await db.delete(urls).where(eq(urls.id, id));
  }

  setActive(id: string, isActive: boolean) {
    return db
      .update(urls)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(urls.id, id))
      .returning()
      .then((r) => r[0]);
  }
}
