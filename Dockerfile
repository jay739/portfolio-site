# 1. Install dependencies in an isolated stage
FROM node:22-alpine AS deps

# Upgrade all Alpine packages first to patch known CVEs (harfbuzz, openssl, etc.)
RUN apk upgrade --no-cache

# Install system dependencies for sharp and other native modules
RUN apk add --no-cache \
    vips-dev \
    build-base \
    python3 \
    git

# 2. Set working directory
WORKDIR /app

ENV HUSKY=0

# 3. Copy only dependency manifests first
COPY package*.json ./

# Install dependencies with a deterministic lockfile-based install
RUN npm pkg delete scripts.postinstall && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --legacy-peer-deps --no-audit --no-fund

# 4. Build the Next.js app from an explicit, minimal source set
FROM deps AS builder

WORKDIR /app

COPY src ./src
COPY public ./public
COPY content ./content
COPY scripts ./scripts
COPY package*.json ./
COPY next.config.js ./
COPY next-env.d.ts ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.scripts.json ./
COPY sentry.edge.config.ts ./
COPY sentry.server.config.ts ./
COPY .eslintrc.json ./

# 5. Build arguments for Next.js public env vars
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}

# 6. Build the Next.js app with memory optimization
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# 6b. Self-contained sharp: install on a plain base with NO vips-dev, so sharp
# fetches its prebuilt binary (with libvips bundled in) rather than building
# against a system libvips that won't exist in the runner. Just sharp + deps.
FROM node:22-alpine AS sharp
WORKDIR /sharp
RUN npm init -y >/dev/null 2>&1 && npm install sharp@0.32.6 --no-audit --no-fund

# 7. Production image with only runtime artifacts
FROM node:22-alpine AS runner
WORKDIR /app

# Create a non-root user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Upgrade all Alpine packages to patch CVEs (openssl, wget, harfbuzz)
RUN apk upgrade --no-cache

# Install runtime dependencies for sharp (no wget — healthcheck uses Node)
RUN apk add --no-cache vips


# Copy runtime artifacts from the builder, written directly as the non-root user.
# COPY --chown sets ownership in the same layer, so there's no separate
# `chown -R` step duplicating every file into a second layer.
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appgroup /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/src/rag ./src/rag
COPY --from=builder --chown=appuser:appgroup /app/content/blog ./content/blog

# Next 15 traces sharp into .next/standalone, but that binary was linked against
# the builder's system libvips (absent here) -> fails to load. Replace it with the
# self-contained prebuilt from the `sharp` stage (libvips bundled, no host dep).
RUN rm -rf node_modules/sharp
COPY --from=sharp --chown=appuser:appgroup /sharp/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Switch to the non-root user
USER appuser

# Healthcheck using Node.js built-in HTTP — no wget dependency
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start the application
CMD ["node", "server.js"]
