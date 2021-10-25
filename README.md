# Lilypad

[![Release][release-image]][releases] [![License][license-image]][license] [![Pipeline][pipeline-image]][pipeline]

This repository contains a review front-end for Docker containers.

![app](https://git.spnet.local/harlaw/lilypad/uploads/3ecfbe5452b7d9e98c43e1543f11459d/image.png)

## Building

```bash
docker build \
  --build-arg REACT_APP_CONTAINER_TAG=uk.pnn.police.scotland.review.name \
  --build-arg REACT_APP_CONTAINER_DESC=uk.pnn.police.scotland.review.desc \
  --build-arg REACT_APP_CONTAINER_ICON=uk.pnn.police.scotland.review.icon \
  --build-arg REACT_APP_LAUNCH_URL=uk.pnn.police.scotland.review.url \
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
  -l uk.pnn.police.scotland.review.name=greenbg \
  -l uk.pnn.police.scotland.review.desc="green branch feature" \
  -l uk.pnn.police.scotland.review.url=3000 \
  -l uk.pnn.police.scotland.review.icon=smile \
    containous/whoami
```

```bash
docker run -P \
  -l uk.pnn.police.scotland.review.name=yellowbg \
  -l uk.pnn.police.scotland.review.desc="yellow branch feature" \
  -l uk.pnn.police.scotland.review.url=81 \
  -l uk.pnn.police.scotland.review.icon=tongue \
    containous/whoami
```

## Copyright

Copyright (c) 2020 Police Scotland.

[release-image]: https://img.shields.io/badge/release-master-orange.svg?style=flat
[releases]: /../container_registry
[license-image]: https://img.shields.io/badge/license-police%20scotland-blue.svg
[license]: http://www.apache.org/licenses/LICENSE-2.0
[pipeline-image]: /../badges/master/pipeline.svg
[pipeline]: /../pipelines
