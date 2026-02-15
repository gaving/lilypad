# Dockerfile for Lilypad - Container management in full bloom (Bun version)
FROM oven/bun:alpine AS builder

WORKDIR /lilypad

# Copy workspace configuration files first (for layer caching)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package manifests
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

# Install dependencies using bun
# Bun reads package.json and installs to node_modules
RUN cd apps/api && bun install

# Copy source code
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# Build web app
RUN cd apps/web && bun run build

# Copy web build output
RUN mkdir -p apps/api/public && cp -r apps/web/build/* apps/api/public/

# Production stage - minimal image with Bun
FROM oven/bun:alpine AS release

WORKDIR /lilypad

ENV NODE_ENV=production
ENV DOCKER_SOCK=http://unix:/var/run/docker.sock:
ENV NAMESPACE=org.domain.review

# Copy package.json for production install
COPY --from=builder /lilypad/apps/api/package.json ./

# Copy source files
COPY --from=builder /lilypad/apps/api/server.ts ./server.ts
COPY --from=builder /lilypad/apps/api/routes ./routes
COPY --from=builder /lilypad/apps/api/utils ./utils
COPY --from=builder /lilypad/apps/api/public ./public

# Install only production dependencies
RUN bun install --production

# Expose the API port
EXPOSE 8888

# Start the server with Bun (TypeScript runs natively!)
CMD ["bun", "run", "server.ts"]
