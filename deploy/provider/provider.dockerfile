FROM node:22-alpine AS base

ARG POSTGRES_URL

ENV HOSTNAME="0.0.0.0"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g corepack@latest
RUN corepack enable

# ------------------------------
# Prune the monorepo using turbo
# ------------------------------
FROM base AS builder

# See: https://github.com/nodejs/docker-node/issues/1612
RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app
RUN pnpm install turbo@2.3.4 --global
COPY .. .
RUN turbo prune @igniter/provider --docker

# ------------------------------
# Install deps and build project
# ------------------------------
FROM base AS installer

RUN apk update && apk add --no-cache libc6-compat git openssh

WORKDIR /app

# Copy the lockfile explicitly
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy pruned monorepo
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/out/full/apps/provider/drizzle.config.ts ./apps/provider/drizzle.config.ts
COPY --from=builder /app/out/full/apps/provider/drizzle/ ./apps/provider/drizzle/
COPY --from=builder /app/out/full/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@igniter/provider


# ------------------------------
# Production runtime
# ------------------------------
FROM base AS runner

WORKDIR /app

# Install drizzle-kit and related dependencies as production dependencies (as root)
RUN pnpm add drizzle-kit@0.30.4 drizzle-orm@0.39.1 pg@^8.14.0 dotenv --prod

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy final output
COPY --from=installer --chown=nextjs:nodejs /app/apps/provider/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/provider/.next/static ./apps/provider/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/provider/drizzle.config.ts ./apps/provider/drizzle.config.ts
COPY --from=installer --chown=nextjs:nodejs /app/apps/provider/drizzle/ ./apps/provider/drizzle/
COPY --from=installer --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

CMD node apps/provider/server.js
