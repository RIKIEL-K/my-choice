# Règles Frontend — Obligatoires

## 1. Architecture & Organisation du code

### Structure des couches — NE PAS mélanger
- **`components/ui/`** → Composants UI réutilisables et génériques (Button, Card, Dialog, etc.). Chaque composant a son propre dossier avec un `index.tsx`. Ces composants ne contiennent AUCUNE logique métier.
- **`components/admin/`** → Composants de pages admin, organisés par domaine (elections, candidates, students, settings, dashboard). Chaque domaine a son dossier.
- **`features/hooks/`** → Hooks personnalisés, séparés par catégorie (`swr/fetcher/`, `swr/mutation/`, `auth/`, `context/`, `form/`).
- **`features/zodSchemas/`** → Schémas Zod pour la validation, organisés par domaine (auth, user, common).
- **`types/api/`** → Types TypeScript des réponses API, organisés par microservice (auth, election, user). Contient aussi `base.ts` pour les types partagés.
- **`lib/`** → Utilitaires purs (clients Axios, toast, animations, parsing d'erreurs). Aucune logique React ici.
- **`context/`** → Contextes React globaux uniquement (AuthContext, etc.).
- **`pages/`** → Composants de page (point d'entrée de routing). Doit rester simple et déléguer au composant correspondant.

### Règles absolues
- **NE JAMAIS** placer de la logique métier dans un composant UI.
- **NE JAMAIS** créer de fichier en vrac à la racine de `components/` — toujours dans un sous-dossier thématique.
- **NE JAMAIS** importer un composant admin depuis un composant UI ou vice-versa.
- **UN composant = UN dossier** avec un `index.tsx` comme point d'entrée.

---

## 2. Gestion des données — SWR & Axios

### Clients API
- L'application utilise une architecture **microservices**. Il existe un client Axios par microservice :
  - `lib/client.ts` → auth-service (port 8000)
  - `lib/electionClient.ts` → election-service (port 8001)
- **NE JAMAIS** créer un nouveau client Axios. Utiliser celui qui existe pour le microservice ciblé.
- **NE JAMAIS** hardcoder d'URL d'API. Utiliser les variables d'environnement `VITE_API_URL` et `VITE_ELECTION_API_URL`.

### Hooks SWR
- Les appels GET passent par des hooks SWR dans `features/hooks/swr/fetcher/`.
- Les mutations (POST, PUT, PATCH, DELETE) sont des fonctions async exportées depuis ces mêmes fichiers (pas de hook SWR pour les mutations).
- Après une mutation réussie, appeler `mutate()` du hook SWR pour revalider le cache.
- **NE JAMAIS** faire d'appel API directement dans un composant. Toujours passer par un hook ou une fonction utilitaire existante.

---

## 3. TypeScript — Typage strict

- **TOUJOURS** typer les props des composants avec une `interface` dédiée.
- **TOUJOURS** typer les réponses API dans `types/api/` avec les types correspondant au backend.
- **NE JAMAIS** utiliser `any`. Préférer `unknown` si le type est vraiment inconnu.
- Les types partagés entre domaines vont dans `types/api/base.ts`.
- Les types spécifiques à un domaine vont dans leur fichier dédié (ex: `types/api/election/election.ts`).

---

## 4. Composants & UX

### Modales de confirmation
- **TOUTES les actions destructives ou significatives** (supprimer, activer, suspendre, clôturer, approuver, rejeter, sauvegarder, exporter, etc.) doivent passer par le composant `ConfirmModal` avec un message **court et en français**.
- **NE JAMAIS** utiliser `window.confirm()`, `window.alert()`, ou `window.prompt()`.
- Le pattern est : bouton → `setState(target)` → `ConfirmModal` contrôlé par l'état → `onConfirm` exécute l'action et nettoie l'état.
- Utiliser les variantes correctes : `danger` (rouge) pour les suppressions/suspensions, `warning` (ambre) pour les clôtures/annulations, `info` (violet) pour les approbations/activations/sauvegardes.

### Notifications
- Utiliser `toast` de `@/lib/toast` pour les retours après action (succès, erreur).
- **NE JAMAIS** utiliser `alert()` ni installer de bibliothèque de toast externe (sonner, react-hot-toast, etc.).


## 5. Styling

- L'application utilise **Tailwind CSS v4** (configuration via `@theme inline` dans `index.css`, pas de fichier `tailwind.config`).
- La palette de couleurs principale est **violet** (violet-500/600/700 pour le branding).
- **NE JAMAIS** installer de bibliothèque de composants UI externe (shadcn, radix, headless-ui, chakra, etc.). Les composants UI sont custom dans `components/ui/`.
- Utiliser les classes utilitaires Tailwind, pas de CSS inline.
- Conserver la cohérence des tailles : `text-xs`, `text-sm` pour le contenu admin; `h-7`/`h-8` pour les boutons compacts.

---



## 10. Imports

- Utiliser les alias de chemin `@/` pour tous les imports internes (jamais de chemin relatif `../../`).
- Ordre des imports :
  1. Imports React et hooks
  2. Imports de composants UI
  3. Imports d'icônes (lucide-react)
  4. Imports de lib/utils
  5. Imports de hooks/features
  6. Imports de types
