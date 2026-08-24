import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  CLIENT_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  NEGATIVE_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(30),
  BLOCK_PRIVATE_URLS: z.coerce.boolean().default(true),
  TRUST_PROXY: z.coerce.boolean().default(false),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_CREATE: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_REDIRECT: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_MANAGEMENT: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_ANALYTICS: z.coerce.number().int().positive().default(120),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
