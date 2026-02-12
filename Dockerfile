ARG IMAGE_REGISTRY
ARG IMAGE_GROUP

FROM ${IMAGE_REGISTRY}/${IMAGE_GROUP}/tyrell/node:24-alpine AS deps

# Build args for Vite environment variables
ARG VITE_CONTAINER_TAG
ARG VITE_CONTAINER_DESC
ARG VITE_CONTAINER_ICON
ARG VITE_LAUNCH_URL

# Set environment variables
ENV NODE_ENV=production
ARG NEXUS_REPOSITORY_NPM

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /lilypad

# Configure npm registry if needed
RUN npm config set strict-ssl false && npm config set registry ${NEXUS_REPOSITORY_NPM}

# Copy workspace configuration files first (for layer caching)
COPY pnpm-workspace.yaml package.json turbo.json ./

# Copy shared packages
COPY packages/ ./packages/

# Copy package manifests (for dependency installation layer caching)
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

# Install all dependencies using pnpm workspace
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build web app using Turborepo (builds web, ensures proper ordering)
RUN pnpm turbo run build --filter=@lilypad/web

# Create build directory in API and copy web build output
RUN mkdir -p apps/api/build && cp -r apps/web/build/* apps/api/build/

# Install production dependencies for API only
RUN pnpm install --prod --filter=@lilypad/api

FROM ${IMAGE_REGISTRY}/${IMAGE_GROUP}/tyrell/node:24-alpine AS release
WORKDIR /lilypad

# Copy only the API app with built assets
COPY --from=deps /lilypad/apps/api .

# Expose the API port
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]
