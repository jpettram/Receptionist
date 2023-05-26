
FROM node:19-alpine

WORKDIR /app

# Copy package.json and package-lock.json separately
COPY package*.json ./

# Install dependencies
RUN npm ci --production

ADD . /app

CMD node server.js
