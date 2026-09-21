# Backend Microservices — Social Media Project

Ce backend suit une architecture microservices identique à celle du projet Ecommerce.

## Stack Technique

- **Runtime** : Bun
- **Framework HTTP & OpenAPI** : Hono + `@hono/zod-openapi` + `@scalar/hono-api-reference`
- **ORM & DB** : Prisma 7 + `@prisma/adapter-pg` + PostgreSQL
- **Gateway** : Custom Bun + Hono API Gateway (`backend/gateway`)
- **Authentification** : Centralisée dans la Gateway. L'identité vérifiée est transmise aux microservices via les en-têtes `X-Authenticated-User-Id` et `X-Authenticated-Session-Id`.

## Services

- **API Gateway** (`backend/api-gateway` - Port `8000`) : Routage des requêtes publiques, validation centralisée des sessions et proxying.
- **User Service** (`backend/services/user` - Port `8001`) : Authentification et profil utilisateur.
- **Content Service** (`backend/services/content` - Port `8002`) : Publications (posts), commentaires, likes de posts et likes de commentaires.
- **Report Service** (`backend/services/report` - Port `8003`) : Signalements des posts, commentaires et utilisateurs, ainsi que leurs raisons.
- **Notification Service** (`backend/services/notification` - Port `8004`) : Notifications sociales groupées et état vu/non vu.
- **Chat Service** (`backend/services/chat` - Port `8005`) : Discussions privées et de groupe, membres, messages et marqueurs de lecture (HTTP uniquement, sans temps réel).
- **Session Service** (`backend/services/session` - Port `8006`) : Sessions utilisateur persistées dans Redis.

## Démarrage rapide

1. **Créer les bases de données PostgreSQL** :

```sql
CREATE DATABASE social_media_project_user;
CREATE DATABASE social_media_project_content;
CREATE DATABASE social_media_report;
CREATE DATABASE social_media_project_notification;
CREATE DATABASE social_media_project_chat;
```

2. **Copier les fichiers d'environnement** :

```bash
cp backend/gateway/.env.example backend/gateway/.env
cp backend/services/user/.env.example backend/services/user/.env
cp backend/services/content/.env.example backend/services/content/.env
cp backend/services/report/.env.example backend/services/report/.env
cp backend/services/notification/.env.example backend/services/notification/.env
cp backend/services/chat/.env.example backend/services/chat/.env
cp backend/services/session/.env.example backend/services/session/.env
```

Le Session Service nécessite aussi une instance Redis accessible via `REDIS_URL` (par défaut `redis://localhost:6379/0`).

Le Chat Service nécessite le compartiment S3/MinIO privé
`social-media-project-discussion` (configurable avec `S3_DISCUSSION_BUCKET`).

3. **Appliquer les schémas Prisma** :

```bash
cd backend/services/user
bunx prisma db push

cd backend/services/content
bunx prisma db push

cd backend/services/report
bunx prisma migrate dev

cd backend/services/notification
bunx prisma migrate dev

cd backend/services/chat
bunx prisma migrate dev
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
- **Report Service** : `http://localhost:8003/scalar`
- **Notification Service** : `http://localhost:8004/scalar`
- **Chat Service** : `http://localhost:8005/scalar`
- **Session Service** : `http://localhost:8006/scalar`
- **API Gateway (Public)** : `http://localhost:8000`

## Points de terminaison principaux (via la Gateway)

| Endpoint | Service | Auth requise |
| --- | --- | --- |
| `POST /user/signup` | user | Non |
| `POST /user/complete-signup` | user | Non |
| `POST /user/login` | user | Non |
| `POST /user/complete-login` | user | Non |
| `POST /user/do-user-verification` | user | Non |
| `POST /user/resend-user-verification-code` | user | Non |
| `POST /user/password-reset` | user | Non |
| `POST /user/new-password` | user | Non |
| `POST /user/logout` | user | Oui |
| `GET /session/get-all-active-sessions` | session | Oui |
| `GET /session/get-session/{sessionId}` | session | Oui |
| `PATCH /session/disable-session/{sessionId}` | session | Oui |
| `POST /session/logout-other-sessions` | session | Oui |
| `GET /user/get-me` | user | Oui |
| `GET /user/get-user-by-id/{userId}` | user | Non |
| `PUT /user/update-profile` | user | Oui |
| `POST /content/create-post` | content | Oui |
| `GET /content/get-feed-following` | content | Non |
| `GET /content/get-post-by-id/{id}` | content | Non |
| `DELETE /content/delete-post/{postId}` | content | Oui |
| `POST /content/create-comment` | content | Oui |
| `GET /content/get-comments` | content | Non |
| `DELETE /content/delete-comment/{id}` | content | Oui |
| `POST /content/like-post/{postId}` | content | Oui |
| `DELETE /content/unlike-post/{postId}` | content | Oui |
| `GET /content/get-post-likes/{postId}` | content | Non |
| `POST /content/like-comment/{commentId}` | content | Oui |
| `DELETE /content/unlike-comment/{commentId}` | content | Oui |
| `GET /content/get-comment-likes/{commentId}` | content | Non |
| `GET /report/get-report-reasons` | report | Non |
| `POST /report/create-report` | report | Oui |
| `GET /notification/get-notifications` | notification | Oui |
| `PATCH /notification/mark-notifications-seen` | notification | Oui |
| `POST /chat/create-discussion` | chat | Oui |
| `GET /chat/get-discussions` | chat | Oui |
| `GET /chat/get-discussion/{discussionId}` | chat | Oui |
| `PATCH /chat/update-discussion/{discussionId}` | chat | Oui |
| `DELETE /chat/delete-discussion/{discussionId}` | chat | Oui |
| `PATCH /chat/mark-discussion-read/{discussionId}` | chat | Oui |
| `POST /chat/add-discussion-members/{discussionId}` | chat | Oui |
| `PATCH /chat/update-discussion-member/{discussionId}/{userId}` | chat | Oui |
| `DELETE /chat/remove-discussion-member/{discussionId}/{userId}` | chat | Oui |
| `GET /chat/get-messages/{discussionId}` | chat | Oui |
| `POST /chat/create-message/{discussionId}` | chat | Oui |
| `PATCH /chat/update-message/{messageId}` | chat | Oui |
| `DELETE /chat/delete-message/{messageId}` | chat | Oui |
| `GET /chat/get-message-image/{messageId}/{imageId}/{quality}` | chat | Oui, membre actif de la discussion |

Les images des messages sont envoyées avec `POST /chat/create-message/{discussionId}`
en `multipart/form-data`. Le service conserve une version compressée et l'original
dans le compartiment privé `social-media-project-discussion`; aucun objet de ce
compartiment n'est exposé directement.
