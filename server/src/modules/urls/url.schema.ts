import { z } from 'zod';

export const idParams = z.object({ id: z.string().uuid() });
export const codeParams = z.object({ code: z.string().min(6).max(16) });
const createUrl = z.object({
  destination: z.string().url(),
});
export const createUrlBody = z.toJSONSchema(createUrl);
export const updateUrlBody = z
  .object({ originalUrl: z.string().min(1).optional(), expiresAt: z.union([z.coerce.date(), z.null()]).optional(), isActive: z.boolean().optional() })
  .refine((v) => Object.keys(v).length > 0);
export const listQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const urlResponse = z.object({
  id: z.string().uuid(),
  originalUrl: z.string(),
  shortCode: z.string(),
  shortUrl: z.string(),
  isActive: z.boolean(),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
});
export const successResponse = <T extends z.ZodTypeAny>(data: T) => z.object({ success: z.literal(true), data });
export const errorResponse = z.object({
  success: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }),
});
export const listUrlResponse = successResponse(
  z.object({
    items: z.array(urlResponse),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    hasMore: z.boolean(),
  }),
);
