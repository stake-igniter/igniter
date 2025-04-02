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

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@igniter/middleman


# ------------------------------
# Production runtime
# ------------------------------
FROM base AS runner

WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy final output
COPY --from=installer --chown=nextjs:nodejs /app/apps/middleman/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/middleman/.next/static ./apps/middleman/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/middleman/public ./apps/middleman/public

CMD node apps/middleman/server.js
