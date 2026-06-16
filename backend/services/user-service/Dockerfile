FROM oven/bun:1-slim

WORKDIR /app

COPY package.json tsconfig.json biome.json drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src ./src

RUN bun install --production

EXPOSE 8002

CMD ["bun", "src/index.ts"]
