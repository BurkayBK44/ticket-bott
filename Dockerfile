FROM node:20-slim

RUN npm install -g pnpm

WORKDIR /app

# pnpm workspace dosyalarını kopyala
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY artifacts/discord-bot/package.json ./artifacts/discord-bot/
COPY lib/ ./lib/ 2>/dev/null || true

# Bağımlılıkları yükle
RUN pnpm install --frozen-lockfile --filter @workspace/discord-bot...

# Bot kodunu kopyala
COPY artifacts/discord-bot/ ./artifacts/discord-bot/

WORKDIR /app/artifacts/discord-bot

CMD ["pnpm", "run", "start"]
