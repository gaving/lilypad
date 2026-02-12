#!/bin/bash

# Lilypad X Test Container Generator
# Generates Docker containers with random names and emojis for testing

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Array of emojis - using GitHub/Slack compatible shortcodes
EMOJIS=(
	"rocket" "fire" "star" "heart" "zap" "bulb" "hammer"
	"bug" "tada" "sparkles" "trophy" "medal"
	"coffee" "pizza"
	"computer" "keyboard" "desktop_computer" "floppy_disk"
	"book" "memo" "calendar" "date"
	"phone" "email" "package" "gift"
	"car" "taxi" "bus" "train" "airplane"
	"house" "building" "bank" "hospital"
	"tree" "herb" "cactus"
	"dog" "cat" "rabbit" "fox"
	"sun" "moon" "cloud" "sunny" "partly_sunny"
	"anchor" "ship"
	"basketball" "football" "tennis"
	"guitar" "microphone" "headphones"
	"camera" "video_camera" "movie_camera"
	"lock" "unlock" "key"
	"wrench" "gear"
	"smile" "sunglasses" "wink"
)

# Array of app names
APP_NAMES=(
	"frontend" "backend" "api" "database" "cache"
	"worker" "scheduler" "queue" "gateway" "proxy"
	"auth" "users" "payments" "notifications" "analytics"
	"logging" "monitoring" "metrics" "search" "storage"
	"webhook" "email" "sms" "push" "websocket"
	"cdn" "dns" "loadbalancer" "firewall" "vpn"
	"ml" "ai" "training" "inference" "pipeline"
	"cms" "blog" "shop" "cart" "checkout"
	"inventory" "shipping" "tracking" "support" "chat"
	"docs" "wiki" "help" "faq" "sitemap"
)

# Array of environments
ENVS=("dev" "staging" "prod" "test" "demo")

# Function to generate random container
generate_container() {
	local idx=$1
	local app_name=${APP_NAMES[$RANDOM % ${#APP_NAMES[@]}]}
	local env=${ENVS[$RANDOM % ${#ENVS[@]}]}
	local emoji=${EMOJIS[$RANDOM % ${#EMOJIS[@]}]}
	local random_id=$(openssl rand -hex 4)

	local container_name="${app_name}-${env}-${random_id}"
	local description="$(echo "${app_name}" | awk '{print toupper(substr($0,1,1))substr($0,2)}') ${env} environment"
	local url="http://${app_name}-${env}.local:${idx}"

	echo -e "${BLUE}Creating:${NC} ${YELLOW}${container_name}${NC} with emoji :${emoji}:"

	docker run -d \
		--name "${container_name}" \
		--label "org.domain.review.name=${container_name}" \
		--label "org.domain.review.desc=${description}" \
		--label "org.domain.review.icon=${emoji}" \
		--label "org.domain.review.url=${url}" \
		-p ${idx} \
		nginx:alpine >/dev/null 2>&1

	if [ $? -eq 0 ]; then
		echo -e "${GREEN}✓ Created successfully${NC}"
	else
		echo -e "\033[0;31m✗ Failed to create${NC}"
	fi
}

# Function to cleanup all test containers
cleanup_containers() {
	echo -e "\n${YELLOW}Cleaning up test containers...${NC}"

	# Find and remove all containers with our labels
	local containers=$(docker ps -aq --filter "label=org.domain.review.name" 2>/dev/null)

	if [ -n "$containers" ]; then
		echo "$containers" | xargs -r docker rm -f >/dev/null 2>&1
		echo -e "${GREEN}✓ Cleaned up all test containers${NC}"
	else
		echo -e "${BLUE}No test containers found${NC}"
	fi
}

# Function to show status
show_status() {
	echo -e "\n${BLUE}Current test containers:${NC}"
	docker ps --filter "label=org.domain.review.name" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No containers running"
}

# Main script
main() {
	echo -e "${GREEN}🐸 Lilypad X Test Container Generator${NC}\n"

	# Check if Docker is running
	if ! docker info >/dev/null 2>&1; then
		echo -e "\033[0;31mError: Docker is not running${NC}"
		exit 1
	fi

	# Parse arguments
	local count=5
	local cleanup=false
	local status=false

	while [[ $# -gt 0 ]]; do
		case $1 in
		-c | --count)
			count="$2"
			shift 2
			;;
		--cleanup)
			cleanup=true
			shift
			;;
		--status)
			status=true
			shift
			;;
		-h | --help)
			echo "Usage: $0 [OPTIONS]"
			echo ""
			echo "Options:"
			echo "  -c, --count N     Generate N containers (default: 5)"
			echo "  --cleanup         Remove all test containers"
			echo "  --status          Show status of test containers"
			echo "  -h, --help        Show this help message"
			echo ""
			echo "Examples:"
			echo "  $0                    # Generate 5 test containers"
			echo "  $0 -c 10              # Generate 10 test containers"
			echo "  $0 --cleanup          # Remove all test containers"
			echo "  $0 --status           # Show container status"
			exit 0
			;;
		*)
			echo "Unknown option: $1"
			echo "Use -h or --help for usage"
			exit 1
			;;
		esac
	done

	# Handle cleanup
	if [ "$cleanup" = true ]; then
		cleanup_containers
		exit 0
	fi

	# Handle status
	if [ "$status" = true ]; then
		show_status
		exit 0
	fi

	# Generate containers
	echo -e "Generating ${YELLOW}${count}${NC} test containers...\n"

	# Use port range starting from 8080
	local base_port=8080

	for i in $(seq 1 $count); do
		local port=$((base_port + i))
		generate_container $port
		sleep 0.1
	done

	echo -e "\n${GREEN}✓ Generated ${count} test containers!${NC}"
	echo -e "\n${BLUE}Access Lilypad X at:${NC} http://localhost:3000"
	echo -e "${BLUE}View containers:${NC} $0 --status"
	echo -e "${BLUE}Cleanup:${NC} $0 --cleanup"
}

main "$@"
