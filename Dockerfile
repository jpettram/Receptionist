
FROM node:19-alpine

WORKDIR /app

ADD . /app

CMD node server.js
