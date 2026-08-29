# Chat Service

Microservice HTTP pour les discussions privées et de groupe, leurs membres, les messages et les marqueurs de lecture. Il n'embarque volontairement aucun transport temps réel.

## Démarrage

```bash
cp .env.example .env
bun install
bunx prisma migrate dev
bun run dev
```

La documentation OpenAPI est disponible sur `http://localhost:8005/scalar` en développement.
