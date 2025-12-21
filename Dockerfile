# Use Bun's official image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock* /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Build the application
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Build assets (CSS and JS)
RUN bun run build:assets

# Run database migrations
# Note: This will create the database if it doesn't exist
RUN bun run db:generate

# Final production image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/src ./src
COPY --from=build /app/package.json .
COPY --from=build /app/drizzle.config.ts .
COPY --from=build /app/bunfig.toml* .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Set default environment variables
# Note: Fly.io secrets will override these at runtime
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --eval "fetch('http://localhost:3000').then(r => r.ok ? process.exit(0) : process.exit(1))" || exit 1

# Run migrations and start the server
CMD ["sh", "-c", "bun run db:migrate && bun run start"]

