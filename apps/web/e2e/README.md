# E2E Testing Guide

This project includes comprehensive end-to-end (E2E) testing using Playwright with Docker-in-Docker (DIND).

## Overview

The E2E tests:
- Run against a real Lilypad instance
- Use actual Docker containers as test data
- Test all user interactions including bulk actions
- Generate HTML reports and screenshots on failure

## Test Structure

```
apps/web/e2e/
├── dashboard.spec.ts    # Dashboard loading and display tests
├── actions.spec.ts      # Container action tests (start/stop/remove)
├── bulk.spec.ts         # Bulk action tests
└── README.md           # This file
```

## Running E2E Tests

### Prerequisites

- Docker running locally
- pnpm installed
- Playwright browsers installed

### Option 1: Automated Script (Recommended)

```bash
# Run the automated test script
./scripts/run-e2e-tests.sh
```

This script will:
1. Start Lilypad container
2. Create test containers
3. Run E2E tests
4. Clean up automatically

### Option 2: Manual Setup

```bash
# 1. Start Lilypad
docker run -d \
  --name lilypad-e2e \
  -p 8888:8888 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/gaving/lilypad:latest

# 2. Seed test containers
docker run -d \
  --name test-api \
  -p 8081:80 \
  -l org.domain.review.name=test-api \
  -l org.domain.review.desc="Test API" \
  nginx:alpine

# 3. Run tests
cd apps/web
LILYPAD_URL=http://localhost:8888 pnpm exec playwright test -c playwright.e2e.config.ts

# 4. Clean up
docker stop lilypad-e2e test-api
docker rm lilypad-e2e test-api
```

## Test Coverage

### Dashboard Tests
- ✓ Page loads with Lilypad branding
- ✓ Displays test containers
- ✓ Stats show correct counts
- ✓ Status indicators work
- ✓ Container details can be expanded

### Action Tests
- ✓ Stop running containers
- ✓ Start stopped containers
- ✓ Remove containers
- ✓ Action buttons disabled in read-only mode

### Bulk Action Tests
- ✓ Select multiple containers
- ✓ Bulk action bar shows correct count
- ✓ Bulk stop containers
- ✓ Clear button deselects all
- ✓ Select all link works per section

## GitHub Actions CI

The E2E tests run automatically on:
- Push to `master`
- Pull requests to `master`

See `.github/workflows/e2e.yml` for configuration.

## Test Data

Tests automatically create:
- `test-api-1` - API server (nginx)
- `test-web-1` - Web app (nginx)
- `test-db-1` - Database (postgres)

## Debugging Failed Tests

When tests fail, Playwright generates:
- Screenshots in `apps/web/e2e-screenshots/`
- HTML report in `apps/web/playwright-report/`
- Traces in `apps/web/test-results/`

View the HTML report:
```bash
cd apps/web
pnpm exec playwright show-report
```

## Adding New Tests

1. Create a new `.spec.ts` file in `apps/web/e2e/`
2. Import from `@playwright/test`
3. Use `data-testid` attributes for element selection
4. Run tests with: `pnpm exec playwright test -c playwright.e2e.config.ts`

## Data Attributes

The app includes these `data-testid` attributes for reliable testing:
- `container-card` - Individual container cards
- `container-checkbox` - Selection checkboxes
- `status-dot` - Status indicators
- `edit-mode-toggle` - Edit mode button
- `dark-mode-toggle` - Dark mode button

## CI Artifacts

On GitHub Actions, failed tests upload:
- `playwright-report/` - Full HTML report
- `test-screenshots/` - Screenshots and videos
