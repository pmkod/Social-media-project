# Audit des colonnes et des index PostgreSQL

**Date de l'audit :** 13 septembre 2026  
**Périmètre :** services `User`, `Content`, `Chat`, `Notification` et `Report`.

## 1. Méthode

L'audit a été réalisé à partir de :

- des cinq schémas Prisma ;
- de l'historique des migrations SQL ;
- des requêtes Prisma présentes dans le backend, les services internes et le bootstrap des données ;
- des index réellement présents dans les bases PostgreSQL locales.

Les bases locales sont accessibles et contiennent des données de développement. Toutefois, les statistiques `pg_stat_user_indexes` ont été réinitialisées le 13/09/2026 et indiquent `idx_scan = 0` pour tous les index. Elles ne permettent donc pas de mesurer l'utilisation réelle en production.

Les anciens objets issus des fonctionnalités supprimées ont correctement été retirés par les migrations : `refresh_token`, `story`, `story_view`, `type` des posts, anciennes colonnes de notifications, anciennes colonnes de signalement, etc.

## 2. Synthèse

### Colonnes

| Service | Table | Colonne | Statut | Recommandation |
|---|---|---|---|---|
| User | `user_verification` | `ip` | Inutilisée | Supprimer du schéma et de la base. |
| User | `user_verification` | `agent` | Inutilisée | Supprimer du schéma et de la base. |
| User | `file` | `mime_type` | Écriture seule | Supprimer si aucun endpoint ne doit exploiter le type MIME. |
| User | `file` | `created_at` | Non exploitée actuellement | Conserver uniquement pour audit ou rétention. |
| Chat | `discussion` | `deleted_at` | Dormante | Conserver seulement si une suppression globale est prévue. |
| Report | `report` | `status` | Dormante | Conserver pour le futur workflow de modération. |
| Report | `report` | `created_at` | Non exploitée actuellement | Conserver pour l'historique et la modération. |

Toutes les autres colonnes ont au moins un usage dans les requêtes, les réponses API, les relations ou la logique métier.

### Index

| Service | Index | Niveau de confiance | Recommandation |
|---|---|---|---|
| Content | `comment_deleted_at_idx` | Fort candidat | Supprimer : aucune requête ne filtre actuellement uniquement sur `deleted_at`. |
| Chat | `message_sender_id_idx` | Fort candidat | Supprimer si aucune fonctionnalité de recherche par expéditeur n'est prévue. |
| Report | `report_created_at_idx` | Fort candidat | Supprimer tant qu'il n'existe pas de liste ou de tableau de modération. |
| Chat | `message_parent_message_id_idx` | À valider | Le code ne l'utilise pas directement, mais il protège la relation auto-référente et les suppressions physiques éventuelles. |

Les index `PRIMARY KEY` et `UNIQUE` ne sont pas considérés comme inutiles : ils garantissent l'intégrité des données, par exemple l'unicité d'un follow, d'un like ou d'un bookmark.

## 3. Analyse des colonnes

### 3.1. Service User

Schéma : [`backend/services/user/prisma/schema.prisma`](backend/services/user/prisma/schema.prisma)

#### Suppression recommandée

- **`user_verification.ip`** : aucune création, lecture ou mise à jour ne renseigne cette colonne.
- **`user_verification.agent`** : même constat. Les informations de requête sont transmises au service de session, mais ne sont pas persistées dans `user_verification`.

Migration recommandée :

```sql
ALTER TABLE "user_verification"
  DROP COLUMN "ip",
  DROP COLUMN "agent";
```

#### Colonnes à décider

- **`file.mime_type`** : renseignée pendant l'upload des avatars et des bannières dans [`update-profile.route.ts`](backend/services/user/src/features/user/routes/update-profile.route.ts), mais les lectures sélectionnent seulement `id` et `filename`.
- **`file.created_at`** : aucune lecture applicative identifiée. Elle peut toutefois rester utile pour nettoyer les fichiers orphelins ou conserver une trace de création.
- **`user.active`** : jamais passée à `false`, mais utilisée dans les contrôles de connexion, de profil et de recherche. Elle doit être conservée.

Les compteurs `post_count`, `followers_count`, `following_count` et `unseen_notifications_count` sont utilisés et mis à jour par les services.

### 3.2. Service Chat

Schéma : [`backend/services/chat/prisma/schema.prisma`](backend/services/chat/prisma/schema.prisma)

- **`discussion.deleted_at`** est vérifiée dans [`discussions.service.ts`](backend/services/chat/src/features/discussions/discussions.service.ts), mais aucune route ne lui affecte une date.
- La suppression actuelle est individuelle par membre et utilise `discussion_member.is_deleted` dans [`delete-discussion.route.ts`](backend/services/chat/src/features/discussions/routes/delete-discussion.route.ts).

