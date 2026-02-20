# Workflow — auth-service

## Architecture

```
main.py                        ← Point d'entrée (CORS + startup/shutdown)
app/
  core/           ← Config, mailer, redis, s3, startup
  models/         ← Modèles SQLAlchemy (User, OAuthAccount)
  db/             ← Session, base, seed
  lib/fastapi_users/ ← UserManager, transports JWT/Cookie, OAuth clients
  v1/
    app.py        ← Sub-app FastAPI montée sur /app/v1
    routers/      ← auth.py, users.py, api.py
    services/     ← UserService
    repositories/ ← UserRepository
    schemas/      ← Pydantic schemas (UserRead/Create/Update)
alembic/          ← Migrations de base de données
scripts/          ← Utilitaires (export schema DB → JSON)
```

## Routes exposées

| Méthode | URL | Description |
|---|---|---|
| POST | `/app/v1/auth/register` | Création de compte |
| POST | `/app/v1/auth/cookie/login` | Login → cookie HttpOnly |
| POST | `/app/v1/auth/jwt/login` | Login → JWT token |
| POST | `/app/v1/auth/cookie/logout` | Déconnexion |
| POST | `/app/v1/auth/forgot-password` | Envoi email de reset |
| POST | `/app/v1/auth/reset-password` | Nouveau mot de passe avec token |
| POST | `/app/v1/auth/request-verify-token` | Envoi email de vérification |
| POST | `/app/v1/auth/verify` | Vérification de l'email |
| GET/POST | `/app/v1/auth/cookie/google` | OAuth Google |
| GET/POST | `/app/v1/auth/cookie/github` | OAuth GitHub |
| GET | `/app/v1/users/me` | Profil de l'utilisateur connecté |
| PATCH | `/app/v1/users/me` | Mise à jour du profil |

## Flux détaillé

### Inscription
1. `POST /auth/register` reçoit `{email, password}`.
2. `UserManager.validate_password()` vérifie les règles :
   - 8 caractères minimum
   - Au moins 1 chiffre, 1 lettre, 1 caractère spécial
3. Le mot de passe est hashé avec **Argon2** et stocké en DB.
4. Un email de vérification est envoyé via `fastapi-mail`.

### Login
1. `POST /auth/cookie/login` reçoit un formulaire `application/x-www-form-urlencoded`.
2. `UserManager.authenticate()` :
   - Vérifie si le compte est **verrouillé** (`is_locked` + `locked_until`).
   - Vérifie le hash Argon2 du mot de passe.
   - Si échec : incrémente `failed_attempts`. À 5 échecs → verrouillage 30 min.
   - Si succès : reset des compteurs, pose un **cookie HttpOnly** de session.
3. Le token expiré est renouvelé automatiquement si le hash est mis à jour.

### OAuth (Google / GitHub)
1. Le frontend redirige vers `/auth/cookie/google/authorize`.
2. L'utilisateur s'authentifie chez Google/GitHub.
3. Le backend reçoit le callback, échange le code en token OAuth.
4. L'utilisateur est créé ou lié en DB via `OAuthAccount`.
5. Un cookie de session est posé et l'utilisateur est redirigé vers le frontend.

### Upload de fichier (S3/MinIO)
1. Upload via `boto3` vers MinIO avec `upload_fileobj()`.
2. La clé de stockage est générée : `{table}/{display_id}/{column}.{ext}`.
3. L'accès au fichier se fait via une **presigned URL** (valide 1h).

## Modèle User

```python
class User(SQLAlchemyBaseUserTableUUID, Base):
    failed_attempts: int       # Compteur de tentatives échouées
    last_attempted_at: datetime | None
    is_locked: bool            # Compte verrouillé ou non
    locked_until: datetime | None
    oauth_accounts: List[OAuthAccount]
```

## Sécurité

| Mécanisme | Implémentation |
|---|---|
| Hachage des mots de passe | Argon2 (via fastapi-users) |
| Authentification | Cookie HttpOnly OU JWT Bearer |
| Verrouillage de compte | 5 échecs → lock 30 min (en DB) |
| CORS | Restreint au `FRONTEND_URL` uniquement |
| Emails | Templates HTML Jinja2, envoyés via SMTP |
| IDs publics | Hashids (opaque, non-séquentiel) |
