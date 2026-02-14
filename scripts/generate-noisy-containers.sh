#!/bin/bash

# Generate Noisy Test Containers
#
# This script creates multiple containers that generate logs continuously
# Useful for testing log viewing performance and the refresh button
#
# Usage: ./scripts/generate-noisy-containers.sh [count]
# Default count: 5

set -e

COUNT=${1:-5}
NAMESPACE=${NAMESPACE:-org.domain.review}

echo "🐳 Generating $COUNT noisy test containers..."
echo "   Namespace: $NAMESPACE"
echo ""

for i in $(seq 1 $COUNT); do
	CONTAINER_NAME="noisy-test-$i"

	# Check if container already exists
	if docker ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
		echo "  ⚠️  $CONTAINER_NAME already exists, skipping..."
		continue
	fi

	echo "  🚀 Starting $CONTAINER_NAME..."

	# Create a container that generates logs continuously
	docker run -d \
		--name "$CONTAINER_NAME" \
		--label "${NAMESPACE}.name=$CONTAINER_NAME" \
		--label "${NAMESPACE}.desc=Noisy Test Container $i" \
		--label "${NAMESPACE}.icon= speaker" \
		--label "${NAMESPACE}.url=http://localhost:999$i" \
		alpine:latest \
		sh -c '
            i=0
            while true; do
                echo "[$(date "+%Y-%m-%d %H:%M:%S")] Log entry $i - This is a test log message with some random data: $RANDOM"
                i=$((i + 1))
                sleep 0.5
            done
        ' >/dev/null 2>&1

	echo "  ✅ $CONTAINER_NAME started"
done

echo ""
echo "✅ Created $COUNT noisy containers!"
echo ""
echo "To view logs:"
echo "  1. Open Lilypad at http://localhost:8888"
echo "  2. Expand any container"
echo "  3. Click the refresh button to see new logs"
echo ""
echo "To clean up:"
echo "  docker stop $(docker ps -q --filter "name=noisy-test-") 2>/dev/null || true"
echo "  docker rm $(docker ps -aq --filter "name=noisy-test-") 2>/dev/null || true"
