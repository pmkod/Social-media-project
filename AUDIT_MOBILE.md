# Rapport d'Audit Rigoureux — Application Mobile React Native (`clients/apps/mobile`)

**Date :** 17 Septembre 2026  
**Auditeur :** Senior React / React Native Engineer  
**Projet :** Social Media Platform Monorepo  
**Périmètre audité :** Code source mobile (`clients/apps/mobile`), intégration HTTP backend, navigation Expo Router, gestion des sessions, formulaires Zod / React Hook Form, ergonomie Safe Area et parité fonctionnelle avec le client Web (`clients/apps/web`).

---

## 1. Résumé Exécutif

Cet audit technique approfondi a été mené sur l'ensemble de l'application mobile développée avec **React Native 0.76.7**, **Expo 52**, **Expo Router 4**, **Ky**, **TanStack Query 5**, **React Hook Form**, **Zod**, et **NativeWind (Tailwind CSS)**.

L'objectif était de déceler et de corriger rigoureusement tous les bugs fonctionnels, incohérences avec les API backend, régressions d'affichage (Dynamic Island, encoches, Home indicator) et failles d'expérience utilisateur (UX).

### Bilan Global des Vérifications
- **Compilation TypeScript (`bunx tsc --noEmit`) :** ✅ **0 erreur** (Type-checking strict 100% réussi).
- **Diagnostics Expo (`bunx expo-doctor`) :** ✅ **21/21 vérifications réussies** sans aucun avertissement.
- **Résolution des anomalies :** ✅ **100% des problèmes identifiés ont été corrigés directement dans le code.**

---

## 2. Synthèse des Problèmes Détectés et Corrections Appliquées

| # | Composant / Module | Problème Détecté | Impact | Solution Appliquée |
|---|---|---|---|---|
| **1** | `core/http-clients/base.http-client.ts` | Utilisation de l'option `baseUrl` au lieu de `prefix` dans `ky.create()` | Dans Ky v2, si `baseUrl` est configuré avec un sous-chemin ou si une URL commence par `/`, la résolution `new URL('/path', baseUrl)` supprime les sous-chemins de base. | Remplacement par `prefix: ApiConfig.baseUrl` garantissant une concaténation propre avec ou sans slash initial. |
| **2** | `features/bookmark` & `PostItem` | Erreur 400 Backend sur l'ajout de signet : `addBookmark` envoyait un corps vide `{}` alors que l'API Content Service exige `bookmarkCollectionId`. | Impossible d'enregistrer un post dans les favoris ; plantage de la mutation. | Création du composant `BookmarkCollectionPickerModal` (calqué sur le Web) permettant de sélectionner ou créer une collection, et intégration directe dans `PostItem`. |
| **3** | Toutes les vues `(app)` avec `headerShown: false` | Absence de gestion de `SafeAreaView` sur les écrans plein écran et les tabs personnalisés. | Sur iOS et Android bord à bord, les titres, boutons retour et champs de recherche étaient masqués sous l'îlot dynamique (Dynamic Island) ou la barre de statut. | Intégration systématique de `SafeAreaView` (`edges={["top"]}` pour les tabs, `edges={["top", "bottom"]}` pour les écrans sans barre d'onglets). |
| **4** | Écrans secondaires (navigation pile) | Appels directs à `router.back()` sans vérification de `router.canGoBack()`. | Si l'utilisateur accède à un écran via notification push ou lien direct, `router.back()` bloque l'utilisateur sans issue. | Mise en place de `handleBack` avec repli sécurisé vers `/(app)/home`. |
| **5** | `discussions/index.tsx` | Absence de bouton de retour dans l'en-tête de la liste des conversations. | L'utilisateur naviguant depuis la page d'accueil vers les messages ne pouvait pas revenir en arrière via l'interface. | Ajout du bouton de retour `ArrowLeft` dans la barre de titre supérieure. |
| **6** | Écrans avec formulaire de saisie (`create-post`, `posts/[postId]`, etc.) | Les barres d'action inférieures (composer, bouton d'envoi) touchaient la bordure basse de l'écran. | Conflit visuel et tactile avec la barre d'accueil système iOS (Home Indicator). | Sécurisation de la zone inférieure avec `edges={["top", "bottom"]}` sur `SafeAreaView`. |
| **7** | Monorepo Node Modules | Conflit de versions React 19 (`react 19.2.3` dans Web vs `19.2.4` dans Mobile). | Risque d'incohérence de typage et avertissement `expo-doctor`. | Uniformisation stricte sur `19.2.3` dans tous les packages du monorepo. |

---

## 3. Détail des Audits par Domaine

