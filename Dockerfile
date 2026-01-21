# 1. Use official Node.js image
FROM node:18-alpine AS builder

# Install system dependencies for sharp and other native modules
RUN apk add --no-cache \
    vips-dev \
    build-base \
    python3

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 4. Copy the rest of your code
COPY . .

# 5. Build arguments for Next.js public env vars
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}

# 6. Build the Next.js app with memory optimization
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# 7. Production image, copy built assets and install only production deps
FROM node:18-alpine AS runner
WORKDIR /app

# Create a non-root user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install wget for health check and runtime dependencies for sharp
RUN apk add --no-cache wget vips

# Copy necessary files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set permissions for the non-root user
RUN chown -R appuser:appgroup /app

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Switch to the non-root user
USER appuser

# Add a healthcheck to ensure the container is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]
