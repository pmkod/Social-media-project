FROM oven/bun:1-slim

WORKDIR /app

COPY package.json tsconfig.json biome.json ./
COPY prisma ./prisma
COPY src ./src

RUN bun install --production

EXPOSE 8083

CMD ["bun", "src/index.ts"]
