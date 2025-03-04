
# Build stage to handle the dist files
FROM node:lts-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage, ready for deployment
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY --from=build /usr/src/app/dist .

EXPOSE 8080

CMD ["node", "main.js"]