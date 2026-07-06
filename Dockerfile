FROM node:20-slim

WORKDIR /app

COPY railway-package.json ./package.json

RUN npm install

COPY artifacts/discord-bot/src ./src
COPY artifacts/discord-bot/tsconfig.json ./tsconfig.json

CMD ["node", "--import", "tsx/esm", "src/index.ts"]