La colonne peut donc être retirée si le produit ne prévoit pas de suppression globale d'une discussion. Sinon, elle doit être conservée et une vraie route de suppression globale doit être ajoutée.

Les colonnes des membres, messages et médias sont exploitées par les routes de discussion, de pagination, de lecture, de suppression et de présentation.

### 3.3. Service Report

Schéma : [`backend/services/report/prisma/schema.prisma`](backend/services/report/prisma/schema.prisma)

- **`report.status`** est créée avec la valeur `pending`, mais aucun endpoint ne liste ou ne fait évoluer les signalements vers `rejected` ou `resolved`.
- **`report.created_at`** n'est pas utilisé par les endpoints actuels, qui ne font que créer un signalement.

Ces deux colonnes restent néanmoins pertinentes pour un futur back-office de modération. Leur suppression n'est recommandée que si la fonctionnalité de modération est définitivement abandonnée.

### 3.4. Services Content et Notification

Les colonnes restantes sont utilisées : contenu, compteurs, dates de pagination, médias, likes, bookmarks, regroupement des notifications, état lu/non lu et cibles des notifications.

Dans Content, `updated_at` est également renvoyée dans les réponses des posts, commentaires et collections.

## 4. Analyse des index

### 4.1. `content.comment_deleted_at_idx`

Déclaration dans [`content/schema.prisma`](backend/services/content/prisma/schema.prisma).

La route [`get-comments.route.ts`](backend/services/content/src/features/comments/routes/get-comments.route.ts) filtre uniquement avec `postId` et `parentId`. Elle sélectionne `deletedAt`, mais ne l'utilise pas dans la clause `where`.

Les autres opérations sur `deletedAt` recherchent un commentaire par son identifiant primaire. L'index isolé sur `deleted_at` n'a donc pas de consommateur identifié.

**Action proposée :** supprimer cet index via une migration.

### 4.2. `chat.message_sender_id_idx`

Le champ `senderId` est sélectionné et comparé dans le code, mais aucune requête ne filtre ou ne trie les messages par `senderId` seul.

Le compteur de messages non lus utilise plutôt `discussionId`, `createdAt` et `deletedAt`, avec une condition négative sur `senderId`. L'index principal `message_discussion_id_created_at_id_idx` est mieux adapté à cette requête.

**Action proposée :** supprimer `message_sender_id_idx`, sauf si une recherche ou un historique par expéditeur est prévu.

### 4.3. `report.report_created_at_idx`

Le service Report ne possède actuellement qu'une route de création. Il n'existe aucune requête de liste, de filtre ou de tri des signalements par date.

**Action proposée :** supprimer cet index jusqu'à la création du back-office. Pour une future modération, un index `(status, created_at)` serait probablement plus utile.

### 4.4. `chat.message_parent_message_id_idx`

Aucune route actuelle ne recherche directement les messages enfants avec `parentMessageId`. Cependant, le champ appartient à une relation auto-référente et l'index peut réduire le coût des vérifications de clé étrangère lors d'une suppression physique.

**Action proposée :** le conserver par défaut. Le supprimer seulement si les messages ne seront jamais supprimés physiquement et si la fonctionnalité de réponses imbriquées ne doit pas évoluer.

### 4.5. Index à conserver

Les index suivants sont justifiés par les requêtes existantes :

- pagination et tri par `createdAt + id` ;
- listes de followers, following et utilisateurs bloqués ;
- recherches d'appartenance pour les likes, follows, bookmarks et collections ;
- recherche et regroupement des notifications ;
- relations entre collections, bookmarks, messages et médias ;
- contraintes d'unicité métier.

## 5. Observation complémentaire : index probablement manquant

Le modèle `PostMedia` ne possède pas d'index sur `postId` ou `(postId, position)`, alors que les endpoints chargent les médias d'un post et les trient par `position`.

À tester avec `EXPLAIN ANALYZE` en environnement représentatif :

```prisma
model PostMedia {
  // ...

  @@index([postId, position])
}
```

Ce n'est pas un index inutile, mais un point d'optimisation potentiel à surveiller lorsque le volume de médias augmentera.

## 6. Plan d'action recommandé

1. Supprimer `user_verification.ip` et `user_verification.agent` du schéma et via migration.
2. Supprimer `comment_deleted_at_idx`, `message_sender_id_idx` et `report_created_at_idx` via migration.
3. Décider du maintien de `user.file.mime_type`, `user.file.created_at` et `discussion.deleted_at` selon les besoins produit.
4. Conserver `report.status` et `report.created_at` si une modération est prévue.
5. Mesurer les index en production après une période représentative avant toute suppression supplémentaire :

```sql
SELECT
  schemaname,
  relname,
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC, relname, indexrelname;
```

Ce rapport documente les constats et recommandations. Aucune modification du schéma ou des bases de données n'a été appliquée.
