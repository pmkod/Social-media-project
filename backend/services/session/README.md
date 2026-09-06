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

- `POST /sessions` : crée une session et retourne son identifiant et son token brut.
- `GET /sessions/active?userId=...` : liste les sessions actives d'un utilisateur.
- `GET /sessions/{sessionId}` : récupère les métadonnées d'une session.
- `PATCH /sessions/{sessionId}/disable` : désactive une session.
- `POST /internal/sessions/verify` : vérifie une paire identifiant/token pour la future authentification de la gateway.

Le token brut n'est jamais persisté. Seule son empreinte SHA-256 est stockée dans Redis et les routes de lecture ne la retournent pas.
