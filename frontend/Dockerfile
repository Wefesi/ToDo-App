FROM ds-remote-docker-dev-pb.bas-common.dspace.de/node:22.23-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM ds-remote-docker-dev-pb.bas-common.dspace.de/node:22.23-slim AS runtime
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY server.mjs ./server.mjs

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.mjs"]
