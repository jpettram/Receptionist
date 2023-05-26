
FROM node:19-alpine

WORKDIR /app

# Install dependencies
RUN npm ci --production

ADD . /app

CMD node server.js
