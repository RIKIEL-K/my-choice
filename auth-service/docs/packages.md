# Packages Python — auth-service

## Production

| Package | Rôle |
|---|---|
| **fastapi** | Framework web asynchrone. Gère les routes, middlewares et dépendances (DI). |
| **uvicorn** | Serveur ASGI. Lance l'app FastAPI en production et en dev. |
| **pydantic / pydantic-settings** | Validation des données (schemas Pydantic) et chargement typé des variables d'environnement. |
| **python-dotenv** | Charge le fichier `.env` en variables d'environnement au démarrage. |
| **sqlalchemy** | ORM async pour interagir avec PostgreSQL. Définit les modèles `User` et `OAuthAccount`. |
| **asyncpg** | Driver PostgreSQL asynchrone, utilisé par SQLAlchemy avec `postgresql+asyncpg://`. |
| **alembic** | Gestion des migrations de schéma de base de données (version control du DB). |
| **fastapi-users** | Librairie complète d'authentification : inscription, login, reset mot de passe, vérification email, OAuth. Fournit les routers et le `BaseUserManager`. |
| **fastapi-users-db-sqlalchemy** | Adaptateur entre `fastapi-users` et SQLAlchemy — fournit `SQLAlchemyBaseUserTableUUID` et `SQLAlchemyUserDatabase`. |
| **fastapi-mail** | Envoi d'emails transactionnels (vérification, reset password) avec templates HTML Jinja2. |
| **aioredis** | Client Redis asynchrone — utilisé pour le cache ou les sessions. |
| **boto3** | SDK AWS officiel — ici utilisé pour MinIO (S3-compatible) : upload/delete/presigned URLs des fichiers utilisateurs. |
| **httpx** | Client HTTP async — utilisé dans les tests et pour des appels inter-services. |
| **aiohttp** | Client HTTP async alternatif, utilisé en interne par certains composants OAuth. |
| **hashids** | Encode les IDs numériques en chaînes courtes non-séquentielles (évite l'exposition des IDs DB en clair dans les URLs). |
| **cryptography** | Chiffrement bas niveau — signe les tokens JWT et les cookies. |
| **python-multipart** | Parse les formulaires `multipart/form-data` (upload de fichiers). |
| **websockets** | Support WebSocket. |
| **aiofiles / aioshutil** | Manipulation de fichiers de façon asynchrone. |
| **stripe** | SDK Stripe pour les paiements. |
| **ulid-py** | Génère des ULIDs (identifiants uniques triables temporellement). |
| **tqdm** | Barres de progression pour les scripts en ligne de commande. |
| **colorama** | Colore la sortie terminal (cross-platform). |

## Dev uniquement

| Package | Rôle |
|---|---|
| **pytest** | Framework de tests unitaires. |
| **pytest-asyncio** | Permet d'écrire des tests async avec pytest. |
| **pytest-cov** | Génère les rapports de couverture de tests. |
| **pytest-dotenv** | Charge `.env.test` automatiquement dans les tests. |
| **pytest-xdist** | Exécution des tests en parallèle. |
| **factory-boy / pytest-factoryboy** | Génération de données de test (factories pour les modèles DB). |
| **faker** | Génère des données aléatoires réalistes (noms, emails...) pour les tests. |
| **freezegun** | "Gèle" le temps dans les tests (logique de lock expiry, tokens). |
| **ruff** | Linter Python ultra-rapide (remplace flake8 + isort). |
| **pylint** | Linter statique complet — analyse la qualité du code. |
| **mypy** | Vérification statique des types Python. |
| **black / autopep8** | Formateurs automatiques du code Python. |
| **jupyter / ipykernel** | Notebooks Jupyter pour l'exploration et le debug. |
| **boto3-stubs** | Types mypy pour boto3 (intellisense S3). |
