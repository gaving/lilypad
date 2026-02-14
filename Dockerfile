# Dockerfile for Lilypad - Modern Docker container management
FROM node:25-alpine AS deps

# Build args for Vite environment variables
ARG VITE_CONTAINER_TAG=org.domain.review.name
ARG VITE_CONTAINER_DESC=org.domain.review.desc
ARG VITE_CONTAINER_ICON=org.domain.review.icon
ARG VITE_LAUNCH_URL=org.domain.review.url

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

FROM node:25-alpine AS release
WORKDIR /lilypad

ENV NODE_ENV=production
ENV DOCKER_SOCK=http://unix:/var/run/docker.sock:
ENV CONTAINER_TAG=org.domain.review.name

# Copy the workspace configuration and node_modules
COPY --from=deps /lilypad/package.json /lilypad/pnpm-workspace.yaml ./
COPY --from=deps /lilypad/node_modules ./node_modules

# Copy API app with build output
COPY --from=deps /lilypad/apps/api ./apps/api

# Expose the API port
EXPOSE 8888

# Start the server from project root so node_modules can be resolved
CMD ["node", "apps/api/build/server.js"]
