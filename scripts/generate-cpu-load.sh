#!/bin/bash

# Generate CPU load in a test container to see the load indicator working

CONTAINER_NAME=${1:-"cpu-test"}

echo "Creating container with CPU load: $CONTAINER_NAME"

# Create a container that runs a CPU-intensive task
docker run -d \
	--name "$CONTAINER_NAME" \
	--label "org.domain.review.name=$CONTAINER_NAME" \
	--label "org.domain.review.desc=CPU Load Test Container" \
	--label "org.domain.review.icon=fire" \
	--label "org.domain.review.url=http://localhost:9999" \
	alpine:latest \
	sh -c 'apk add --no-cache stress-ng && stress-ng --cpu 2 --timeout 300s'

echo "Container created! It will run for 5 minutes generating CPU load."
echo "Watch the CPU indicator in Lilypad X - it should show 50-100% load."
echo ""
echo "To stop the load test: docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
