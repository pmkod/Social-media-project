# Report service

Microservice de signalement des posts, commentaires et utilisateurs. Il écoute sur le port `8003` par défaut et utilise sa propre base PostgreSQL.

## Routes publiques via la gateway

- `GET /report-reasons` : raisons actives utilisables par le frontend.
- `POST /reports` : crée un signalement authentifié.
- `GET /reports/my` : liste les signalements de l'utilisateur authentifié.

## Routes internes de modération

- `GET /internal/reports`
- `PATCH /internal/reports/{reportId}/status`
- `GET /internal/report-reasons`
- `POST /internal/report-reasons`
- `PATCH /internal/report-reasons/{reasonId}`

Les routes `/internal` ne sont volontairement pas exposées par la gateway tant qu'un rôle administrateur n'est pas disponible.

## Installation

```bash
cp .env.example .env
bun install
bunx prisma migrate dev
bun run dev
```
