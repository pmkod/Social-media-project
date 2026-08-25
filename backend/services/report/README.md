# Report service

Microservice de signalement des posts, commentaires et utilisateurs. Il écoute sur le port `8003` par défaut et utilise sa propre base PostgreSQL.

## Routes publiques via la gateway

- `GET /report-reasons` : raisons actives utilisables par le frontend.
- `POST /reports` : crée un signalement authentifié.

## Installation

```bash
cp .env.example .env
bun install
bunx prisma migrate dev
bun run dev
```
