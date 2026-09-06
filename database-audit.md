# Audit des Colonnes de Base de Données

Ce document présente l'audit complet des colonnes des 5 bases de données PostgreSQL du projet (**User**, **Content**, **Chat**, **Notification**, et **Report**), mis à jour après les récents nettoyages.

---

## 1. Synthèse Globale

| Service | Table | Colonne | Statut Actuel | Impact / Diagnostic |
| :--- | :--- | :--- | :--- | :--- |
| **User** | `user_verification` | `username` | 🟢 **Supprimée** | Retirée de Prisma et de la DB (`20260906121500`). Était écrite au login mais jamais lue. |
| **User** | `user` | `email_verified` | 🟢 **Supprimée** | Retirée de Prisma et de la DB (`20260906121500`). Redondante avec la pré-vérification. |
| **User** | `user_verification` | `ip` | 🔴 **100% Inutilisée** | Définie dans le schéma, jamais écrite, jamais lue, toujours `NULL`. |
| **User** | `user_verification` | `agent` | 🔴 **100% Inutilisée** | Définie dans le schéma, jamais écrite, jamais lue, toujours `NULL`. |
| **User** | `file` | `mime_type` | 🟡 **Non exploitée** | Écrite à l'upload d'avatar/bannière, jamais sélectionnée en lecture (URLs statiques S3). |
| **User** | `user` | `active` | 🟡 **Dormante** | Filtrée à `true` au login/profil, mais jamais passée à `false` (aucun système de ban/désactivation). |
| **Chat** | `discussion` | `deleted_at` | 🟡 **Dormante** | Filtrée à `null`, mais jamais renseignée (la suppression se fait par membre via `discussion_member.is_deleted`). |
| **Report** | `report` | `status` | 🟡 **Dormante** | Initialisée à `pending`, jamais lue ni mise à jour (pas de back-office/dashboard modération). |
| **Content** | *(Toutes)* | - | 🟢 **100% Exploitées** | Toutes les colonnes restantes sont utilisées et nécessaires. |
| **Notification** | *(Toutes)* | - | 🟢 **100% Exploitées** | Schéma optimisé suite aux récentes migrations (`target_id` et `group_key`). |

---

## 2. Détail par Service

### 2.1. Service User (`backend/services/user`)

Schéma Prisma : [`backend/services/user/prisma/schema.prisma`](backend/services/user/prisma/schema.prisma)

#### Colonnes encore inutilisées ou orphelines
* **`user_verification.ip` (TEXT)** :
  * Définie dans `schema.prisma` depuis l'initialisation.
  * Aucune route de création (`signup`, `login`, `password-reset`, `request-email-change`) n'écrit dans cette colonne.
  * Aucune requête ne la lit.
  * *Recommandation* : Supprimer de la table et du schéma Prisma.
* **`user_verification.agent` (TEXT)** :
  * Même constat que pour `ip`. L'information de User-Agent est transmise directement au service de session Redis (`session`), la persistance dans `user_verification` n'a jamais été branchée.
  * *Recommandation* : Supprimer de la table et du schéma Prisma.

#### Colonnes dormantes ou non exploitées en lecture
* **`file.mime_type` (VARCHAR(50))** :
  * Écrite lors de l'upload d'avatars et de bannières dans `update-profile.route.ts`.
  * Non sélectionnée lors de la consultation des profils (`getPublicUserProfile` sélectionne uniquement `{ id: true, filename: true }`).
  * Les fichiers étant servis publiquement par S3/stockage via leur extension, ce champ est redondant sauf si un endpoint de téléchargement avec content-type dynamique est prévu.
* **`user.active` (BOOLEAN default true)** :
  * Testée dans les clauses `where: { active: true }` (login, complete-login, reset password, get public profile).
  * Jamais modifiée à `false` dans l'application (aucun workflow de désactivation de compte ou bannissement).
  * *Recommandation* : Conserver en prévision de fonctionnalités d'administration / modération.

#### Déjà nettoyé
* `user_verification.username` : Supprimée via migration `20260906121500_remove_email_verified_and_verification_username`.
* `user.email_verified` : Supprimée via migration `20260906121500_remove_email_verified_and_verification_username`.
* `refresh_token` (table complète) : Supprimée précédemment via migration `20260906050000_remove_refresh_tokens`.

