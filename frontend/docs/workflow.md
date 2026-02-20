# Workflow — frontend

## Architecture

```
src/
  App.tsx           ← Routeur principal (React Router)
  lib/
    client.ts       ← Axios configuré (baseURL + withCredentials)
  features/
    hooks/
      swr/          ← Fetchers (GET) et Mutations (POST/PATCH) SWR
      form/         ← Hooks react-hook-form + Zod par feature
      auth/         ← useLogout, useVerifyToken
    zodSchemas/     ← Schémas de validation (signIn, signUp, reset, etc.)
  components/
    providers/      ← AuthProvider (contexte global isLoggedIn)
    routes/         ← ProtectedRoute, PublicOnlyRoute
    forms/          ← AuthForm, ForgotPasswordForm, ResetPasswordForm, UserEditForm
    ui/             ← Button, Input, Label, ErrorDisplay, Loading...
  pages/            ← HomePage, SigninPage, SignupPage, EditUserPage...
  types/            ← Types TypeScript générés depuis le schéma OpenAPI
  context/          ← AuthContext
```

## Routing

Toutes les routes sont déclarées dans `App.tsx` avec un flag `isPrivate` :

| Route | Privée | Description |
|---|---|---|
| `/` | ✅ | Homepage |
| `/signin` | ❌ | Connexion |
| `/signup` | ❌ | Inscription |
| `/forgot-password` | ❌ | Demande reset password |
| `/reset-password/:token` | ❌ | Nouveau mot de passe |
| `/not-verified` | ✅ | Email non vérifié |
| `/verify-token/:token` | ✅ | Vérification email |
| `/me/edit` | ✅ | Édition du profil |

- **ProtectedRoute** : appelle `GET /users/me` via SWR. Si pas de user → ne rend **rien** (pas de redirect explicite).
- **PublicOnlyRoute** : redirige les utilisateurs déjà connectés.

## Authentification

Le frontend utilise **uniquement des cookies HttpOnly** — aucun token n'est stocké en localStorage.

```
axios client (withCredentials: true)
  └─ Cookie envoyé automatiquement par le navigateur
       └─ Backend valide le cookie et retourne l'user
```

`AuthProvider` stocke un indicateur `isLoggedIn` en localStorage uniquement pour l'UX (afficher/masquer des éléments), mais la **vraie source de vérité est le cookie**.

## Data fetching — SWR

| Hook | Type | Endpoint |
|---|---|---|
| `useUser` | Fetcher | `GET /users/me` |
| `useVerifiedUser` | Fetcher | `GET /users/me` (avec vérif) |
| `useSignInMutation` | Mutation | `POST /auth/cookie/login` |
| `useSignUpMutation` | Mutation | `POST /auth/register` |
| `useForgotPasswordMutation` | Mutation | `POST /auth/forgot-password` |
| `useResetPasswordMutation` | Mutation | `POST /auth/reset-password` |
| `useVerifyTokenMutation` | Mutation | `POST /auth/verify` |
| `useEditUserMutation` | Mutation | `PATCH /users/me` |
| `useLogout` | Action | `POST /auth/cookie/logout` |
| `useGoogleAuth` | Fetcher | `GET /auth/cookie/google/authorize` |
| `useGithubAuth` | Fetcher | `GET /auth/cookie/github/authorize` |

## Formulaires — pattern

Chaque formulaire suit le même pattern :

```
useSomethingForm()        ← react-hook-form + zodResolver(schema)
  └─ zodSchema            ← validation des champs (min length, regex, etc.)
useSomethingMutation()    ← useSWRMutation → appel API
  └─ onSubmit             ← trigger(data) → toast succès/erreur
```

## Types auto-générés

`openapi-typescript` lit le `schema.json` du backend (généré par `scripts/create_schema.py`) et produit les types TypeScript dans `src/types/api/`. Cela garantit que les types frontend restent synchronisés avec le backend sans saisie manuelle.
