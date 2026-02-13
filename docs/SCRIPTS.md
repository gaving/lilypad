# Available Scripts

## Root Package.json

```bash
# Development
pnpm dev          # Start web + api concurrently
pnpm build        # Build all packages

# Code Quality
pnpm lint         # Check all packages
pnpm lint:fix     # Fix linting issues
pnpm format       # Format all code

# Docker
pnpm docker:build # Build Docker image
pnpm docker:run   # Run Docker container

# Maintenance
pnpm clean        # Clean all node_modules
```

## Workspace Commands

```bash
# Run in specific app
pnpm --filter @lilypad/web dev
pnpm --filter @lilypad/api dev

# Build specific app
pnpm --filter @lilypad/web build

# Add dependency to specific app
pnpm --filter @lilypad/web add axios
```

## Web App (apps/web)

```bash
cd apps/web

pnpm dev       # Vite dev server (port 3000)
pnpm build     # Production build
pnpm lint      # Run Biome
pnpm lint:fix  # Fix with --write
```

## API (apps/api)

```bash
cd apps/api

pnpm dev       # Express with nodemon (port 4000)
pnpm start     # Production mode
pnpm lint      # Run Biome
pnpm lint:fix  # Fix with --write
```

## Test Script

```bash
./scripts/generate-test-containers.sh
```

See [LABELS.md](./LABELS.md) for usage.
