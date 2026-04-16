# ==============================================================================
#  Choose - Makefile
# ==============================================================================

.DEFAULT_GOAL := help

# Couleurs ANSI (via printf)
CYAN   := \033[36m
GREEN  := \033[32m
YELLOW := \033[33m
BOLD   := \033[1m
RESET  := \033[0m

# Chemins
AUTH_DIR      := auth-service
ELECTION_DIR  := election-service
VOTE_DIR      := vote-service
FRONTEND_DIR  := frontend

# Ports
AUTH_PORT      := 8000
ELECTION_PORT  := 8001
VOTE_PORT      := 8002
FRONTEND_PORT  := 5173

# ==============================================================================
#  AIDE
# ==============================================================================

.PHONY: help
help:
	@printf "\n"
	@printf "$(CYAN)$(BOLD)================================================================$(RESET)\n"
	@printf "$(CYAN)$(BOLD)   Choose - Commandes Make$(RESET)\n"
	@printf "$(CYAN)$(BOLD)================================================================$(RESET)\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Demarrage$(RESET)\n"
	@printf "  $(BOLD)make dev$(RESET)                  Demarre TOUS les services en parallele\n"
	@printf "  $(BOLD)make dev-auth$(RESET)              auth-service       -> http://localhost:$(AUTH_PORT)  [Docker Compose]\n"
	@printf "  $(BOLD)make dev-election$(RESET)          election-service   -> http://localhost:$(ELECTION_PORT)  [uvicorn]\n"
	@printf "  $(BOLD)make dev-vote$(RESET)              vote-service       -> http://localhost:$(VOTE_PORT)  [uvicorn]\n"
	@printf "  $(BOLD)make dev-frontend$(RESET)          frontend           -> http://localhost:$(FRONTEND_PORT)  [vite]\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Docker$(RESET)\n"
	@printf "  $(BOLD)make auth-up$(RESET)               auth-service : docker compose up -d\n"
	@printf "  $(BOLD)make auth-down$(RESET)             auth-service : docker compose down\n"
	@printf "  $(BOLD)make auth-logs$(RESET)             auth-service : docker compose logs -f\n"
	@printf "  $(BOLD)make auth-build$(RESET)            auth-service : docker compose build\n"
	@printf "  $(BOLD)make auth-restart$(RESET)          auth-service : docker compose restart web\n"
	@printf "  $(BOLD)make vote-up$(RESET)               vote-service : docker compose up -d (RabbitMQ + Redis)\n"
	@printf "  $(BOLD)make vote-down$(RESET)             vote-service : docker compose down\n"
	@printf "  $(BOLD)make vote-logs$(RESET)             vote-service : docker compose logs -f\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Installation$(RESET)\n"
	@printf "  $(BOLD)make install$(RESET)               Installe toutes les dependances\n"
	@printf "  $(BOLD)make install-auth$(RESET)          uv sync            -- auth-service\n"
	@printf "  $(BOLD)make install-election$(RESET)      uv sync            -- election-service\n"
	@printf "  $(BOLD)make install-vote$(RESET)          uv sync            -- vote-service\n"
	@printf "  $(BOLD)make install-frontend$(RESET)      npm install        -- frontend\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Tests$(RESET)\n"
	@printf "  $(BOLD)make test$(RESET)                  Lance tous les tests Python\n"
	@printf "  $(BOLD)make test-auth$(RESET)             pytest             -- auth-service\n"
	@printf "  $(BOLD)make test-election$(RESET)         pytest             -- election-service\n"
	@printf "  $(BOLD)make test-vote$(RESET)             pytest             -- vote-service\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Lint & Format$(RESET)\n"
	@printf "  $(BOLD)make lint$(RESET)                  Lint tous les services\n"
	@printf "  $(BOLD)make lint-frontend$(RESET)         eslint             -- frontend\n"
	@printf "  $(BOLD)make format$(RESET)                Formate tous les services\n"
	@printf "  $(BOLD)make format-frontend$(RESET)       prettier           -- frontend\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Base de donnees$(RESET)\n"
	@printf "  $(BOLD)make migrate$(RESET)               alembic upgrade head (tous les services)\n"
	@printf "  $(BOLD)make migrate-auth$(RESET)          alembic upgrade head -- auth-service\n"
	@printf "  $(BOLD)make migrate-election$(RESET)      alembic upgrade head -- election-service\n"
	@printf "  $(BOLD)make migrate-vote$(RESET)          alembic upgrade head -- vote-service\n"
	@printf "  $(BOLD)make create-vote-db$(RESET)        Cree la base de donnees vote_service\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Build$(RESET)\n"
	@printf "  $(BOLD)make build$(RESET)                 Build production du frontend\n"
	@printf "\n"

# ==============================================================================
#  INSTALLATION
# ==============================================================================

.PHONY: install
install: install-auth install-election install-vote install-frontend
	@printf "$(GREEN)OK - Toutes les dependances sont installees.$(RESET)\n"

.PHONY: install-auth
install-auth:
	@printf "$(CYAN)-> [auth-service] uv sync...$(RESET)\n"
	cd $(AUTH_DIR) && uv sync

.PHONY: install-election
install-election:
	@printf "$(CYAN)-> [election-service] uv sync...$(RESET)\n"
	cd $(ELECTION_DIR) && uv sync

.PHONY: install-vote
install-vote:
	@printf "$(CYAN)-> [vote-service] uv sync...$(RESET)\n"
	cd $(VOTE_DIR) && uv sync

.PHONY: install-frontend
install-frontend:
	@printf "$(CYAN)-> [frontend] npm install...$(RESET)\n"
	cd $(FRONTEND_DIR) && npm install

.PHONY: reinstall
reinstall: reinstall-auth reinstall-election reinstall-vote install-frontend
	@printf "$(GREEN)OK - Reinstallation complete terminee.$(RESET)\n"

.PHONY: reinstall-auth
reinstall-auth:
	@printf "$(CYAN)-> [auth-service] suppression .venv + uv sync...$(RESET)\n"
	rm -rf $(AUTH_DIR)/.venv
	cd $(AUTH_DIR) && uv sync

.PHONY: reinstall-election
reinstall-election:
	@printf "$(CYAN)-> [election-service] suppression .venv + uv sync...$(RESET)\n"
	rm -rf $(ELECTION_DIR)/.venv
	cd $(ELECTION_DIR) && uv sync

.PHONY: reinstall-vote
reinstall-vote:
	@printf "$(CYAN)-> [vote-service] suppression .venv + uv sync...$(RESET)\n"
	rm -rf $(VOTE_DIR)/.venv
	cd $(VOTE_DIR) && uv sync

# ==============================================================================
#  DEVELOPPEMENT - Demarrage des services
# ==============================================================================

.PHONY: dev
dev:
	@printf "$(CYAN)-> Demarrage de tous les services...$(RESET)\n"
	@printf "$(YELLOW)   auth-service     -> http://localhost:$(AUTH_PORT)  [Docker Compose]$(RESET)\n"
	@printf "$(YELLOW)   election-service -> http://localhost:$(ELECTION_PORT)  [uvicorn]$(RESET)\n"
	@printf "$(YELLOW)   vote-service     -> http://localhost:$(VOTE_PORT)  [uvicorn + RabbitMQ + Redis]$(RESET)\n"
	@printf "$(YELLOW)   frontend         -> http://localhost:$(FRONTEND_PORT)  [vite]$(RESET)\n"
	$(MAKE) auth-up
	$(MAKE) vote-up
	$(MAKE) -j3 dev-election dev-vote dev-frontend

# auth-service : lance via Docker Compose (inclut FastAPI + Minio + Redis + Sendria)
.PHONY: dev-auth
dev-auth: auth-up

# ==============================================================================
#  DOCKER - auth-service
# ==============================================================================

.PHONY: auth-up
auth-up:
	@printf "$(CYAN)-> [auth-service] docker compose up -d...$(RESET)\n"
	cd $(AUTH_DIR) && docker compose up -d

.PHONY: auth-down
auth-down:
	@printf "$(CYAN)-> [auth-service] docker compose down...$(RESET)\n"
	cd $(AUTH_DIR) && docker compose down

.PHONY: auth-logs
auth-logs:
	@printf "$(CYAN)-> [auth-service] logs...$(RESET)\n"
	cd $(AUTH_DIR) && docker compose logs -f

.PHONY: auth-build
auth-build:
	@printf "$(CYAN)-> [auth-service] docker compose build...$(RESET)\n"
	cd $(AUTH_DIR) && docker compose build

.PHONY: auth-restart
auth-restart:
	@printf "$(CYAN)-> [auth-service] redemarrage du service web...$(RESET)\n"
	cd $(AUTH_DIR) && docker compose restart web

# ==============================================================================
#  DOCKER - vote-service (RabbitMQ + Redis)
# ==============================================================================

.PHONY: vote-up
vote-up:
	@printf "$(CYAN)-> [vote-service] docker compose up -d (RabbitMQ + Redis)...$(RESET)\n"
	cd $(VOTE_DIR) && docker compose up -d

.PHONY: vote-down
vote-down:
	@printf "$(CYAN)-> [vote-service] docker compose down...$(RESET)\n"
	cd $(VOTE_DIR) && docker compose down

.PHONY: vote-logs
vote-logs:
	@printf "$(CYAN)-> [vote-service] docker compose logs -f...$(RESET)\n"
	cd $(VOTE_DIR) && docker compose logs -f

# ==============================================================================
#  DEVELOPPEMENT - Services Python
# ==============================================================================

.PHONY: dev-election
dev-election:
	@printf "$(CYAN)-> [election-service] port $(ELECTION_PORT)...$(RESET)\n"
	cd $(ELECTION_DIR) && uv run uvicorn main:app --reload --host 0.0.0.0 --port $(ELECTION_PORT)

.PHONY: dev-vote
dev-vote:
	@printf "$(CYAN)-> [vote-service] port $(VOTE_PORT)...$(RESET)\n"
	cd $(VOTE_DIR) && uv run uvicorn main:app --reload --host 0.0.0.0 --port $(VOTE_PORT)

.PHONY: dev-frontend
dev-frontend:
	@printf "$(CYAN)-> [frontend] port $(FRONTEND_PORT)...$(RESET)\n"
	cd $(FRONTEND_DIR) && npm run dev

# ==============================================================================
#  TESTS
# ==============================================================================

.PHONY: test
test: test-auth test-election test-vote

.PHONY: test-auth
test-auth:
	@printf "$(CYAN)-> [auth-service] pytest...$(RESET)\n"
	cd $(AUTH_DIR) && uv run pytest

.PHONY: test-election
test-election:
	@printf "$(CYAN)-> [election-service] pytest...$(RESET)\n"
	cd $(ELECTION_DIR) && uv run pytest

.PHONY: test-vote
test-vote:
	@printf "$(CYAN)-> [vote-service] pytest...$(RESET)\n"
	cd $(VOTE_DIR) && uv run pytest

# ==============================================================================
#  LINT
# ==============================================================================

.PHONY: lint
lint: lint-auth lint-election lint-frontend

.PHONY: lint-frontend
lint-frontend:
	@printf "$(CYAN)-> [frontend] eslint...$(RESET)\n"
	cd $(FRONTEND_DIR) && npm run lint

# ==============================================================================
#  FORMAT
# ==============================================================================

.PHONY: format-frontend
format-frontend:
	@printf "$(CYAN)-> [frontend] prettier...$(RESET)\n"
	cd $(FRONTEND_DIR) && npm run format

# ==============================================================================
#  BASE DE DONNEES - Migrations Alembic
# ==============================================================================

.PHONY: migrate
migrate: migrate-auth migrate-election migrate-vote

.PHONY: migrate-auth
migrate-auth:
	@printf "$(CYAN)-> [auth-service] alembic upgrade head...$(RESET)\n"
	cd $(AUTH_DIR) && uv run alembic upgrade head

.PHONY: migrate-election
migrate-election:
	@printf "$(CYAN)-> [election-service] alembic upgrade head...$(RESET)\n"
	cd $(ELECTION_DIR) && uv run alembic upgrade head

.PHONY: migrate-vote
migrate-vote:
	@printf "$(CYAN)-> [vote-service] alembic upgrade head...$(RESET)\n"
	cd $(VOTE_DIR) && uv run alembic upgrade head

# Crée la base de données vote_service (si elle n'existe pas encore)
.PHONY: create-vote-db
create-vote-db:
	@printf "$(CYAN)-> Création de la base de données vote_service...$(RESET)\n"
	mysql -u root -e "CREATE DATABASE IF NOT EXISTS vote_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
	@printf "$(GREEN)OK - Base vote_service créée.$(RESET)\n"

# ==============================================================================
#  BUILD PRODUCTION
# ==============================================================================

.PHONY: build
build:
	@printf "$(CYAN)-> [frontend] build production...$(RESET)\n"
	cd $(FRONTEND_DIR) && npm run build