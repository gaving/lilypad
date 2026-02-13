# Lilypad - Agent Context Documentation

## Project Overview

**Lilypad** is a modern Docker container management web application with a cherry blossom (pink) theme. It provides a beautiful, responsive UI for viewing, starting, stopping, and managing Docker containers.

- **Repository**: `anomalyco/lilypad`
- **Current Branch**: `kermit`
- **Version**: 4.0.0
- **License**: UNLICENSED (private)

## Tech Stack

### Frontend (apps/web)
- **React 19.2.4** - UI framework
- **TypeScript 5.9.3** - Type safety (recently migrated from JavaScript)
- **Vite 7.3.1** - Build tool and dev server
- **Blueprint.js** - UI component library
- **Styled Components** - CSS-in-JS styling
- **date-fns** - Date formatting (replaced moment.js)
- **react-emoji-render** - Emoji display

### Backend (apps/api)
- **Node.js 24** with native ES modules
- **Express 5.1.0** - Web framework
- **got** - HTTP client for Docker API

### Build & Dev Tools
- **pnpm 9.15.0** - Package manager (workspace monorepo)
- **Turborepo 2.3.0** - Monorepo task runner
- **Biome 2.3.14** - Linting and formatting
- **Docker** - Containerization

## Project Structure

```
lilypad/
├── apps/
│   ├── web/           # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Container.tsx      # Individual container card
│   │   │   │   ├── Logs.tsx           # Container logs viewer
│   │   │   │   ├── Navbar.tsx         # Top navigation bar
│   │   │   │   └── SplashScreen.tsx   # Loading animation
│   │   │   ├── components/pages/
│   │   │   │   └── Containers.tsx    # Main page with bulk actions
│   │   │   ├── App.tsx               # Main app component
│   │   │   └── index.tsx             # Entry point
│   │   └── build/                    # Production build output
│   └── api/           # Express backend
│       ├── server.js                 # Main server file
│       └── routes/
│           ├── containers.js         # Container API endpoints
│           ├── images.js
│           ├── info.js
│           ├── networks.js
│           └── volumes.js
├── packages/
│   └── config/        # Shared configuration
├── Dockerfile         # Production container build
└── package.json      # Workspace root
```

## Key Features

