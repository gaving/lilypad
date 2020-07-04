FROM alpine:latest

ARG REACT_APP_CONTAINER_TAG
ARG REACT_APP_CONTAINER_DESC

RUN apk update && \
    apk upgrade && \
    apk add nodejs-npm && \
    rm -rf /var/cache/apk/*

ENV NODE_ENV production

RUN mkdir -p /lilypad
ENTRYPOINT ["node", "/lilypad/server/server.js"]
