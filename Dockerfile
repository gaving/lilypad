ARG IMAGE_REGISTRY
ARG IMAGE_GROUP

FROM ${IMAGE_REGISTRY}/${IMAGE_GROUP}/tyrell/node:14-alpine3.12 AS deps

ARG REACT_APP_CONTAINER_TAG
ARG REACT_APP_CONTAINER_DESC
ARG REACT_APP_CONTAINER_ICON
ARG REACT_APP_LAUNCH_URL

ENV NODE_ENV production
ARG NEXUS_REPOSITORY_NPM

WORKDIR /lilypad
COPY . .

RUN npm config set strict-ssl false && npm config set registry ${NEXUS_REPOSITORY_NPM}

RUN npm install --prefix ./app --force
RUN npm run build --prefix ./app
RUN npm install --prefix ./server

FROM ${IMAGE_REGISTRY}/${IMAGE_GROUP}/tyrell/node:14-alpine3.12 AS release
WORKDIR /lilypad
COPY --from=deps /lilypad/server .

EXPOSE 4000
CMD ["node", "server.js"]
