# URL Shortener

A no-auth URL shortener with Fastify, PostgreSQL, Redis Streams, Drizzle, and React.

## Setup
Copy `.env.example` to `.env`, then run `pnpm install` and `docker compose up`. The client is at http://localhost:5173, API documentation is at http://localhost:3000/docs, and health is at `/health`.

## Environment
`DATABASE_URL`, `REDIS_URL`, `PORT`, `CLIENT_URL`, `NODE_ENV`, `PUBLIC_BASE_URL`, `CACHE_TTL_SECONDS`, and the three `RATE_LIMIT_*` values are documented in `.env.example`.

## Commands
- `pnpm dev` — run the client and API locally.
- `pnpm build` — typecheck and build all workspaces.
- `pnpm test` — run tests.
- `pnpm --filter server worker` — run the Redis Streams analytics worker.

## API
`POST /api/urls`, `GET /api/urls`, `GET/PATCH/DELETE /api/urls/:id`, `GET /api/urls/:id/analytics`, and `GET /:code` are exposed. Browse the generated docs at `/docs`.
