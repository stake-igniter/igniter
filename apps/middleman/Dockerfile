FROM node:22-slim AS base

ENV HOSTNAME="0.0.0.0"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install necessary tools and dependencies
RUN apt-get update && apt-get install -y \
    git \
    openssh-client \
    curl \
    && npm install -g pnpm@latest turbo@^2.4.4 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only .json and pnpm .yaml files first for efficient caching
COPY out/middleman/json .

# Install dependencies for the app
RUN pnpm install --frozen-lockfile

# Copy the remaining application files
COPY out/middleman/full .

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm turbo run build --filter=@igniter/middleman

# ------------------------------
# Production runtime (runner)
# ------------------------------
FROM base AS runner

# Install drizzle-kit and related dependencies as production dependencies (as root)
RUN pnpm add --global drizzle-kit@0.30.4 drizzle-orm@0.39.1 pg@^8.14.0 dotenv

WORKDIR /app

# Create non-root user and switch
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --gid 1001 nextjs

RUN mkdir -p /app/apps/middleman/.next/cache/fetch-cache && \
    chown -R nextjs:nodejs /app/apps/middleman/.next/cache/fetch-cache

USER nextjs

# Copy final build output
COPY --from=base --chown=nextjs:nodejs /app/apps/middleman/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/apps/middleman/.next/static ./apps/middleman/.next/static
COPY --from=base --chown=nextjs:nodejs /app/apps/middleman/public ./apps/middleman/public
COPY --from=base --chown=nextjs:nodejs /app/middleman.drizzle.config.ts ./
COPY --from=base --chown=nextjs:nodejs /app/apps/middleman/drizzle/ ./apps/middleman/drizzle/
COPY --from=base --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Start the development server
CMD ["node", "apps/middleman/server.js"]