---

### 2.2. Service Chat (`backend/services/chat`)

Schéma Prisma : [`backend/services/chat/prisma/schema.prisma`](backend/services/chat/prisma/schema.prisma)

#### Colonne dormante
* **`discussion.deleted_at` (TIMESTAMP)** :
  * Les listes de discussions et de messages filtrent sur `where: { deletedAt: null }`.
  * La route de suppression d'une discussion (`delete-discussion.route.ts`) applique une suppression individuelle par membre :
    ```ts
    await prisma.discussionMember.update({
      where: { discussionId_userId: { discussionId, userId: authenticatedUserId } },
      data: { isDeleted: true },
    });
    ```
  * Il n'existe aucun code dans l'application qui assigne une date à `discussion.deletedAt`. La colonne vaut donc toujours `NULL`.
  * *Recommandation* : À conserver uniquement si une suppression globale d'une discussion de groupe par son créateur/propriétaire est prévue. Sinon, la colonne est redondante avec `discussion_member.is_deleted`.

#### Autres modèles du Chat
* **`DiscussionMember`** : Toutes les colonnes (`id`, `discussionId`, `userId`, `role`, `joinedAt`, `lastReadAt`, `hasLeft`, `isDeleted`, `isBlocked`) sont activement utilisées.
* **`Message`** : Toutes les colonnes (`id`, `discussionId`, `senderId`, `parentMessageId`, `content`, `createdAt`, `updatedAt`, `editedAt`, `deletedAt`) sont utilisées.
* **`MessageMedia`** : Toutes les colonnes (`id`, `messageId`, `type`, `url`, `fileName`, `mimeType`, `width`, `height`, `createdAt`) sont exploitées.

---

### 2.3. Service Report (`backend/services/report`)

Schéma Prisma : [`backend/services/report/prisma/schema.prisma`](backend/services/report/prisma/schema.prisma)

#### Colonne dormante
* **`report.status` (ENUM `pending`, `rejected`, `resolved` default `pending`)** :
  * La table `report` stocke les signalements créés par les utilisateurs via `create-report.route.ts`.
  * Le statut est inséré avec sa valeur par défaut `pending`.
  * Il n'existe pas encore de routes d'administration pour lister les signalements ou faire évoluer leur statut en `resolved` ou `rejected`.
  * *Recommandation* : Conserver la colonne car elle sera indispensable dès la mise en place d'un espace modérateur.

---

### 2.4. Service Content (`backend/services/content`)

Schéma Prisma : [`backend/services/content/prisma/schema.prisma`](backend/services/content/prisma/schema.prisma)

* **Statut global** : **100% des colonnes sont actives et pertinentes**.
* **Remarque architecturale sur `updated_at`** :
  * Les modèles `Post` et `Comment` possèdent une colonne `updatedAt` avec l'annotation `@updatedAt`.
  * Comme il n'y a pas de route d'édition du texte des posts ou des commentaires, Prisma met à jour `updatedAt` lors des interactions secondaires (like/unlike, ajout/suppression de commentaire).

---

### 2.5. Service Notification (`backend/services/notification`)

Schéma Prisma : [`backend/services/notification/prisma/schema.prisma`](backend/services/notification/prisma/schema.prisma)

* **Statut global** : **100% des colonnes sont actives et optimisées**.
* Les colonnes de la table `notification` (`id`, `recipient_id`, `initiator_id`, `event_type`, `target_id`, `group_key`, `is_seen`, `created_at`) sont toutes utilisées dans les mécanismes de regroupement, de dédoublonnage et d'affichage.

---

## 3. Recommandations pour les prochaines étapes

1. **Suppression recommandée (Service User)** :
   * Retirer `ip` et `agent` du modèle `UserVerification` dans `backend/services/user/prisma/schema.prisma` via une migration `ALTER TABLE "user_verification" DROP COLUMN "ip", DROP COLUMN "agent";`.
2. **Décision produit sur le Chat** :
   * Valider si `discussion.deleted_at` doit recevoir un endpoint de suppression définitive pour l'administrateur/propriétaire du groupe, ou être retirée au profit exclusif de `discussion_member.is_deleted`.
