# Règles Backend — Obligatoires

## 1. Architecture Microservices

### Séparation des services
- L'application est découpée en **microservices indépendants** :
  - `auth-service` → Authentification, gestion des utilisateurs, OAuth, sessions (port 8000)
  - `election-service` → Élections, candidats, votes, statistiques (port 8001)
- Chaque service a sa **propre base de données**, son propre `alembic`, son propre `pyproject.toml`.
- **NE JAMAIS** faire d'import croisé entre services. Un service ne doit jamais référencer le code d'un autre service.
- La communication inter-services se fait par **webhooks HTTP** ou API REST, jamais par import de modules.

### Structure interne d'un service — Pattern obligatoire
Chaque service suit la structure `app/v1/` avec 4 couches distinctes :

```
app/v1/
├── routers/       → Endpoints FastAPI (couche HTTP)
├── services/      → Logique métier
├── repositories/  → Accès à la base de données (requêtes SQLAlchemy)
├── schemas/       → Schémas Pydantic (validation entrée/sortie)
```

### Règles de couches — NE PAS COURT-CIRCUITER
- **Router** → Appelle le **Service**. Ne contient AUCUNE logique métier ni requête SQL.
- **Service** → Orchestre la logique métier. Appelle un ou plusieurs **Repositories**. Ne fait JAMAIS d'accès direct à la session SQLAlchemy.
- **Repository** → Seule couche autorisée à interagir avec la base de données via SQLAlchemy. Reçoit la session via injection dans le constructeur.
- **Schema** → Validation des données d'entrée et sérialisation des réponses. Utilise Pydantic v2 avec `model_config = {"from_attributes": True}` pour la conversion ORM.
- **NE JAMAIS** écrire de requête SQL dans un router ou un service.
- **NE JAMAIS** lever des HTTPException dans un repository.

---

## 2. Injection de dépendances (FastAPI Depends)

- Chaque router déclare une fonction factory (ex: `get_election_service()`) qui instancie le service avec ses repositories.
- Les repositories reçoivent la `AsyncSession` via `Depends(get_async_session)`.
- **NE JAMAIS** instancier un service ou repository manuellement dans un endpoint — toujours passer par `Depends`.

---

## 3. Base de données & ORM

### SQLAlchemy
- Utiliser SQLAlchemy 2.0+ avec le style **async**.
- Tous les modèles héritent de `Base` (déclaré dans `app/db/base.py`).
- Utiliser `TimestampMixin` pour les colonnes `created_at` / `updated_at` sur tous les modèles.
- Les IDs sont des **UUID** (string), générés côté serveur.
- **NE JAMAIS** utiliser d'auto-increment pour les clés primaires.

### Migrations
- Utiliser **Alembic** pour toutes les modifications de schéma.
- **NE JAMAIS** modifier la base de données manuellement ou via des scripts ad hoc.
- Les migrations doivent être réversibles (fournir un `downgrade()`).
- Chaque service a son propre dossier `alembic/` et sa propre configuration.

---

## 4. Schémas Pydantic

- Séparer les schémas par opération : `Create`, `Update`, `Read`, `ListResponse`.
- `Create` → champs obligatoires pour la création.
- `Update` → tous les champs optionnels (`field: Type | None = None`) pour PATCH partiel.
- `Read` → représentation complète de la ressource (ce que le client reçoit).
- `ListResponse` → pagination standard : `items`, `total`, `page`, `size`.
- Utiliser Pydantic v2 (`BaseModel`, `model_dump`, `model_config`).
- **NE JAMAIS** retourner un modèle SQLAlchemy directement — toujours sérialiser via un schéma Pydantic.

---

## 5. Gestion des erreurs

### Exception handlers
- Chaque service déclare ses propres exception handlers dans `app/v1/exception_handlers.py`.
- Utiliser `HTTPException` de FastAPI pour les erreurs métier (404, 409, 422, 403).
- **NE JAMAIS** lever des exceptions Python brutes non gérées vers le client.

### Response types
- Le **election-service** utilise `success_response()` et `error_response()` du module `app/core/response_type.py`.
- Le **auth-service** utilise les helpers de `app/core/response_type.py` (`not_found_response_detail`, `conflict_response_detail`, `invalid_request_response_detail`, etc.).
- **NE PAS** inventer de nouveaux formats de réponse. Utiliser ceux qui existent.

---

## 6. Versioning des API

- Toutes les routes sont montées sous le préfixe `/api/v1` (election-service) ou `/app/v1` (auth-service).
- Le sub-application FastAPI est déclarée dans `app/v1/app.py` et montée dans `main.py`.
- **NE JAMAIS** ajouter de routes directement dans `main.py` (sauf `/` et `/up` qui sont des health checks).
- Si une nouvelle version d'API est nécessaire, créer un dossier `app/v2/` séparé.

---

## 7. Configuration & Variables d'environnement

- Utiliser `pydantic-settings` avec une classe `Settings` dans `app/core/config.py`.
- Toutes les valeurs sensibles (secrets, DSN de base de données, URL frontend) viennent de fichiers `.env`.
- **NE JAMAIS** hardcoder de secrets, mots de passe, clés API, ou URLs dans le code source.
- Le fichier `.env.example` doit être maintenu à jour avec toutes les variable requises.

---

## 8. Python — Bonnes pratiques

### Style de code
- Respecter les règles **Ruff** configurées dans `pyproject.toml` (`select = ["E", "F", "I"]`, `line-length = 100`).
- Utiliser les **type hints** sur toutes les signatures de fonctions et les retours.

### Async
- **NE JAMAIS** utiliser d'opérations bloquantes (sync) dans un endpoint async.
- Utiliser `await` pour tous les appels repository/service.


## 9. Tests

- Les tests sont dans le dossier `tests/` de chaque service.
- Utiliser **pytest** avec **pytest-asyncio** pour les tests async.
- Utiliser **factory-boy** et **Faker** pour la génération de données de test.
- Chaque nouveau endpoint doit avoir au moins un test de cas nominal et un test d'erreur.
- Les tests utilisent une base de données séparée (variables dans `.env.test`).

---

## 10. Sécurité

- **NE JAMAIS** logger ou exposer des mots de passe, tokens ou secrets dans les réponses.
- Valider strictement toutes les entrées via les schémas Pydantic.
- Utiliser CORS avec une liste blanche d'origines (`settings.FRONTEND_URL`), pas `allow_origins=["*"]` en production.
- Les cookies d'authentification doivent être `httpOnly`, `secure`, et `sameSite`.

---

## 11. Docker & Déploiement

- Chaque service a son propre `Dockerfile`.
- Le `compose.yaml` du auth-service orchestre les dépendances pour le développement local.
- Le `Makefile` à la racine du projet permet de lancer tous les services avec `make dev`.
- **NE JAMAIS** modifier les ports par défaut sans mettre à jour toute la chaîne (env, CORS, clients frontend).
