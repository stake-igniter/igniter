FROM node:22-bullseye-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g corepack@latest
RUN corepack enable

FROM base AS builder
RUN apt-get update
# Set working directory
WORKDIR /app
RUN pnpm install turbo@2.3.4 --global
COPY . .

RUN turbo prune @igniter/middleman-workflows --docker

FROM base AS installer
RUN apt-get update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo build

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
COPY --from=installer /app .

ENV NODE_ENV=production
CMD node apps/workflows/dist/worker.js