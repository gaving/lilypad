# Lilypad

[![Release][release-image]][releases] [![License][license-image]][license] [![Pipeline][pipeline-image]][pipeline]

This repository contains a review front-end for Docker containers.

![](https://git.spnet.local/harlaw/lilypad/uploads/ce85a31f18f7ce8839d90153ae5b2655/image.png)

## Building

```
docker build \
  --build-arg REACT_APP_CONTAINER_TAG=uk.pnn.police.scotland.review.name \
  --build-arg REACT_APP_CONTAINER_DESC=uk.pnn.police.scotland.review.desc \
  --build-arg REACT_APP_LAUNCH_PORT=uk.pnn.police.scotland.review.port \
  -t lilypad:latest .
```

## Running

### Lilypad

```
docker run -it -P -v /var/run/docker.sock:/var/run/docker.sock lilypad:latest
```

### Containers

```
docker run -P -l uk.pnn.police.scotland.review.desc="green branch feature" -l uk.pnn.police.scotland.review.name=greenbg containous/whoami
docker run -P -l uk.pnn.police.scotland.review.desc="yellow branch feature" -l uk.pnn.police.scotland.review.name=yellowbg containous/whoami
```

## Copyright

Copyright (c) 2020 Police Scotland.

[release-image]: https://img.shields.io/badge/release-master-orange.svg?style=flat
[releases]: /../container_registry
[license-image]: https://img.shields.io/badge/license-police%20scotland-blue.svg
[license]: http://www.apache.org/licenses/LICENSE-2.0
[pipeline-image]: /../badges/master/pipeline.svg
[pipeline]: /../pipelines
