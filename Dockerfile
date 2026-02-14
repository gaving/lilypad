# Dockerfile for Lilypad - Container management in full bloom
# Build stage
FROM node:25-alpine AS builder

# Install pnpm and turbo
RUN npm install -g pnpm@10 turbo

WORKDIR /lilypad

# Copy workspace configuration files first (for layer caching)
COPY pnpm-workspace.yaml package.json turbo.json pnpm-lock.yaml ./

# Copy shared packages
COPY packages/ ./packages/

# Copy package manifests (for dependency installation layer caching)
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

# Install all dependencies using pnpm workspace
RUN pnpm install

# Copy source code
COPY . .

# Build web app using Turborepo (builds web, ensures proper ordering)
RUN pnpm turbo run build --filter=@lilypad/web

# Build API TypeScript
RUN cd apps/api && pnpm run build

# Create build directory in API and copy web build output to public subdirectory
RUN mkdir -p apps/api/build/public && cp -r apps/web/build/* apps/api/build/public/

# Production stage - minimal image
FROM node:25-alpine AS release

WORKDIR /lilypad

# Install pnpm temporarily
RUN npm install -g pnpm@10

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy the built API
COPY --from=builder /lilypad/apps/api/build ./apps/api/build

# Copy only API package.json (not web)
COPY apps/api/package.json ./apps/api/

# Copy packages (for workspace resolution)
COPY --from=builder /lilypad/packages ./packages

# Install only production dependencies for API and clean up
RUN pnpm install --prod --filter=@lilypad/api && \
    npm uninstall -g pnpm && \
    rm -rf /root/.npm /root/.pnpm-store

ENV NODE_ENV=production
ENV DOCKER_SOCK=http://unix:/var/run/docker.sock:
ENV NAMESPACE=org.domain.review

# Expose the API port
EXPOSE 8888

# Start the server
CMD ["node", "apps/api/build/server.js"]
