# Backend Agent Guide — Social Media Microservices

Ce document est partagé entre tous les agents travaillant sur le backend. Il décrit l'architecture, les conventions et les choix techniques validés.

## Architecture

- **Style** : microservices
- **Services actuels** : `authentication-service`, `user-service`, `content-service`
- **Gateway** : Kong (exposition publique unifiée)
- **Communication inter-service** : HTTP/REST classique (JSON)
- **Base de données** : PostgreSQL, **une base par service**
- **Conteneurisation** : Docker + docker-compose

## Stack technique

| Couche | Outil |
|--------|-------|
| Runtime | Bun |
| Framework API | Hono + `@hono/zod-openapi` |
| Validation | Zod |
| ORM | Prisma ORM |
| DB | PostgreSQL |
| Gateway | Kong |
| Inter-service | HTTP/REST classique (`fetch`) |
| Auth | JWT stateless |
| Hash | bcrypt |
| IDs | UUID v7 (`uuidv7` npm) |
| Lint/format | Biome |

## Organisation d'un service

```
services/<service-name>/
├── src/
│   ├── index.ts                              # bootstrap Hono + gRPC
│   ├── config/                               # env, variables
│   ├── db/                                   # client Prisma singleton
│   ├── errors/                               # handlers et classes d'erreur
│   ├── clients/                              # clients HTTP inter-service
│   ├── middleware/                           # auth, errors, cors, etc.
│   └── features/<feature>/
│       ├── routes/                           # une route par fichier
│       ├── schemas/                          # Zod schemas
│       ├── services/                         # logique métier (optionnel, voir conventions)
│       └── types/                            # types TypeScript
├── prisma/
│   ├── schema.prisma                         # schéma Prisma
│   └── migrations/                           # générées par Prisma Migrate
├── clients/                                  # clients HTTP inter-service
├── Dockerfile
├── package.json
├── tsconfig.json
├── biome.json
└── .env.example
```

## Conventions de code

- **Une route par fichier** dans `features/<feature>/routes/`. Exemple : `signup.route.ts`.
- Les routes utilisent `createRoute` + `defineOpenAPIRoute` de `@hono/zod-openapi`.
- Les noms de fichiers sont en **kebab-case**.
- Les imports utilisent l'alias `@/*` → `./src/*`.
- **Organisation sans `features/`** pour `authentication-service` et `user-service` (routes/schemas/services/constants/functions à plat sous `src/`).
- **Organisation feature-based** uniquement pour `content-service`.
- Les erreurs HTTP retournent le format :
  ```json
  { "success": false, "error": { "code": "...", "message": "...", "details?": {} } }
  ```
- **Logique métier dans les routes** : la logique d'une route doit vivre directement dans le fichier route (`features/<feature>/routes/`). Pas de service séparé pour encapsuler une logique qui n'est utilisée que par cette route.
- **Services uniquement si partagés** : le dossier `services/` est réservé aux logiques réutilisées par **plusieurs routes** ou appelées par **d'autres services**. Si la logique n'est pas partagée, elle reste dans la route.
- Pas de partage de code métier entre services. Seuls les contrats OpenAPI et ce fichier sont partagés.

## Variables d'environnement standardisées

| Variable | Description |
|----------|-------------|
| `PORT` | Port HTTP du service (ex: 8081) |
| `DATABASE_URL` | URL PostgreSQL du service |
| `JWT_SECRET` | Clé secrète partagée pour signer et vérifier les JWT |
| `JWT_ACCESS_EXPIRATION` | Durée de vie d'un access token (ex: 15m) |
| `JWT_REFRESH_EXPIRATION` | Durée de vie d'un refresh token (ex: 7d) |
| `NODE_ENV` | development / production |

## Ports réservés (dev local)

| Service | HTTP | PostgreSQL |
|---------|------|------------|
| authentication-service | 8081 | 54321 |
| user-service | 8082 | 54322 |
| content-service | 8083 | 54324 |
| Kong Gateway | 8000 (proxy) / 8001 (admin) | — | — |
| Zookeeper | — | — | 2181 |

## Routes Kong publiques

| Préfixe Kong | Service cible |
|--------------|---------------|
| `/authentication/*` | authentication-service:8081 |
| `/users/*` | user-service:8082 |
| `/posts/*` | content-service:8083 |

## Authentification

La vérification des JWT est effectuée au niveau de **Kong**, pas dans les services protégés.

- Le plugin custom `jwt-auth` (`backend/kong/plugins/jwt-auth`) vérifie la signature HS256, l'issuer (`iss`) et l'expiration du token, puis forward l'identifiant utilisateur dans le header `X-User-Id`.
- `authentication-service` émet des tokens avec `iss: "social-media-app"`.
- `user-service` et `content-service` ne possèdent plus de middleware d'authentification. Les routes protégées lisent simplement le header `X-User-Id` injecté par Kong.

## Endpoints internes partagés

Les communications inter-service passent par HTTP/REST. Les endpoints internes ne sont pas exposés publiquement par Kong.

Aucun endpoint interne d'authentification n'est requis : Kong valide les JWT directement via le plugin `jwt-auth`.

## Commandes utiles

```bash
# Démarrer toute l'infrastructure Docker
cd backend && docker compose up -d

# Démarrer un service en dev (depuis le dossier du service)
cd backend/services/<service> && bun run dev

# Générer le client Prisma et appliquer les migrations
cd backend/services/<service> && bun run db:generate
cd backend/services/<service> && bun run db:migrate

# Type check
cd backend/services/<service> && bunx tsc --noEmit

# Linter / formatter
cd backend/services/<service> && bun run check
```

## Principes microservices

1. **Database-per-service** : chaque service possède sa propre base.
2. **API Gateway** : le client (frontend) ne parle qu'à Kong.
3. **Inter-service synchrone** : HTTP/REST classique pour les lectures/validations synchrones.
4. **Inter-service asynchrone** : Kafka sera ajouté plus tard pour les événements.
5. **Pas de partage de tables** entre services ; utiliser les APIs REST/HTTP.

## Évolutions prévues

- Kafka pour les events (`UserCreated`, `PostCreated`).
- Refresh tokens avec rotation.
- Upload médias.
- Tests unitaires et E2E.
