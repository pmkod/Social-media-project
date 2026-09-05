# Actions qui créent ou suppriment des notifications

## Vue d’ensemble

Les notifications sont persistées par le service `backend/services/notification` dans le modèle `Notification`.

Types d’événements actuellement supportés :

- `FOLLOW`
- `POST_LIKE`
- `COMMENT_LIKE`
- `POST_COMMENT`
- `COMMENT_REPLY`

Le service garantit l’unicité avec la clé composée `eventType + sourceId`. Il ignore également les notifications dont le destinataire est le même que l’acteur (`recipientId === actorId`).

## Actions qui créent des notifications

| Action | Route | Condition | Événement et destinataire | Identifiant de source |
| --- | --- | --- | --- | --- |
| Suivre un utilisateur | `POST /users/{id}/follow` | Une nouvelle relation de suivi est créée. Aucune notification n’est recréée si le suivi existe déjà. | `FOLLOW`, envoyé à l’utilisateur suivi. L’acteur est l’utilisateur authentifié. | `user:{utilisateurSuivi}:actor:{utilisateurAuthentifié}` |
| Aimer un post | `POST /posts/{postId}/likes` | Un nouveau like est effectivement créé. | `POST_LIKE`, envoyé à l’auteur du post. L’acteur est l’utilisateur qui aime le post. Le post et son texte sont associés à la notification. | `post:{postId}:actor:{utilisateurAuthentifié}` |
| Aimer un commentaire | `POST /comments/{commentId}/likes` | Un nouveau like de commentaire est effectivement créé. | `COMMENT_LIKE`, envoyé à l’auteur du commentaire. Le commentaire et son post sont associés à la notification. | `comment:{commentId}:actor:{utilisateurAuthentifié}` |
| Ajouter un commentaire | `POST /comments` | Le commentaire est créé avec succès. | `POST_COMMENT` si le commentaire est directement rattaché au post, envoyé à l’auteur du post. `entityId` vaut alors `postId`. | L’identifiant du commentaire créé |
| Répondre à un commentaire | `POST /comments` | Le commentaire est créé avec un `parentCommentId`. | `COMMENT_REPLY`, envoyé à l’auteur du commentaire parent. `entityId` vaut l’identifiant du commentaire parent. | L’identifiant du commentaire créé |

### Point d’entrée interne de création

Le service de notification crée réellement l’enregistrement avec :

- `POST /internal/notifications`
- Fichier : `backend/services/notification/src/features/notifications/routes/create-notification.route.ts`

Ce point d’entrée :

- refuse les notifications vers soi-même ;
- ignore les doublons détectés par la contrainte unique `eventType + sourceId` ;
- incrémente le compteur de notifications non vues du destinataire après création.

Les services `user` et `content` appellent ce point d’entrée via leur `notificationServiceClient`.

## Actions qui suppriment des notifications

| Action | Route | Condition | Notifications supprimées | Identifiant utilisé |
| --- | --- | --- | --- | --- |
| Ne plus suivre un utilisateur | `DELETE /users/{id}/follow` | Une relation de suivi existante est supprimée. | La notification `FOLLOW` correspondant au suivi supprimé. | `user:{utilisateurSuivi}:actor:{utilisateurAuthentifié}` |
| Bloquer un utilisateur | `POST /users/{id}/block` | Le blocage supprime les relations de suivi existantes dans les deux directions. | Les notifications `FOLLOW` associées à chaque relation supprimée : une pour le suivi de l’utilisateur authentifié vers la cible et une pour le suivi inverse, si elles existent. | Même format `user:{utilisateurSuivi}:actor:{acteurDuSuivi}` |
| Retirer son like d’un post | `DELETE /posts/{postId}/likes` | Un like existant est supprimé. | La notification `POST_LIKE` correspondant à ce like. | `post:{postId}:actor:{utilisateurAuthentifié}` |
| Retirer son like d’un commentaire | `DELETE /comments/{commentId}/likes` | Un like existant est supprimé. | La notification `COMMENT_LIKE` correspondant à ce like. | `comment:{commentId}:actor:{utilisateurAuthentifié}` |
| Supprimer un commentaire | `DELETE /comments/{id}` | Le commentaire n’est pas déjà supprimé et est marqué comme supprimé. | Toutes les notifications liées au commentaire, notamment `POST_COMMENT`, `COMMENT_REPLY` et `COMMENT_LIKE`. | `commentId` |
| Supprimer un post | `DELETE /posts/{id}` | Le post est supprimé par son auteur. | Toutes les notifications associées au post : likes, commentaires et réponses, via leur champ `postId`. | `postId` |

### Points d’entrée internes de suppression

Suppression ciblée :

- `POST /internal/notifications/remove`
- Reçoit `eventType` et `sourceId`.
- Supprime la notification correspondante si elle existe.
- Décrémente le compteur non vu uniquement si la notification supprimée n’était pas déjà vue.

Suppression par post :

- `POST /internal/notifications/remove-by-post`
- Reçoit `postId`.
- Supprime toutes les notifications ayant ce `postId`.
- Décrémente le compteur non vu de chaque destinataire du nombre de notifications supprimées qui n’étaient pas vues.

Suppression par commentaire :

- `POST /internal/notifications/remove-by-comment`
- Reçoit `commentId`.
- Supprime toutes les notifications ayant ce `commentId`, notamment les notifications `COMMENT_LIKE` lorsque le commentaire est supprimé.
- Décrémente le compteur non vu de chaque destinataire du nombre de notifications supprimées qui n’étaient pas vues.

## Fichiers appelants

### Service utilisateur

- Création d’un `FOLLOW` : `backend/services/user/src/features/user/routes/follow-user.route.ts`
- Suppression d’un `FOLLOW` lors d’un unfollow : `backend/services/user/src/features/user/routes/unfollow-user.route.ts`
- Suppression des `FOLLOW` lors d’un blocage : `backend/services/user/src/features/user/routes/block-user.route.ts`

### Service contenu

- Création d’un `POST_LIKE` : `backend/services/content/src/features/posts/routes/like-post.route.ts`
- Suppression d’un `POST_LIKE` : `backend/services/content/src/features/posts/routes/unlike-post.route.ts`
- Création d’un `COMMENT_LIKE` : `backend/services/content/src/features/comments/routes/like-comment.route.ts`
- Suppression d’un `COMMENT_LIKE` : `backend/services/content/src/features/comments/routes/unlike-comment.route.ts`
- Création d’un `POST_COMMENT` ou `COMMENT_REPLY` : `backend/services/content/src/features/comments/routes/create-comment.route.ts`
- Suppression de la notification d’un commentaire : `backend/services/content/src/features/comments/routes/delete-comment.route.ts`
- Suppression de toutes les notifications d’un post : `backend/services/content/src/features/posts/routes/delete-post.route.ts`

## À ne pas confondre avec une suppression

`PATCH /notifications/seen` marque toutes les notifications de l’utilisateur authentifié comme vues et remet son compteur non vu à zéro. Cette action ne supprime aucune notification de la base de données.
