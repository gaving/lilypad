# Lilypad X (Kermit) 🐸

[![Version](https://img.shields.io/badge/version-X-blue.svg)](https://github.com/gaving/lilypad)
[![Node.js](https://img.shields.io/badge/node-24.x-green.svg)](https://nodejs.org/)
[![Turborepo](https://img.shields.io/badge/turborepo-2.x-purple.svg)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange.svg)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-ISC-yellow.svg)](LICENSE)

> *"It's not easy being green... but it is easy managing containers!"*

A modern, fast web interface for managing Docker containers with real-time updates, dark mode support, and a beautiful dashboard UI.

![Lilypad X Screenshot](https://via.placeholder.com/800x400/0f9960/ffffff?text=Lilypad+X+Dashboard)

## ✨ Features

- 🚀 **Lightning Fast** - Built with Vite, Turborepo, and pnpm for maximum performance
- 🎨 **Modern UI** - Clean dashboard with stats cards, status indicators, and smooth animations
- 🌓 **Dark Mode** - Full dark theme support with CSS variables
- 🐳 **Docker Native** - Direct Docker socket integration for real-time container management
- ⚡ **Real-time Updates** - Live container status with auto-refresh
- 🏷️ **Label-based Filtering** - Organize containers with custom labels
- 📱 **Responsive** - Works on desktop and mobile devices

## 🏗️ Architecture

Lilypad X uses a modern monorepo architecture:

```
lilypad/
├── apps/
│   ├── web/          # React + Vite frontend (@lilypad/web)
│   └── api/          # Express API server (@lilypad/api)
├── packages/
│   └── config/       # Shared tooling configuration
├── turbo.json        # Build orchestration
└── pnpm-workspace.yaml
```

**Tech Stack:**
- **Frontend:** React 18, Vite 7, Blueprint.js 6, Styled Components
- **Backend:** Express 4, Node.js 24 LTS
- **Build:** Turborepo 2.x, pnpm 9.x
- **Linting:** Biome 2.x

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 24.x LTS or higher
- [pnpm](https://pnpm.io/) 9.x or higher
- [Docker](https://www.docker.com/) (for running the app)

**OR** use [Nix](https://nixos.org/) (recommended) - provides everything automatically

### 🧰 Using Nix (Recommended)

If you have Nix installed with flakes enabled:

```bash
# Enter development shell
nix develop

# Or with direnv (automatic when entering directory)
direnv allow
```

This provides:
- Node.js 24 LTS
- pnpm 9.x
- All required tools

Then skip to Step 2 in Installation below.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gaving/lilypad.git
   cd lilypad
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Create `.env` files in each app:

   **apps/web/.env.development:**
   ```env
   VITE_CONTAINER_TAG=org.domain.review.name
   VITE_CONTAINER_DESC=org.domain.review.desc
   VITE_CONTAINER_ICON=org.domain.review.icon
   VITE_LAUNCH_URL=org.domain.review.url
   ```

   **apps/api/.env:**
   ```env
   # Optional: customize as needed
   NODE_ENV=development
   PORT=4000
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

   This starts both servers concurrently:
   - 🌐 **Web app**: http://localhost:3000 (Vite dev server with hot reload)
   - 🔌 **API server**: http://localhost:4000 (Express backend)

   **Access the app at http://localhost:3000** - Vite will proxy API requests to port 4000 automatically.

## 🐳 Docker

### Build

```bash
docker build \
  --build-arg VITE_CONTAINER_TAG=org.domain.review.name \
  --build-arg VITE_CONTAINER_DESC=org.domain.review.desc \
  --build-arg VITE_CONTAINER_ICON=org.domain.review.icon \
  --build-arg VITE_LAUNCH_URL=org.domain.review.url \
  -t lilypad:latest .
```

Or use the npm script:
```bash
pnpm docker:build
```

### Run

```bash
docker run -it \
  -p 4000:4000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  lilypad:latest
```

Or use the npm script:
```bash
pnpm docker:run
```

The app will be available at http://localhost:4000

## 🏷️ Container Labels

Lilypad discovers containers using Docker labels. Add these labels to your containers:

| Label | Description | Example |
|-------|-------------|---------|
| `org.domain.review.name` | App name (required) | `my-app` |
| `org.domain.review.desc` | Description shown in UI | `My Application` |
| `org.domain.review.icon` | Emoji icon | `:heart:` or `rocket` |
| `org.domain.review.url` | URL to open when clicked | `https://myapp.local` |

### Quick Test with Script

We provide a handy script to generate test containers:

```bash
# Generate 5 test containers with random names and emojis
./scripts/generate-test-containers.sh

# Generate 10 containers
./scripts/generate-test-containers.sh -c 10

# Check status of test containers
./scripts/generate-test-containers.sh --status

# Clean up all test containers
./scripts/generate-test-containers.sh --cleanup
```

### Example (Manual)

```bash
docker run -d \
  -p 8080:80 \
  -l org.domain.review.name=my-app \
  -l org.domain.review.desc="My Application" \
  -l org.domain.review.icon=rocket \
  -l org.domain.review.url=http://localhost:8080 \
  nginx:alpine
```

## 🛠️ Development

### Available Scripts

```bash
# Install dependencies
pnpm install

# Start development (runs both web and api)
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format all code
pnpm format

# Clean build artifacts
pnpm clean

# Docker build
pnpm docker:build

# Docker run
pnpm docker:run
```

### Workspace Commands

```bash
# Run command in specific app
pnpm --filter @lilypad/web dev
pnpm --filter @lilypad/api dev

# Build specific app
pnpm --filter @lilypad/web build

# Add dependency to specific app
pnpm --filter @lilypad/web add axios
```

### Project Structure

```
lilypad/
├── apps/
│   ├── web/                 # Frontend application
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── App.jsx      # Main app component
│   │   │   └── index.jsx    # Entry point
│   │   ├── index.html       # HTML template
│   │   └── vite.config.js   # Vite configuration
│   └── api/                 # Backend API
│       ├── routes/          # API routes
│       ├── server.js        # Express server
│       └── package.json
├── packages/
│   └── config/              # Shared configuration
│       ├── biome.json       # Linting config
│       └── package.json
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # Workspace config
├── turbo.json               # Turborepo config
└── Dockerfile               # Production build
```

## 🎨 Customization

### Environment Variables

**Frontend (Vite):**
- `VITE_CONTAINER_TAG` - Label key for filtering containers
- `VITE_CONTAINER_DESC` - Label key for descriptions
- `VITE_CONTAINER_ICON` - Label key for icons
- `VITE_LAUNCH_URL` - Label key for URLs

**Backend (Express):**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 4000)

### Theming

The app supports dark mode out of the box. Toggle with the moon icon in the navbar.

## 🔧 Troubleshooting

### Common Issues

**Issue:** `pnpm install` fails
- **Solution:** Ensure you're using pnpm 9.x: `npm install -g pnpm@9`

**Issue:** Docker build fails with Node errors
- **Solution:** The Dockerfile now uses Node 24 LTS. Ensure your base images are compatible.

**Issue:** Containers not appearing
- **Solution:** Check that containers have the `org.domain.review.name` label and that `VITE_CONTAINER_TAG` matches.

**Issue:** Build fails with Turbo errors
- **Solution:** Run `pnpm clean` and try again

### Getting Help

- Check the [GitHub Issues](https://github.com/gaving/lilypad/issues)
- Review the [Turborepo documentation](https://turbo.build/repo/docs)
- Check the [pnpm documentation](https://pnpm.io/motivation)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m ':sparkles: Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please use [gitmoji](https://gitmoji.dev/) for commit messages!

## 📄 License

ISC License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

- Built with ❤️ by [gaving](https://github.com/gaving)
- Icons by [Blueprint.js](https://blueprintjs.com/)
- Emoji rendering by [react-emoji-render](https://github.com/tommoor/react-emoji-render)

---

<p align="center">
  <strong>🐸 Lilypad X - Making container management fun!</strong>
</p>
