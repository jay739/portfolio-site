# 1. Use official Node.js image
FROM node:18-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# 4. Copy the rest of your code
COPY . .

# 5. Build the Next.js app
RUN npm run build

# 6. Production image, copy built assets and install only production deps
FROM node:18-alpine AS runner
WORKDIR /app

# Create a non-root user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install wget for health check
RUN apk add --no-cache wget

# Copy necessary files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set permissions for the non-root user
RUN chown -R appuser:appgroup /app

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT 3000
ENV NODE_ENV production

# Switch to the non-root user
USER appuser

# Add a healthcheck to ensure the container is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]