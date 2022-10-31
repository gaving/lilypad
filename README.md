# Lilypad

[![Release][release-image]][releases] [![License][license-image]][license] [![Pipeline][pipeline-image]][pipeline]

This repository contains a review front-end for Docker containers.

![app](https://git.spnet.local/harlaw/lilypad/uploads/f2a983d270f16f3fd247ceedd1c707cb/45UCHdz.png)

## Building

```bash
docker build \
  --build-arg REACT_APP_CONTAINER_TAG=org.domain.review.name \
  --build-arg REACT_APP_CONTAINER_DESC=org.domain.review.desc \
  --build-arg REACT_APP_CONTAINER_ICON=org.domain.review.icon \
  --build-arg REACT_APP_LAUNCH_URL=org.domain.review.url \
  -t lilypad:latest .
```

## Running

### App

```bash
docker run -it -P -v /var/run/docker.sock:/var/run/docker.sock lilypad:latest
```

### Containers

```bash
docker run -P \
  -l org.domain.review.name=greenbg \
  -l org.domain.review.desc="green branch feature" \
  -l org.domain.review.url=3000 \
  -l org.domain.review.icon=smile \
    containous/whoami
```

```bash
docker run -P \
  -l org.domain.review.name=yellowbg \
  -l org.domain.review.desc="yellow branch feature" \
  -l org.domain.review.url=81 \
  -l org.domain.review.icon=tongue \
    containous/whoami
```

## Copyright

Copyright (c) 2021 Gavin Gilmour.

[release-image]: https://img.shields.io/badge/release-master-orange.svg?style=flat
[releases]: /../container_registry
[license-image]: https://img.shields.io/badge/license-police%20scotland-blue.svg
[license]: http://www.apache.org/licenses/LICENSE-2.0
[pipeline-image]: /../badges/master/pipeline.svg
[pipeline]: /../pipelines
