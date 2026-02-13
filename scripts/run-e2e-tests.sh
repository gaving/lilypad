#!/bin/bash

# E2E Test Runner Script
#
# This script sets up the full E2E testing environment locally:
# 1. Starts Lilypad container
# 2. Seeds test containers
# 3. Runs Playwright E2E tests
# 4. Cleans up

set -e

echo "🧪 Starting E2E Test Environment"
echo ""

# Configuration
LILYPAD_PORT=${LILYPAD_PORT:-8888}
LILYPAD_URL="http://localhost:${LILYPAD_PORT}"

echo "Step 1: Starting Lilypad..."
docker run -d \
	--name lilypad-e2e-local \
	-p ${LILYPAD_PORT}:8888 \
	-v /var/run/docker.sock:/var/run/docker.sock \
	-e NODE_ENV=production \
	-e CONTAINER_TAG=org.domain.review.name \
	ghcr.io/gaving/lilypad:latest

echo "Waiting for Lilypad to be ready..."
for i in {1..30}; do
	if curl -s ${LILYPAD_URL} >/dev/null 2>&1; then
		echo "✓ Lilypad is ready!"
		break
	fi
	echo "  Waiting... ($i/30)"
	sleep 2
done

echo ""
echo "Step 2: Seeding test containers..."
docker run -d \
	--name test-api-e2e \
	-p 9081:80 \
	-l org.domain.review.name=test-api-e2e \
	-l org.domain.review.desc="Test API Server" \
	-l org.domain.review.icon=rocket \
	nginx:alpine

docker run -d \
	--name test-web-e2e \
	-p 9082:80 \
	-l org.domain.review.name=test-web-e2e \
	-l org.domain.review.desc="Test Web App" \
	-l org.domain.review.icon=globe \
	nginx:alpine

docker run -d \
	--name test-db-e2e \
	-p 25432:5432 \
	-e POSTGRES_PASSWORD=test \
	-l org.domain.review.name=test-db-e2e \
	-l org.domain.review.desc="Test Database" \
	-l org.domain.review.icon=database \
	postgres:15-alpine

echo "✓ Test containers created"
echo ""

echo "Step 3: Running E2E tests..."
cd apps/web
LILYPAD_URL=${LILYPAD_URL} pnpm exec playwright test -c playwright.e2e.config.ts
TEST_EXIT_CODE=$?
cd ../..

echo ""
echo "Step 4: Cleanup..."
docker stop lilypad-e2e-local test-api-e2e test-web-e2e test-db-e2e 2>/dev/null || true
docker rm lilypad-e2e-local test-api-e2e test-web-e2e test-db-e2e 2>/dev/null || true

if [ $TEST_EXIT_CODE -eq 0 ]; then
	echo ""
	echo "✅ All E2E tests passed!"
else
	echo ""
	echo "❌ Some tests failed"
fi

exit $TEST_EXIT_CODE
