# Lilypad

```
docker build --build-arg REACT_APP_CONTAINER_TAG=uk.pnn.police.scotland.review.name --build-arg REACT_APP_CONTAINER_DESC=uk.pnn.police.scotland.review.desc -t lilypad:latest .
```

```
docker run -it -P -v /var/run/docker.sock:/var/run/docker.sock lilypad:latest
```

```
docker run -P -l uk.pnn.police.scotland.review.desc="green branch feature" -l uk.pnn.police.scotland.review.name=greenbg containous/whoami
```
