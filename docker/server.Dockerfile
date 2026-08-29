# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN corepack pnpm install --frozen-lockfile

FROM deps AS build
COPY server ./server
COPY client ./client
RUN corepack pnpm --filter server build

FROM base AS runtime
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json server/package.json
RUN corepack pnpm install --frozen-lockfile --prod --filter server
COPY --from=build /app/server/dist ./server/dist
WORKDIR /app/server
CMD ["node", "dist/server.js"]
