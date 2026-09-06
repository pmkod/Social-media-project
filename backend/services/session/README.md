# Session Service

Microservice HTTP chargé de créer, lire, vérifier et désactiver les sessions utilisateur dans Redis.

## Démarrage

Redis doit être démarré, puis :

```bash
cp .env.example .env
bun install
bun run dev
```

La documentation OpenAPI est disponible sur `http://localhost:8006/scalar` en développement.

## Routes

- `POST /internal/sessions` : crée une session depuis un service interne et retourne son identifiant et son token brut.
- `GET /sessions/active` : liste les sessions actives de l'utilisateur authentifié.
- `GET /sessions/{sessionId}` : récupère les métadonnées d'une session.
- `PATCH /sessions/{sessionId}/disable` : désactive une session.
- `POST /sessions/logout-others` : désactive toutes les sessions sauf la session courante.
- `POST /internal/sessions/verify` : vérifie une paire identifiant/token pour l'authentification centralisée de la gateway.

Le token brut n'est jamais persisté. Seule son empreinte SHA-256 est stockée dans Redis et les routes de lecture ne la retournent pas.

En production, ce service doit rester sur le réseau privé : seuls la Gateway et les services internes doivent pouvoir atteindre son port. Les clients publics passent exclusivement par la Gateway, qui supprime tous les en-têtes `X-Authenticated-*` entrants avant d'injecter l'identité qu'elle a vérifiée.
