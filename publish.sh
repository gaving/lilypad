rm -rf build
rm -rf client/build
rm -rf server/build

export REACT_APP_CONTAINER_TAG=uk.pnn.police.scotland.review.name
export REACT_APP_CONTAINER_DESC=uk.pnn.police.scotland.review.desc

npm run build --prefix ./app

docker build --tag lilypad:$1 .

docker run -d \
    -p 8888:8888 \
    --name lilypad$1 \
    -v /var/run/docker.sock:/var/run/docker.sock lilypad:$1

docker cp server lilypad$1:/lilypad/server
docker commit lilypad$1 lilypad:$1
