# Chillspace mobile

Application Expo Router inspirée du frontend web Chillspace. Elle partage les mêmes contrats API et la même organisation du data fetching : Ky pour les clients HTTP et TanStack React Query pour les hooks, le cache et les mutations.

## Démarrage

```bash
bun install
cp .env.example .env
bun start
```

Renseigner `EXPO_PUBLIC_API_URL` avec l’adresse du gateway backend. Sur un téléphone physique, utiliser l’adresse IP locale de l’ordinateur (par exemple `http://192.168.1.100:8000`). L’émulateur Android utilise `http://10.0.2.2:8000` par défaut et iOS/web utilisent `http://localhost:8000`.

## Vérifications

```bash
bunx tsc --noEmit
bunx expo lint
```

Les tokens sont conservés avec Expo SecureStore sur iOS/Android et avec `localStorage` sur le web.
