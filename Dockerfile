# Multi-stage build
FROM node:20-alpine AS base

# Build client
FROM base AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build server
FROM base AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
RUN npx prisma generate

# Production image
FROM node:20-alpine AS production
WORKDIR /app

# Install dumb-init and required libs (OpenSSL + glibc compat) for Prisma
RUN apk add --no-cache dumb-init openssl libc6-compat

# Use a consistent database path for SQLite inside the container
ENV DATABASE_URL=file:/app/data/dev.db

# Create app user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy server files
COPY --from=server-builder --chown=nodejs:nodejs /app/server ./server
COPY --from=client-builder --chown=nodejs:nodejs /app/client/dist ./server/public

# Create data directory for SQLite with proper permissions
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

# Copy startup script
COPY --chown=nodejs:nodejs start.sh /app/start.sh
RUN chmod +x /app/start.sh

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]