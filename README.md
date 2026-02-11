# Lilypad X (Kermit) 🐸

> *"It's not easy being green... but it is easy managing containers!"*

Web front-end for Docker containers

## Build

```bash
docker build \
  --build-arg REACT_APP_CONTAINER_TAG=org.domain.review.name \
  --build-arg REACT_APP_CONTAINER_DESC=org.domain.review.desc \
  --build-arg REACT_APP_CONTAINER_ICON=org.domain.review.icon \
  --build-arg REACT_APP_LAUNCH_URL=org.domain.review.url \
  -t lilypad:latest .
```

## Run

### Interface

```bash
docker run -it -P -v /var/run/docker.sock:/var/run/docker.sock lilypad:latest
```

### Containers

```bash
for i in red yellow green; \
  docker run --platform linux/amd64 -P -d \
    -l org.domain.review.desc="$i branch feature" \
    -l org.domain.review.name=whoami \
    -l org.domain.review.icon=smile \
    -l org.domain.review.url=https://$i.local/ containous/whoami
```
