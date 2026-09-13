# Inventaire des pages et modales — revue responsive

Ce document recense les surfaces utilisateur trouvées dans les clients web et mobile. Une case doit être cochée après validation visuelle et fonctionnelle à la largeur indiquée.

**Périmètre détecté : 37 pages, 22 modales/dialogues métier et 7 structures partagées.**

## Matrice de test

- **320 px** : petit mobile.
- **390–430 px** : mobile courant et grand mobile.
- **768 px** : tablette / point de bascule intermédiaire.
- **≥ 1024 px** : petit desktop puis grand desktop à 1440 px.
- Tester aussi le mode paysage, le zoom navigateur à 200 %, les textes longs, les listes vides/chargées/en erreur et l'ouverture du clavier sur les formulaires.
- Pour les modales : vérifier le scroll interne, le verrouillage du scroll de la page, le focus, la fermeture, les boutons fixes et les zones sûres en hauteur réduite.

## Pages web — publiques et authentification (9)

| 320 | 390–430 | 768 | ≥ 1024 | Page | Route | Source |
| --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | Connexion | `/` | [index.tsx](clients/apps/web/src/routes/_base/_authentication/index.tsx) |
| [ ] | [ ] | [ ] | [ ] | Inscription | `/signup` | [signup.tsx](clients/apps/web/src/routes/_base/_authentication/signup.tsx) |
| [ ] | [ ] | [ ] | [ ] | Finalisation de l'inscription | `/complete-signup` | [complete-signup.tsx](clients/apps/web/src/routes/_base/_authentication/complete-signup.tsx) |
| [ ] | [ ] | [ ] | [ ] | Demande de réinitialisation du mot de passe | `/password-reset` | [password-reset.tsx](clients/apps/web/src/routes/_base/_authentication/password-reset.tsx) |
| [ ] | [ ] | [ ] | [ ] | Nouveau mot de passe | `/new-password` | [new-password.tsx](clients/apps/web/src/routes/_base/_authentication/new-password.tsx) |
| [ ] | [ ] | [ ] | [ ] | Vérification utilisateur | `/user-verification` | [user-verification.tsx](clients/apps/web/src/routes/_base/_authentication/user-verification.tsx) |
| [ ] | [ ] | [ ] | [ ] | À propos | `/about` | [about.tsx](clients/apps/web/src/routes/_base/about.tsx) |
| [ ] | [ ] | [ ] | [ ] | Politique de confidentialité | `/privacy-policy` | [privacy-policy.tsx](clients/apps/web/src/routes/_base/privacy-policy.tsx) |
| [ ] | [ ] | [ ] | [ ] | Conditions d'utilisation | `/terms-of-service` | [terms-of-service.tsx](clients/apps/web/src/routes/_base/terms-of-service.tsx) |

## Pages web — application authentifiée (19)

