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
RUN turbo prune @igniter/middleman --docker

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
COPY --from=builder /app/out/full/apps/middleman/drizzle.config.ts ./apps/middleman/drizzle.config.ts
COPY --from=builder /app/out/full/apps/middleman/drizzle/ ./apps/middleman/drizzle/
COPY --from=builder /app/out/full/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@igniter/middleman

# ------------------------------
# Production runtime (runner)
# ------------------------------
FROM base AS runner

WORKDIR /app

# Install drizzle-kit and related dependencies as production dependencies (as root)
RUN pnpm add drizzle-kit@0.30.4 drizzle-orm@0.39.1 pg@^8.14.0 dotenv --prod

# Create non-root user and switch
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

# Copy final build output
COPY --from=installer --chown=nextjs:nodejs /app/apps/middleman/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/middleman/.next/static ./apps/middleman/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/middleman/public ./apps/middleman/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/middleman/drizzle.config.ts ./apps/middleman/drizzle.config.ts
COPY --from=installer --chown=nextjs:nodejs /app/apps/middleman/drizzle/ ./apps/middleman/drizzle/
COPY --from=installer --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

CMD node apps/middleman/server.js
