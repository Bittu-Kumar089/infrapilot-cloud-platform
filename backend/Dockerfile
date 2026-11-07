FROM docker:cli AS dockercli

FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ansible-core ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=dockercli /usr/local/bin/docker /usr/local/bin/docker

COPY package*.json ./

RUN npm ci --omit=dev

COPY server.js ./

EXPOSE 5000

CMD ["npm", "start"]
