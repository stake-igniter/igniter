FROM node:22-slim AS base

ARG APP

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
COPY out/middleman-workflows/json .

# Install dependencies for the app
RUN pnpm install

# Copy the remaining application files
COPY out/middleman-workflows/full .

WORKDIR /app/apps/middleman-workflows

# Start the development server
CMD ["pnpm", "run", "dev"]
