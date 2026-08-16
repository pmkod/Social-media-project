# Backend Microservices — Social Media Project

Ce backend suit une architecture microservices identique à celle du projet Ecommerce.

## Stack Technique

- **Runtime** : Bun
- **Framework HTTP & OpenAPI** : Hono + `@hono/zod-openapi` + `@scalar/hono-api-reference`
- **ORM & DB** : Prisma 7 + `@prisma/adapter-pg` + PostgreSQL
- **Gateway** : Custom Bun + Hono API Gateway (`backend/gateway`)
- **Authentification** : Centralisée dans la Gateway. Transmise aux microservices via l'en-tête `X-Authenticated-User-Id`.

## Services

- **API Gateway** (`backend/gateway` - Port `8000`) : Routage des requêtes publiques, validation des JWT et proxying.
- **User Service** (`backend/services/user` - Port `8001`) : Authentification et profil utilisateur.
- **Content Service** (`backend/services/content` - Port `8002`) : Publications (posts), commentaires, likes de posts et likes de commentaires.

## Démarrage rapide

1. **Créer les bases de données PostgreSQL** :

```sql
CREATE DATABASE social_media_project_user;
CREATE DATABASE social_media_project_content;
```

2. **Copier les fichiers d'environnement** :

```bash
cp backend/gateway/.env.example backend/gateway/.env
cp backend/services/user/.env.example backend/services/user/.env
cp backend/services/content/.env.example backend/services/content/.env
```

3. **Appliquer les schémas Prisma** :

```bash
cd backend/services/user
bunx prisma db push

cd backend/services/content
bunx prisma db push
```

4. **Démarrer les services avec le script unifié** :

```bash
cd backend
./start-dev.sh
```

## Documentation des APIs (Scalar)

Chaque service propose une interface interactive de documentation :

- **User Service** : `http://localhost:8001/scalar`
- **Content Service** : `http://localhost:8002/scalar`
- **API Gateway (Public)** : `http://localhost:8000`

## Points de terminaison principaux (via la Gateway)

| Endpoint | Service | Auth requise |
| --- | --- | --- |
| `POST /authentication/signup` | user | Non |
| `POST /authentication/complete-signup` | user | Non |
| `POST /authentication/login` | user | Non |
| `POST /authentication/complete-login` | user | Non |
| `POST /authentication/user-verification` | user | Non |
| `POST /authentication/resend-user-verification-code` | user | Non |
| `POST /authentication/password-reset` | user | Non |
| `POST /authentication/new-password` | user | Non |
| `POST /authentication/refresh-token` | user | Non |
| `POST /authentication/logout` | user | Oui |
| `GET /users/me` | user | Oui |
| `GET /users/{userId}` | user | Non |
| `PUT /users/me` | user | Oui |
| `POST /posts` | content | Oui |
| `GET /feed/following` | content | Non |
| `GET /posts/{id}` | content | Non |
| `PUT /posts/{id}` | content | Oui |
| `DELETE /posts/{id}` | content | Oui |
| `POST /posts/{postId}/comments` | content | Oui |
| `GET /posts/{postId}/comments` | content | Non |
| `DELETE /comments/{id}` | content | Oui |
| `POST /posts/{postId}/likes` | content | Oui |
| `DELETE /posts/{postId}/likes` | content | Oui |
| `GET /posts/{postId}/likes` | content | Non |
| `POST /comments/{commentId}/likes` | content | Oui |
| `DELETE /comments/{commentId}/likes` | content | Oui |
| `GET /comments/{commentId}/likes` | content | Non |
