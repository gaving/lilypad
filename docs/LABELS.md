# Container Labels

Lilypad discovers and manages containers using Docker labels.

## Required Label

Containers **must** have this label to appear in Lilypad:

```yaml
org.domain.review.name: my-app-staging
```

## Optional Labels

| Label | Purpose | Example |
|-------|---------|---------|
| `org.domain.review.desc` | Display name | `"My Application"` |
| `org.domain.review.icon` | Emoji icon | `rocket` or `:rocket:` |
| `org.domain.review.url` | Launch URL | `http://myapp.local:8080` |

## Examples

### Basic

```bash
docker run -d \
  -l org.domain.review.name=my-app \
  nginx:alpine
```

### Full Configuration

```bash
docker run -d \
  -p 8080:80 \
  -l org.domain.review.name=my-app \
  -l org.domain.review.desc="My Application" \
  -l org.domain.review.icon=rocket \
  -l org.domain.review.url=http://localhost:8080 \
  nginx:alpine
```

### Docker Compose

```yaml
services:
  my-app:
    image: nginx:alpine
    labels:
      org.domain.review.name: my-app
      org.domain.review.desc: "My Application"
      org.domain.review.icon: rocket
      org.domain.review.url: http://localhost:8080
```

## Test Script

Generate test containers:

```bash
# Generate 5 test containers
./scripts/generate-test-containers.sh

# Generate 10 containers
./scripts/generate-test-containers.sh -c 10

# Check status
./scripts/generate-test-containers.sh --status

# Clean up
./scripts/generate-test-containers.sh --cleanup
```
