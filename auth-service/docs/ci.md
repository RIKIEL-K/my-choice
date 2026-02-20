# CI Pipeline — auth-service

Fichier : `.github/workflows/ci.yml`  
Déclenché sur chaque **push** ou **PR** vers `main` ou `develop`.

## Étapes

### 1. Services — PostgreSQL
```yaml
services:
  postgres:
    image: postgres:17
```
L'app utilise PostgreSQL — les tests d'intégration ont besoin d'une vraie base de données. Le healthcheck `pg_isready` garantit que PostgreSQL est prêt avant les migrations.

---

### 2. Start Sendria
```bash
docker run -d msztolcman/sendria:v2.2.2.0
```
**Sendria** est un faux serveur SMTP. Il capte tous les emails envoyés par les tests (vérification d'email, reset de mot de passe) sans les envoyer réellement. L'app pointe sur `localhost:1025`.

---

### 3. Install + Start MinIO
```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
nohup minio server /tmp/minio-data ...
```
**MinIO** est un serveur de stockage objet compatible S3. Nécessaire pour que les tests qui upload/suppriment des fichiers aient un vrai backend S3 à disposition. Sans ça, les appels `boto3` échoueraient.

---

### 4. Create MinIO bucket
```bash
docker run minio/mc -c "mc mb local/fastapi-app-test"
```
MinIO ne crée pas les buckets automatiquement. Le client `mc` crée `fastapi-app-test` avant que les tests tournent.

---

### 5. Setup environment
```bash
sudo apt-get install -y curl g++ wget ffmpeg ...
curl -LsSf https://astral.sh/uv/install.sh | sh
```
Installe `uv` — le package manager Python ultra-rapide qui remplace pip/poetry.

---

### 6. Install dependencies
```bash
uv pip install .
uv pip install --group dev
```
Installe les dépendances de prod et de dev depuis `pyproject.toml`.

---

### 7. Execute init.sql + Alembic migrations
```bash
psql -f ./docker/init.sql
alembic upgrade head
```
`init.sql` crée les rôles/schemas PostgreSQL de base. Alembic applique ensuite les migrations pour que le schéma de la DB de test soit à jour.

---

### 8. pytest --cov
```bash
pytest --cov=app --cov-report=html
```
Lance tous les tests avec rapport de couverture HTML, uploadé comme artifact GitHub sur chaque run.

---

### 9. ruff + mypy + pylint

| Outil | Rôle | Bloquant ? |
|---|---|---|
| `ruff check .` | Linting rapide (style, erreurs) | ✅ Oui |
| `mypy` | Vérification statique des types | ✅ Oui |
| `pylint` | Analyse qualité approfondie | ❌ Non (`continue-on-error: true`) |

Pylint est non-bloquant car très strict — il sert d'indicateur de qualité sans casser le pipeline.