1. **Container Management**: View all Docker containers with filtering by labels
2. **Real-time Stats**: CPU/memory monitoring with live updates
3. **Bulk Actions**: Select multiple containers to start/stop/remove
4. **Dark Mode**: Full dark mode support throughout the app
5. **Mobile Responsive**: Works on desktop and mobile devices
6. **Cherry Blossom Theme**: Pink accent color (#ff6b8a) throughout

## Development Setup

### Prerequisites
- Node.js >= 24.0.0
- pnpm >= 9.0.0
- Docker Desktop (for running the app)

### Local Development
```bash
# Install dependencies
pnpm install

# Run both frontend and backend in dev mode
pnpm dev

# Frontend runs on: http://localhost:3000
# Backend API on:  http://localhost:4000
```

### Build for Production
```bash
# Build web app
pnpm turbo run build --filter=@lilypad/web

# Build Docker image
docker build -t lilypad .

# Run Docker container
docker run -d -p 8080:8888 -v /var/run/docker.sock:/var/run/docker.sock lilypad
```

## Code Conventions

### TypeScript Patterns
- Use interfaces for props and state
- Functional components with hooks preferred over class components
- Use `import type` for type-only imports
- Strict type checking enabled

### Styling (Styled Components)
- Use template literals for CSS
- Support dark mode with `.bp5-dark &` selectors
- Mobile-first responsive design with `@media (max-width: 768px)`
- CSS variables for theming: `var(--card-bg)`, `var(--text-color)`

### Component Structure
```typescript
interface MyComponentProps {
  // Props here
}

interface MyComponentState {
  // State here
}

const StyledDiv = styled.div`
  // Styles here
`;

class MyComponent extends Component<MyComponentProps, MyComponentState> {
  // Component implementation
}
```

### API Endpoint Patterns
- GET `/api/containers` - List all containers (filtered by label)
- POST `/api/containers/stop` - Stop container(s)
- POST `/api/containers/start` - Start container(s)  
- DELETE `/api/containers/:id?force=true` - Remove container
- GET `/api/containers/:id/stats` - Get container stats
- GET `/api/containers/:id/logs` - Get container logs

## Environment Variables

### For Web (Vite)
- `VITE_CONTAINER_TAG=org.domain.review.name` - Label to filter containers
- `VITE_CONTAINER_DESC=org.domain.review.desc` - Description label key
- `VITE_CONTAINER_ICON=org.domain.review.icon` - Icon label key
- `VITE_LAUNCH_URL=org.domain.review.url` - URL label key

### For API
- `DOCKER_SOCK=http://unix:/var/run/docker.sock:` - Docker socket path
- `CONTAINER_TAG=org.domain.review.name` - Label filter for API
- `NODE_ENV=production` - Production mode flag

### In Dockerfile
```dockerfile
ENV NODE_ENV=production
ENV DOCKER_SOCK=http://unix:/var/run/docker.sock:
ENV CONTAINER_TAG=org.domain.review.name
```

## Container Label System

Lilypad manages containers with specific labels:

```yaml
# Required label (identifies it as a Lilypad-managed container)
org.domain.review.name: my-app-staging-abc123

# Optional labels for display
org.domain.review.desc: "My App Staging Environment"
org.domain.review.icon: "rocket"
org.domain.review.url: "http://my-app.local:8080"
```

Only containers with `org.domain.review.name` label are displayed.

## Docker Configuration

### Building
```bash
docker build -f Dockerfile -t lilypad:test .
```

### Running
```bash
# Port mapping: HOST:CONTAINER (8080:8888)
# Docker socket must be mounted for API access
docker run -d \
  -p 8080:8888 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name lilypad \
  lilypad:test
```

### Key Dockerfile Features
- Multi-stage build (deps + release)
- Uses public `node:24-alpine` image
- Copies workspace structure with node_modules
- Exposes port 8888 (production mode)
- Serves built React app + API together

## Recent Changes (TypeScript Migration)

The project was recently migrated from JavaScript to TypeScript:

### Migrated Files
- `App.jsx` → `App.tsx`
- `Container.jsx` → `Container.tsx`
- `Containers.jsx` → `Containers.tsx`
- `Logs.jsx` → `Logs.tsx`
- `index.jsx` → `index.tsx`

### Dependencies Updated
- React 18 → React 19
- Vite 6 → Vite 7
- moment → date-fns (saves ~230KB)
- Removed lodash (replaced with native ES6)
- Removed prop-types (using TypeScript)
- Added TypeScript 5.9.3 with type definitions

### Linting
- Using Biome instead of ESLint + Prettier
- Scripts: `npm run lint` (check), `npm run lint:fix` (auto-fix with --write)
- Biome v2 uses `--write` not `--apply` for fixes

## Common Issues & Solutions

### 1. Bulk Remove Fails with 409 Conflict
**Cause**: Running containers can't be removed without force flag.
**Solution**: Add `?force=true` to DELETE request or stop containers first.

### 2. Container Checkboxes Not Clickable
**Cause**: Event propagation issues with Blueprint Checkbox.
**Solution**: Use both `onClick` on container div and `onChange` on Checkbox, with `e.stopPropagation()`.

### 3. API Returns All Containers Including Lilypad
**Cause**: No server-side filtering.
**Solution**: Filter by label in API: `data.filter(c => c.Labels && CONTAINER_TAG in c.Labels)`

### 4. Docker Build Fails - lockfile
**Cause**: `pnpm install --frozen-lockfile` requires up-to-date lockfile.
**Solution**: Use `pnpm install` without frozen-lockfile in Dockerfile.

### 5. dotenv Console Spam
**Cause**: dotenv v17 outputs verbose logs.
**Solution**: Use `dotenv.config({ quiet: true })` to silence.

## Testing

### API Testing
```bash
# Test container list
curl http://localhost:8080/api/containers

# Test bulk stop
curl -X POST http://localhost:8080/api/containers/stop \
  -H "Content-Type: application/json" \
  -d '{"containerId": "abc123"}'
```

### Frontend Testing
- Manual testing via browser at http://localhost:8080
- Check both light and dark modes
- Test mobile responsiveness (Chrome DevTools)
- Verify bulk actions work with multiple containers

## Performance Optimizations

1. **Stats Polling**: Only fetches stats every 5 seconds when tab is visible
2. **Visibility API**: Pauses polling when tab is hidden
3. **Build Output**: Minified and gzipped assets
4. **Docker Layers**: Optimized layer caching in Dockerfile
5. **Tree Shaking**: Vite handles dead code elimination

## Security Notes

- Docker socket mounted as read-write (required for management)
- No authentication currently implemented
- Runs as root in container (Node.js process)
- No HTTPS in development mode

## Future Enhancements

Potential features to add:
1. Container search/filter
2. Resource usage charts
3. Container groups/projects
4. Image management
5. Volume cleanup
6. Multi-host Docker support
7. Authentication/authorization
8. WebSocket for real-time updates

## Contact & Resources

- **Repository**: https://github.com/anomalyco/lilypad
- **Issues**: https://github.com/anomalyco/lilypad/issues
- **Docker Hub**: Not published (build from source)

## Summary for Agents

When working on Lilypad:
1. **Use TypeScript** for all new components
2. **Maintain cherry blossom theme** (pink #ff6b8a accents)
3. **Test both dark and light modes**
4. **Mobile responsiveness is required**
5. **Filter containers by label** in API, not frontend
6. **Use Blueprint.js components** for UI consistency
7. **Run lint checks** before committing (`npm run lint`)
8. **Update Dockerfile** if adding new env vars
9. **Test with Docker** running to see actual containers
10. **Bulk actions** should handle edge cases (running containers need force remove)

---

*Generated for commit: kermit 9b230f1 - docs: split AGENTS.md into separate documentation files*
