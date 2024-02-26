FROM node:20-alpine as build

ARG NODE_AUTH_TOKEN 
ARG VERSION

WORKDIR /usr/src/app
COPY package*.json ./
COPY . .

RUN echo "$VERSION" >> version.txt

RUN npm i
RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

RUN deluser --remove-home node && adduser -D -h /usr/src/app -u 2000 node
USER node

COPY --chown=node:node package*.json ./
RUN npm i --production
RUN npm install pm2 -g

COPY --from=build --chown=node:node /usr/src/app/lib ./lib
COPY --from=build --chown=node:node /usr/src/app/src ./src
COPY --from=build --chown=node:node /usr/src/app/config ./config
COPY --from=build --chown=node:node /usr/src/app/docs ./docs
COPY --from=build --chown=node:node /usr/src/app/version.txt ./version.txt
COPY --from=build --chown=node:node /usr/src/app/tsoa.json ./tsoa.json
COPY --from=build --chown=node:node /usr/src/app/migrations ./migrations
COPY --from=build --chown=node:node /usr/src/app/sequelizerc.js ./sequelizerc.js

EXPOSE 3800
EXPOSE 3801

CMD ["pm2-runtime", "app.js"]