| 320 | 390–430 | 768 | ≥ 1024 | Page | Route | Source |
| --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | Accueil, création de post et fil | `/home` | [home.tsx](clients/apps/web/src/routes/_main/_with-right-aside/home.tsx) |
| [ ] | [ ] | [ ] | [ ] | Recherche d'utilisateurs et de posts | `/search?q=…` | [search.tsx](clients/apps/web/src/routes/_main/_with-right-aside/search.tsx) |
| [ ] | [ ] | [ ] | [ ] | Profil utilisateur | `/:username` | [$username.tsx](clients/apps/web/src/routes/_main/_with-right-aside/$username.tsx) |
| [ ] | [ ] | [ ] | [ ] | Détail d'un post et commentaires | `/posts/:postId` | [posts.$postId.tsx](clients/apps/web/src/routes/_main/_with-right-aside/posts.$postId.tsx) |
| [ ] | [ ] | [ ] | [ ] | Posts enregistrés | `/bookmarks` | [bookmarks.tsx](clients/apps/web/src/routes/_main/_with-right-aside/bookmarks.tsx) |
| [ ] | [ ] | [ ] | [ ] | Collections de favoris | `/bookmark-collections` | [bookmark-collections.tsx](clients/apps/web/src/routes/_main/_with-right-aside/bookmark-collections.tsx) |
| [ ] | [ ] | [ ] | [ ] | Notifications | `/notifications` | [notifications.tsx](clients/apps/web/src/routes/_main/_with-right-aside/notifications.tsx) |
| [ ] | [ ] | [ ] | [ ] | Liste des discussions | `/discussions` | [index.tsx](clients/apps/web/src/routes/_main/discussions/index.tsx) |
| [ ] | [ ] | [ ] | [ ] | Détail d'une discussion | `/discussions/:discussionId` | [$discussionId.tsx](clients/apps/web/src/routes/_main/discussions/$discussionId.tsx) |
| [ ] | [ ] | [ ] | [ ] | Vue d'ensemble des réglages | `/settings` | [index.tsx](clients/apps/web/src/routes/_main/settings/index.tsx) |
| [ ] | [ ] | [ ] | [ ] | Réglages du compte | `/settings/account` | [account.tsx](clients/apps/web/src/routes/_main/settings/account.tsx) |
| [ ] | [ ] | [ ] | [ ] | Changement d'adresse e-mail | `/settings/change-email` | [change-email.tsx](clients/apps/web/src/routes/_main/settings/change-email.tsx) |
| [ ] | [ ] | [ ] | [ ] | Vérification du changement d'e-mail | `/settings/user-verification` | [user-verification.tsx](clients/apps/web/src/routes/_main/settings/user-verification.tsx) |
| [ ] | [ ] | [ ] | [ ] | Réglages de sécurité | `/settings/security` | [security.tsx](clients/apps/web/src/routes/_main/settings/security.tsx) |
| [ ] | [ ] | [ ] | [ ] | Changement de mot de passe | `/settings/change-password` | [change-password.tsx](clients/apps/web/src/routes/_main/settings/change-password.tsx) |
| [ ] | [ ] | [ ] | [ ] | Sessions actives | `/settings/sessions` | [sessions.tsx](clients/apps/web/src/routes/_main/settings/sessions.tsx) |
| [ ] | [ ] | [ ] | [ ] | Ressources supplémentaires | `/settings/privacy` | [privacy.tsx](clients/apps/web/src/routes/_main/settings/privacy.tsx) |
| [ ] | [ ] | [ ] | [ ] | Thème | `/settings/theme` | [theme.tsx](clients/apps/web/src/routes/_main/settings/theme.tsx) |
| [ ] | [ ] | [ ] | [ ] | Langue | `/settings/language` | [language.tsx](clients/apps/web/src/routes/_main/settings/language.tsx) |

## Pages mobile Expo (9)

Les routes entre parenthèses sont des groupes Expo Router et ne font pas partie de l'URL.

| 320 | 390–430 | 768 | ≥ 1024 | Page | Route | Source |
| --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | Bienvenue | `/` | [index.tsx](clients/mobile/src/app/index.tsx) |
| [ ] | [ ] | [ ] | [ ] | Connexion | `/login` | [login.tsx](<clients/mobile/src/app/(auth)/login.tsx>) |
| [ ] | [ ] | [ ] | [ ] | Inscription | `/signup` | [signup.tsx](<clients/mobile/src/app/(auth)/signup.tsx>) |
| [ ] | [ ] | [ ] | [ ] | Finalisation de l'inscription | `/complete-signup` | [complete-signup.tsx](<clients/mobile/src/app/(auth)/complete-signup.tsx>) |
| [ ] | [ ] | [ ] | [ ] | Vérification | `/verify` | [verify.tsx](<clients/mobile/src/app/(auth)/verify.tsx>) |
| [ ] | [ ] | [ ] | [ ] | Demande de réinitialisation du mot de passe | `/password-reset` | [password-reset.tsx](<clients/mobile/src/app/(auth)/password-reset.tsx>) |
| [ ] | [ ] | [ ] | [ ] | Nouveau mot de passe | `/new-password` | [new-password.tsx](<clients/mobile/src/app/(auth)/new-password.tsx>) |
| [ ] | [ ] | [ ] | [ ] | Accueil / fil | `/home` | [home.tsx](<clients/mobile/src/app/(app)/home.tsx>) |
| [ ] | [ ] | [ ] | [ ] | Explorer | `/explore` | [explore.tsx](<clients/mobile/src/app/(app)/explore.tsx>) |

