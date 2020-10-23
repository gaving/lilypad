FROM node:14-alpine AS deps

ARG REACT_APP_CONTAINER_TAG
ARG REACT_APP_CONTAINER_DESC
ARG REACT_APP_CONTAINER_ICON
ARG REACT_APP_LAUNCH_PORT

ENV NODE_ENV production

WORKDIR /lilypad
COPY . .

RUN npm install --prefix ./app --force
RUN npm run build --prefix ./app
RUN npm install --prefix ./server

FROM node:alpine AS release
COPY --from=deps /lilypad/server ./lilypad

EXPOSE 4000
CMD ["node", "lilypad/server.js"]
