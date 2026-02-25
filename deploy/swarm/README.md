# Multi-Node Swarm Deployment

This directory contains Docker Swarm service definitions for running Lilypad across multiple nodes with a unified view of all containers.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Swarm Cluster                         │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Manager   │  │  Worker-1   │  │  Worker-2   │         │
│  │             │  │             │  │             │         │
│  │  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │         │
│  │  │Proxy  │  │  │  │Proxy  │  │  │  │Proxy  │  │         │
│  │  │:2375  │  │  │  │:2375  │  │  │  │:2375  │  │         │
│  │  └───┬───┘  │  │  └───┬───┘  │  │  └───┬───┘  │         │
│  │      │      │  │      │      │  │      │      │         │
│  │  ┌───▼───┐  │  │  ┌───▼───┐  │  │  ┌───▼───┐  │         │
│  │  │Docker │  │  │  │Docker │  │  │  │Docker │  │         │
│  │  │Socket │  │  │  │Socket │  │  │  │Socket │  │         │
│  │  └───────┘  │  │  └───────┘  │  │  └───────┘  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┴────────────────┘                 │
│                          │                                  │
│              ┌───────────▼────────────┐                     │
│              │      Lilypad           │                     │
│              │  (Single Instance)     │                     │
│              │                        │                     │
│              │  Queries all 4 nodes   │                     │
│              │  via HTTP to proxies   │                     │
│              └───────────┬────────────┘                     │
│                          │                                  │
│              ┌───────────▼────────────┐                     │
│              │       Traefik          │                     │
│              │  lilypad.mycorp.local  │                     │
│              └────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

## How It Works

1. **Docker Socket Proxy** runs as a **global service** (one instance per node)
   - Exposes restricted Docker API over HTTP on port 2375
   - Mounts local `/var/run/docker.sock`
   - Restricts permissions (containers, images, volumes, networks only)

2. **Lilypad** runs as a **single service** (one instance total)
   - Queries all proxy endpoints via HTTP
   - Merges responses from all nodes
   - Injects `Node` field to identify which server each container is on
   - Serves unified web UI via Traefik

## Prerequisites

- Docker Swarm cluster with 2+ nodes
- Docker 20.10+ with Swarm mode enabled
- Traefik 2.x deployed as reverse proxy
- Hostname resolution between nodes (DNS or /etc/hosts)

## Quick Start

### 1. Deploy Docker Socket Proxy

```bash
# Copy and edit environment file
cp .env.example .env
# Edit .env and set DOCKER_ENDPOINTS to your node hostnames

docker stack deploy -c docker-socket-proxy.yml swarm
```

This creates a global service running on every node in your Swarm.

### 2. Deploy Lilypad

```bash
# Ensure traefik-public network exists
docker network create --driver=overlay --attachable traefik-public

# Deploy Lilypad
docker stack deploy -c lilypad.yml swarm
```

### 3. Access Lilypad

Open your browser to `http://lilypad.mycorp.local` (or whatever you configured in `.env`)

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DOCKER_ENDPOINTS` | Yes | - | Comma-separated list of proxy URLs |
| `LILYPAD_HOST` | Yes | `lilypad.localhost` | Hostname for Traefik routing |
| `NAMESPACE` | No | `org.domain.review` | Container label prefix |

### Docker Socket Proxy Permissions

The proxy is configured with these permissions:

**Enabled:**
- ✅ Container management (start, stop, restart, delete, logs, stats)
- ✅ Image listing (read-only)
- ✅ Volume operations
- ✅ Network operations
- ✅ System info

**Disabled (security):**
- ❌ Swarm management (services, tasks, nodes)
- ❌ Docker build
- ❌ Secrets management
- ❌ Plugin management

## Security Considerations

1. **Network Isolation**: The docker-socket-proxy binds to port 2375 on the host network interface. Ensure this port is not exposed externally.

2. **Internal Communication**: All proxy traffic should occur over your internal network. Use firewall rules if needed.

3. **Label Filtering**: Lilypad only shows containers with the configured namespace label (e.g., `org.domain.review.name`).

## Troubleshooting

### Check Proxy Status

```bash
# View proxy logs from all nodes
docker service logs swarm_docker-socket-proxy

# Check proxy on specific node
curl http://<node-hostname>:2375/containers/json?all=true
```

### Check Lilypad Logs

```bash
docker service logs swarm_lilypad
```

### Health Check Endpoint

Lilypad exposes a health endpoint showing node connectivity:

```bash
curl http://lilypad.mycorp.local/api/health
```

## Upgrading

```bash
# Pull latest images
docker pull tecnativa/docker-socket-proxy:latest
docker pull ghcr.io/gaving/lilypad:latest

# Update services
docker service update --force swarm_docker-socket-proxy
docker service update --force swarm_lilypad
```

## Removing

```bash
docker stack rm swarm
```

## See Also

- [Lilypad Main README](../../README.md)
- [Docker Socket Proxy Documentation](https://github.com/Tecnativa/docker-socket-proxy)
