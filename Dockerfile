
# Build stage to handle the dist files
FROM node:lts-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Production stage, ready for deployment
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY --from=build /usr/src/app/prisma ./prisma

COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma

COPY --from=build /usr/src/app/dist .

EXPOSE 8080

COPY scripts/docker/entrypoint.sh ./
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
CMD []
