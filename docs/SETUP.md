# Development Setup

## Prerequisites

- Node.js >= 24.0.0
- pnpm >= 9.0.0
- Docker Desktop (for running the app)

## Quick Start

```bash
# Install dependencies
pnpm install

# Run both frontend and backend in dev mode
pnpm dev

# Frontend: http://localhost:3000
# API: http://localhost:4000
```

## Available Scripts

```bash
pnpm dev        # Start development servers
pnpm build      # Build for production
pnpm lint       # Run linter
pnpm lint:fix   # Fix linting issues
pnpm format     # Format code
pnpm clean      # Clean build artifacts
pnpm docker:build  # Build Docker image
pnpm docker:run    # Run Docker container
```

## Nix (Optional)

If you have Nix with flakes:

```bash
nix develop     # Enter dev shell
direnv allow    # Auto-activate on cd
```

## Docker Build

```bash
# Build image
docker build -t lilypad .

# Run container
docker run -d -p 8080:8888 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  lilypad
```

See [DOCKER.md](./DOCKER.md) for detailed configuration.