## Client admin

Aucune page applicative ni route n'est actuellement présente dans `clients/apps/admin`.

## Modales web — contenu et formulaires (13)

| 320 | 390–430 | 768 | ≥ 1024 | Modale | Point d'entrée / variante | Source |
| --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | Créer ou modifier une collection | `/bookmark-collections` et depuis le sélecteur ; tester les variantes création et édition | [bookmark-collection-modal.tsx](clients/apps/web/src/features/bookmark/common/bookmark-collection-modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Sélectionner les collections d'un favori | Bouton d'enregistrement d'un post | [bookmark-collection-picker-modal.tsx](clients/apps/web/src/features/bookmark/common/bookmark-collection-picker-modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Créer une discussion privée | `/discussions`, action « nouveau message » | [start-discussion.modal.tsx](clients/apps/web/src/features/discussion/start-discussion/start-discussion.modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Créer une discussion de groupe | `/discussions`, action « nouveau groupe » | [create-discussion.modal.tsx](clients/apps/web/src/features/discussion/create-discussion/create-discussion.modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Informations d'une discussion | En-tête de `/discussions/:discussionId` | [discussion-info.modal.tsx](clients/apps/web/src/features/discussion/info/discussion-info.modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Ajouter des membres | Depuis les informations d'une discussion de groupe | [add-discussion-members.modal.tsx](clients/apps/web/src/features/discussion/info/add-discussion-members.modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Aperçu d'un média de discussion | Message ou galerie des informations de discussion | [discussion-media-preview.modal.tsx](clients/apps/web/src/features/discussion/media/discussion-media-preview.modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Aperçu des médias avant publication | Formulaire de création de post sur `/home` | [media-preview.modal.tsx](clients/apps/web/src/features/post/create-post/media-preview.modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Signalement | Menus d'action d'un post, commentaire, profil ou discussion ; tester chaque type de cible | [report.modal.tsx](clients/apps/web/src/features/report/report.modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Confirmation de signalement envoyé | Après un signalement réussi | [report-success.modal.tsx](clients/apps/web/src/features/report/report-success.modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Modifier le profil | Profil de l'utilisateur connecté | [edit-profile.modal.tsx](clients/apps/web/src/features/user/edit-profile/edit-profile.modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Liste des abonnés | Compteur d'abonnés d'un profil | [list-followers.modal.tsx](clients/apps/web/src/features/user/list-followers/list-followers.modal.tsx) |
| [ ] | [ ] | [ ] | [ ] | Liste des abonnements | Compteur d'abonnements d'un profil | [list-following.modal.tsx](clients/apps/web/src/features/user/list-following/list-following.modal.tsx) |

## Modales web — confirmations (9)

| 320 | 390–430 | 768 | ≥ 1024 | Dialogue | Point d'entrée / variante | Source |
| --- | --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | Supprimer une collection de favoris | `/bookmark-collections` | [delete-bookmark-collection-alert-dialog.tsx](clients/apps/web/src/features/bookmark/delete-bookmark-collection/delete-bookmark-collection-alert-dialog.tsx) |
| [ ] | [ ] | [ ] | [ ] | Supprimer un commentaire | Menu d'action d'un commentaire | [delete-comment-alert-dialog.tsx](clients/apps/web/src/features/comment/delete-comment/delete-comment-alert-dialog.tsx) |
| [ ] | [ ] | [ ] | [ ] | Déconnecter une session | `/settings/sessions` ; tester la session courante et une autre session | [disable-session-alert-dialog.tsx](clients/apps/web/src/features/session/disable-session/disable-session-alert-dialog.tsx) |
| [ ] | [ ] | [ ] | [ ] | Déconnecter toutes les autres sessions | `/settings/sessions` | [logout-other-sessions-alert-dialog.tsx](clients/apps/web/src/features/session/logout-other-sessions/logout-other-sessions-alert-dialog.tsx) |
| [ ] | [ ] | [ ] | [ ] | Bloquer un utilisateur | Profil, post, commentaire ou informations de discussion | [block-user-alert-dialog.tsx](clients/apps/web/src/features/user/block-user/block-user-alert-dialog.tsx) |
| [ ] | [ ] | [ ] | [ ] | Débloquer un utilisateur | Profil, post, commentaire ou informations de discussion | [unblock-user-alert-dialog.tsx](clients/apps/web/src/features/user/unblock-user/unblock-user-alert-dialog.tsx) |
| [ ] | [ ] | [ ] | [ ] | Supprimer une discussion | Informations d'une discussion | [discussion-action-alert-dialogs.tsx](clients/apps/web/src/features/discussion/info/discussion-action-alert-dialogs.tsx) |
| [ ] | [ ] | [ ] | [ ] | Quitter une discussion | Informations d'une discussion de groupe | [discussion-action-alert-dialogs.tsx](clients/apps/web/src/features/discussion/info/discussion-action-alert-dialogs.tsx) |
| [ ] | [ ] | [ ] | [ ] | Retirer un membre d'une discussion | Liste des membres dans les informations de discussion | [discussion-action-alert-dialogs.tsx](clients/apps/web/src/features/discussion/info/discussion-action-alert-dialogs.tsx) |

## Modales mobile

Aucune modale métier n'est actuellement instanciée dans `clients/mobile/src`. Des primitives génériques existent dans `clients/mobile/src/components/ui`, mais elles ne constituent pas encore des surfaces utilisateur à auditer.

## Structures partagées à valider (7)

Ces structures ne sont pas des pages, mais une régression responsive ici affecte plusieurs routes.

| 320 | 390–430 | 768 | ≥ 1024 | Structure | Source |
| --- | --- | --- | --- | --- | --- |
| [ ] | [ ] | [ ] | [ ] | Présentation commune des pages d'authentification web | [route.tsx](clients/apps/web/src/routes/_base/_authentication/route.tsx) |
| [ ] | [ ] | [ ] | [ ] | Navigation principale web | [route.tsx](clients/apps/web/src/routes/_main/route.tsx) |
| [ ] | [ ] | [ ] | [ ] | Mise en page web avec panneau latéral droit | [route.tsx](clients/apps/web/src/routes/_main/_with-right-aside/route.tsx) |
| [ ] | [ ] | [ ] | [ ] | Mise en page maître/détail des discussions | [route.tsx](clients/apps/web/src/routes/_main/discussions/route.tsx) |
| [ ] | [ ] | [ ] | [ ] | Mise en page maître/détail des réglages | [route.tsx](clients/apps/web/src/routes/_main/settings/route.tsx) |
| [ ] | [ ] | [ ] | [ ] | Onglets mobile natifs | [app-tabs.tsx](clients/mobile/src/components/app-tabs.tsx) |
| [ ] | [ ] | [ ] | [ ] | Onglets de l'application mobile rendue sur le web | [app-tabs.web.tsx](clients/mobile/src/components/app-tabs.web.tsx) |

## Contrôles communs par surface

- [ ] Aucun débordement horizontal ni contenu coupé.
- [ ] Titres, textes longs, noms d'utilisateur et messages reviennent correctement à la ligne.
- [ ] Navigation, panneaux latéraux et colonnes basculent au bon breakpoint.
- [ ] Images et vidéos conservent leur ratio et restent dans le viewport.
- [ ] Zones tactiles suffisamment grandes et espacées sur mobile.
- [ ] Formulaires utilisables avec clavier ouvert, erreurs visibles et boutons accessibles.
- [ ] États chargement, vide, erreur, contenu long et pagination testés.
- [ ] Thèmes clair et sombre testés.
- [ ] Focus clavier, ordre de tabulation et fermeture par `Escape` testés sur le web.
- [ ] Encoches, barres système et zones sûres testées sur mobile.