### 3.1. Couche HTTP & Réseau (`ky`)
- **Client HTTP :** Conforme à la demande utilisateur d'utiliser `ky` comme sur le Web.
- **Gestion des jetons de session :** `httpClient` injecte l'en-tête `Authorization: Session <sessionId>.<sessionToken>` sur chaque requête via le hook `beforeRequest`.
- **Gestion des 401 :** Le hook `afterResponse` intercepte les statuts 401 et purge immédiatement les informations d'authentification locales (`deleteSessionCredentials`).
- **Gestion Multipart (`FormData`) :**
  - Sur React Native, les objets fichiers envoyés dans `FormData` doivent être au format `{ uri, name, type }`.
  - Vérification des modules `use-create-post.ts` et `use-update-profile.ts` : les objets images sélectionnés via `expo-image-picker` sont correctement typés et formatés, sans `Content-Type` JSON parasite.

### 3.2. Authentification & Cycle de Vie des Sessions
- **Stockage asynchrone :** Basé sur `@react-native-async-storage/async-storage` avec cache mémoire synchronisé dans `session.utils.ts`.
- **Chargement initial :** `loadSessionCredentials()` est exécuté au montage du composant racine `_layout.tsx`, prévenant tout décalage d'authentification lors de la vérification de l'utilisateur (`users/me`).
- **Déconnexion sécurisée :** Le hook `useLogout` effectue l'appel API backend `authentication/logout`, vide le stockage AsyncStorage, réinitialise le cache TanStack Query et redirige proprement vers l'écran de connexion.

### 3.3. Architecture et Navigation (Expo Router)
- **Organisation en Features :**
  - `features/authentication/` (login, signup, verification, reset password, showcase)
  - `features/post/` (feed, creation, detail, likes, search, user-posts, user-liked-posts)
  - `features/comment/` (listing, creation, deletion, likes)
  - `features/user/` (profile, edit, follow/unfollow, followers, following, suggestions, block/unblock)
  - `features/discussion/` (conversations, messages, creation)
  - `features/bookmark/` (saved posts, collections, collection picker)
  - `features/session/` (active sessions, session revocation)
  - `features/report/` & `report-reason/` (reporting system)
- **Structure des Routes :**
  - Les 5 onglets principaux (`home`, `search`, `create-post`, `notifications`, `profile/index`) sont organisés sous `src/app/(app)/_layout.tsx`.
  - Les 16 routes secondaires (détail de post, profil par username, abonnés, messagerie, collections, paramètres, signalement) sont configurées avec `href: null` et `tabBarStyle: { display: "none" }` pour masquer la barre d'onglets et afficher un écran natif complet.
  - Conformité avec la consigne : les modales du Web ont été converties en écrans dédiés à part entière ou en bottom-sheets ergonomiques natives.

### 3.4. Formulaires & Validation (React Hook Form + Zod)
- Tous les écrans à formulaire disposent de schémas de validation Zod stricts :
  - `login.tsx` : validation email / username et mot de passe.
  - `signup.tsx` : règles de sécurité de mot de passe et format email.
  - `edit-profile.tsx` : limitation de taille et regex sur le username (`/^[a-zA-Z0-9_.]+$/`).
  - `settings/change-password.tsx` : confirmation de mot de passe avec `.refine()`.
  - `settings/change-email.tsx` : validation stricte du format email.
  - `bookmark-collections/new.tsx` : limitation de longueur et nettoyage des espaces (`trim`).
- Les messages d'erreur sont affichés sous chaque champ via le composant `Field` ou des textes d'erreur dédiés aux couleurs de la charte.

### 3.5. Compatibilité Matérielle & Multimédia
- **Images :** Utilisation de `expo-image` pour des performances optimales de rendu, mise en cache automatique et transitions de fondu.
- **Sélecteur de photos :** Intégration de `expo-image-picker` avec vérification des permissions et configuration des ratios d'aspect (1:1 pour les avatars, 16:9 pour les photos de couverture).

---

## 4. Résultats des Vérifications Automatisées

### Vérification TypeScript
```bash
$ bunx tsc --noEmit
# Résultat : Code de sortie 0 (Aucune erreur)
```

### Diagnostic Expo Doctor
```bash
$ bunx expo-doctor
# Résultat :
# 21/21 checks passed. No issues detected!
```

---

## 5. Recommandations pour la Mise en Production

1. **Notifications Push :** Intégrer `expo-notifications` pour recevoir les notifications en temps réel (likes, commentaires, nouveaux followers, messages directs) via APNs (iOS) et FCM (Android).
2. **Gestion Hors-Ligne (Offline Mode) :** Activer la persistance du cache TanStack Query avec `@tanstack/query-async-storage-persister` pour une consultation hors-ligne fluide des posts récents.
3. **Mise à jour en direct (OTA) :** Mettre en place EAS Update pour déployer des correctifs JavaScript sans repasser par le processus de revue App Store / Google Play.

---
*Ce rapport certifie que l'application mobile `clients/apps/mobile` est stable, typée sans erreur, conforme aux spécifications backend et prête pour les tests sur simulateurs et terminaux physiques.*
