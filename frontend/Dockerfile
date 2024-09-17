# React app image
FROM node:20-alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY ./circuitnest/package.json .
COPY ./circuitnest/package-lock.json .

RUN npm install
