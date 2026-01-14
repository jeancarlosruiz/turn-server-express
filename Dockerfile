# Multi-stage build for TURN server with Express API

# Stage 1: Build TypeScript application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Production image with coturn
FROM node:18-alpine

# Install coturn and dependencies
RUN apk add --no-cache \
    coturn \
    curl \
    bash \
    sed

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy coturn configuration
COPY turnserver.conf /etc/turnserver.conf

# Copy start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Create necessary directories
RUN mkdir -p /var/log /var/lib/turn

# Expose ports
# 3000 - Express API (Railway lo expone automáticamente)
# 3478 - TURN server (UDP/TCP)
# 5349 - TURN server (TLS)
# 50000-50100 - TURN relay ports range (optimizado para Railway)
EXPOSE 3000 3478 5349 50000-50100/udp 50000-50100/tcp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV TURN_PORT=3478
ENV TURN_TLS_PORT=5349

# Start services
CMD ["/start.sh"]
