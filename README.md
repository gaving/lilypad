# Lilypad X 🌸

[![Version](https://img.shields.io/badge/version-10.0.0-blue.svg)](https://github.com/anomalyco/lilypad)
[![Node.js](https://img.shields.io/badge/node-24.x-green.svg)](https://nodejs.org/)
[![Turborepo](https://img.shields.io/badge/turborepo-2.x-purple.svg)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-10.x-orange.svg)](https://pnpm.io/)

> *"It's not easy being green... but it is easy managing containers!"*

A modern, fast web interface for managing Docker containers with real-time updates, dark mode support, and a beautiful cherry blossom theme.

## ✨ Features

- 🚀 **Lightning Fast** - Built with Vite, Turborepo, and pnpm
- 🎨 **Modern UI** - Cherry blossom theme with dark mode
- 🐳 **Docker Native** - Direct Docker socket integration
- ⚡ **Real-time Updates** - Live container status with auto-refresh
- 🏷️ **Label-based** - Manages containers with `org.domain.review.name` label
- 📱 **Responsive** - Works on desktop and mobile
- 📦 **Bulk Actions** - Select and manage multiple containers at once

## 📸 Screenshots

### Desktop

| Light Mode | Dark Mode | Bulk Actions |
|------------|-----------|--------------|
| ![Dashboard Light](screenshots/dashboard-light.png?v=2) | ![Dashboard Dark](screenshots/dashboard-dark.png?v=2) | ![Bulk Actions](screenshots/bulk-actions.png?v=2) |

### Responsive

| Mobile (375x812) | Tablet (768x1024) |
|------------------|-------------------|
| ![Mobile](screenshots/dashboard-mobile.png?v=2) | ![Tablet](screenshots/dashboard-tablet.png?v=2) |

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Open http://localhost:3000
```

See [docs/SETUP.md](./docs/SETUP.md) for detailed setup instructions.

## 🐳 Docker

### Run from GitHub Container Registry (Recommended)

```bash
# Pull and run latest version
docker run -d \
  -p 8080:8888 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name lilypad \
  ghcr.io/gaving/lilypad:latest

# Or run specific version
docker run -d \
  -p 8080:8888 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name lilypad \
  ghcr.io/gaving/lilypad:v10.0.0
```

Available tags:
- `ghcr.io/gaving/lilypad:latest` - Latest stable
- `ghcr.io/gaving/lilypad:v10.0.0` - Version 10
- `ghcr.io/gaving/lilypad:X` - Version X

### Build from Source

```bash
# Build locally
docker build -t lilypad .

# Run locally
docker run -d \
  -p 8080:8888 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  lilypad
```

See [AGENTS.md](./AGENTS.md) for Docker configuration details.

## 🏷️ Container Labels

Lilypad discovers containers using Docker labels:

| Label | Description | Required |
|-------|-------------|----------|
| `org.domain.review.name` | App identifier | ✅ Yes |
| `org.domain.review.desc` | Description | ❌ No |
| `org.domain.review.icon` | Emoji icon | ❌ No |
| `org.domain.review.url` | Launch URL | ❌ No |

```bash
docker run -d \
  -l org.domain.review.name=my-app \
  -l org.domain.review.desc="My Application" \
  -l org.domain.review.icon=rocket \
  nginx:alpine
```

See [docs/LABELS.md](./docs/LABELS.md) for more examples.

## 📚 Documentation

- [Setup Guide](./docs/SETUP.md) - Installation and development
- [Labels](./docs/LABELS.md) - Container label system
- [Scripts](./docs/SCRIPTS.md) - Available npm/pnpm scripts
- [AGENTS.md](./AGENTS.md) - Full technical documentation

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, Blueprint.js
- **Backend:** Express 5, Node.js 24
- **Build:** Turborepo, pnpm
- **Linting:** Biome

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Push and open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>🌸 Lilypad - Making container management beautiful!</strong>
</p>
