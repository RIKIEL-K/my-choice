# Choose2 — Plateforme de vote étudiant

| Service | Port | Stack |
|---|---|---|
| `auth-service` | 8000 | FastAPI · PostgreSQL · Redis · Minio |
| `election-service` | 8001 | FastAPI · MySQL |
| `frontend` | 5173 | React · Vite · TypeScript |

---

## Démarrage

```bash
make dev              # Lance tous les services
make auth-up          # auth-service uniquement  (Docker Compose)
make dev-election     # election-service uniquement (uvicorn)
make dev-frontend     # frontend uniquement (vite)
```

## Installation

```bash
make install          # Installe toutes les dépendances
make reinstall        # Réinstalle tout (utile si .venv corrompu)
```

## Docker — auth-service

```bash
make auth-logs        # Suivre les logs en direct
make auth-down        # Arrêter les conteneurs
make auth-restart     # Redémarrer uniquement le service web
```

## Qualité & Tests

```bash
make test             # Lance tous les tests
make lint             # Lint (ruff + eslint)
make format           # Formate tout (ruff + prettier)
```

> `make help` pour voir toutes les commandes disponibles.