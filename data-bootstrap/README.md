# data-bootstrap

Module de génération de données de démonstration pour le projet Social Media.

Il permet de remplir les bases des microservices avec des users, posts, commentaires et likes de manière cohérente. Les données sont **définies en dur dans des tableaux** (pas de Faker), ce qui les rend déterministes et reproductibles d'un bootstrap à l'autre.

Les données sont créées :

- soit **directement en base de données** via les clients Prisma des services (mode par défaut) ;
- soit via **les endpoints publics de l'API Gateway** (mode `USE_API=true`).

Les avatars et médias des posts sont générés sous forme de SVG. Par défaut ils sont encodés en **data URI inline** dans la base. Il est possible de les écrire sur disque en définissant `MEDIA_OUTPUT_DIR`.

> Les utilisateurs factices sont créés directement en base et enrichis avec les champs de profil (`bio`, `avatarUrl`) — ils ne passent pas par le flux d'inscription.

## Données

Les données de démonstration (prénoms, noms, villes, bios, posts et commentaires) sont stockées dans `src/lib/static-data.ts`. Pour enrichir le jeu de données ou ajouter des contenus, modifiez directement les tableaux de ce fichier. Les seeders sélectionnent les éléments de façon cyclique et déterministe, donc le résultat reste reproductible.

## Installation

```bash
bun install
```

## Configuration

Copier le fichier d'exemple et ajuster les valeurs :

```bash
cp .env.example .env
```

| Variable | Description | Défaut |
| --- | --- | --- |
| `USER_DATABASE_URL` | URL PostgreSQL du service user | `postgresql://postgres:postgres@localhost:5432/social_media_project_user?schema=public` |
| `CONTENT_DATABASE_URL` | URL PostgreSQL du service content | `postgresql://postgres:postgres@localhost:5432/social_media_content?schema=public` |
| `USE_API` | Utiliser les endpoints API au lieu de la DB directe | `false` |
| `GATEWAY_BASE_URL` | URL de l'API Gateway (mode API) | `http://localhost:8000` |
| `ACCESS_TOKEN_SECRET_KEY` | Secret JWT commun à la gateway et au service user | `super-secret-access-key-social-media-2026` |
| `SEED_USER_COUNT` | Nombre d'utilisateurs à créer | `10` |
| `SEED_POSTS_PER_USER` | Nombre de posts par utilisateur | `3` |
| `SEED_COMMENTS_PER_POST` | Nombre de commentaires par post (approximatif) | `2` |
| `SEED_LIKE_PROBABILITY` | Probabilité qu'un utilisateur like un post/commentaire (0-100) | `30` |
| `MEDIA_OUTPUT_DIR` | Dossier de sortie des SVG (facultatif) | non défini |
| `MEDIA_BASE_URL` | URL de base des médias si écrits sur disque | `http://localhost:8000/media` |

## Utilisation

### Mode base de données directe (recommandé)

```bash
bun run bootstrap
```

### Mode appels API

Les services backend et la gateway doivent être démarrés au préalable.

```bash
USE_API=true bun run bootstrap
```

### Écriture des médias sur disque

```bash
MEDIA_OUTPUT_DIR=./generated-media bun run bootstrap
```

Les fichiers seront créés dans `generated-media/`. Pour les servir, configurez votre API Gateway ou un serveur statique sur `MEDIA_BASE_URL`.

## Logs

Toutes les créations sont loguées avec leur identifiant, auteur et type. En cas de relance sur une base déjà peuplée, le bootstrap détecte les données existantes et saute l'étape correspondante pour éviter les doublons.

## Vérification des types

```bash
bun run typecheck
```
