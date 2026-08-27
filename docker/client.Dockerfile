# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN corepack pnpm install --frozen-lockfile

FROM deps AS build
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
COPY client ./client
RUN corepack pnpm --filter client build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
