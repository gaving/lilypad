FROM nexus.spnet.local:8087/policescotland/tyrell/node:14-alpine3.12 AS deps

ARG REACT_APP_CONTAINER_TAG
ARG REACT_APP_CONTAINER_DESC
ARG REACT_APP_CONTAINER_ICON
ARG REACT_APP_LAUNCH_URL

ENV NODE_ENV production

WORKDIR /lilypad
COPY . .

RUN npm config set strict-ssl false && npm config set registry https://nexus.spnet.local/repository/npm-group

RUN npm install --prefix ./app --force
RUN npm run build --prefix ./app
RUN npm install --prefix ./server

FROM nexus.spnet.local:8087/policescotland/tyrell/node:14-alpine3.12 AS release
COPY --from=deps /lilypad/server ./lilypad

EXPOSE 4000
CMD ["node", "lilypad/server.js"]
