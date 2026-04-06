# ==============================================================================
#  Choose2 - Makefile racine
#  Services : auth-service | election-service | frontend
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
FRONTEND_DIR  := frontend

# Ports
AUTH_PORT      := 8000
ELECTION_PORT  := 8001
FRONTEND_PORT  := 5173

# ==============================================================================
#  AIDE
# ==============================================================================

.PHONY: help
help:
	@printf "\n"
	@printf "$(CYAN)$(BOLD)================================================================$(RESET)\n"
	@printf "$(CYAN)$(BOLD)   Choose2 - Commandes Make$(RESET)\n"
	@printf "$(CYAN)$(BOLD)================================================================$(RESET)\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Demarrage$(RESET)\n"
	@printf "  $(BOLD)make dev$(RESET)                  Demarre TOUS les services en parallele\n"
	@printf "  $(BOLD)make dev-auth$(RESET)              auth-service       -> http://localhost:$(AUTH_PORT)  [Docker Compose]\n"
	@printf "  $(BOLD)make dev-election$(RESET)          election-service   -> http://localhost:$(ELECTION_PORT)  [uvicorn]\n"
	@printf "  $(BOLD)make dev-frontend$(RESET)          frontend           -> http://localhost:$(FRONTEND_PORT)  [vite]\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Docker (auth-service)$(RESET)\n"
	@printf "  $(BOLD)make auth-up$(RESET)               docker compose up -d (detache)\n"
	@printf "  $(BOLD)make auth-down$(RESET)             docker compose down\n"
	@printf "  $(BOLD)make auth-logs$(RESET)             docker compose logs -f\n"
	@printf "  $(BOLD)make auth-build$(RESET)            docker compose build\n"
	@printf "  $(BOLD)make auth-restart$(RESET)          docker compose restart web"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Installation$(RESET)\n"
	@printf "  $(BOLD)make install$(RESET)               Installe toutes les dependances\n"
	@printf "  $(BOLD)make install-auth$(RESET)          uv sync            -- auth-service\n"
	@printf "  $(BOLD)make install-election$(RESET)      uv sync            -- election-service\n"
	@printf "  $(BOLD)make install-frontend$(RESET)      npm install        -- frontend\n"
	@printf "  $(BOLD)make reinstall$(RESET)             Reinstalle tout    (supprime les .venv)\n"
	@printf "  $(BOLD)make reinstall-auth$(RESET)        Supprime .venv + reinstalle auth-service\n"
	@printf "  $(BOLD)make reinstall-election$(RESET)    Supprime .venv + reinstalle election-service\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Tests$(RESET)\n"
	@printf "  $(BOLD)make test$(RESET)                  Lance tous les tests Python\n"
	@printf "  $(BOLD)make test-auth$(RESET)             pytest             -- auth-service\n"
	@printf "  $(BOLD)make test-election$(RESET)         pytest             -- election-service\n"
	@printf "  $(BOLD)make test-auth-cov$(RESET)         pytest + coverage  -- auth-service\n"
	@printf "  $(BOLD)make test-election-cov$(RESET)     pytest + coverage  -- election-service\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Lint & Format$(RESET)\n"
	@printf "  $(BOLD)make lint$(RESET)                  Lint tous les services\n"
	@printf "  $(BOLD)make lint-auth$(RESET)             ruff check         -- auth-service\n"
	@printf "  $(BOLD)make lint-election$(RESET)         ruff check         -- election-service\n"
	@printf "  $(BOLD)make lint-frontend$(RESET)         eslint             -- frontend\n"
	@printf "  $(BOLD)make format$(RESET)                Formate tous les services\n"
	@printf "  $(BOLD)make format-auth$(RESET)           ruff format        -- auth-service\n"
	@printf "  $(BOLD)make format-election$(RESET)       ruff format        -- election-service\n"
	@printf "  $(BOLD)make format-frontend$(RESET)       prettier           -- frontend\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Base de donnees$(RESET)\n"
	@printf "  $(BOLD)make migrate$(RESET)               alembic upgrade head (les 2 services)\n"
	@printf "  $(BOLD)make migrate-auth$(RESET)          alembic upgrade head -- auth-service\n"
	@printf "  $(BOLD)make migrate-election$(RESET)      alembic upgrade head -- election-service\n"
	@printf "  $(BOLD)make migration-auth MSG=\"...\"$(RESET)    Nouvelle migration -- auth-service\n"
	@printf "  $(BOLD)make migration-election MSG=\"...\"$(RESET) Nouvelle migration -- election-service\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Build$(RESET)\n"
	@printf "  $(BOLD)make build$(RESET)                 Build production du frontend\n"
	@printf "\n"
	@printf "$(GREEN)$(BOLD)>> Nettoyage$(RESET)\n"
	@printf "  $(BOLD)make clean$(RESET)                 Supprime __pycache__, .pytest_cache, dist\n"
	@printf "  $(BOLD)make clean-venv$(RESET)            Supprime les .venv (si corrompus)\n"
	@printf "\n"

# ==============================================================================
#  INSTALLATION
# ==============================================================================

.PHONY: install
install: install-auth install-election install-frontend
	@printf "$(GREEN)OK - Toutes les dependances sont installees.$(RESET)\n"

.PHONY: install-auth
install-auth:
	@printf "$(CYAN)-> [auth-service] uv sync...$(RESET)\n"
	cd $(AUTH_DIR) && uv sync

.PHONY: install-election
install-election:
	@printf "$(CYAN)-> [election-service] uv sync...$(RESET)\n"
	cd $(ELECTION_DIR) && uv sync

.PHONY: install-frontend
install-frontend:
	@printf "$(CYAN)-> [frontend] npm install...$(RESET)\n"
	cd $(FRONTEND_DIR) && npm install

.PHONY: reinstall
reinstall: reinstall-auth reinstall-election install-frontend
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

# ==============================================================================
#  DEVELOPPEMENT - Demarrage des services
# ==============================================================================

.PHONY: dev
dev:
	@printf "$(CYAN)-> Demarrage de tous les services...$(RESET)\n"
	@printf "$(YELLOW)   auth-service     -> http://localhost:$(AUTH_PORT)  [Docker Compose]$(RESET)\n"
	@printf "$(YELLOW)   election-service -> http://localhost:$(ELECTION_PORT)  [uvicorn]$(RESET)\n"
	@printf "$(YELLOW)   frontend         -> http://localhost:$(FRONTEND_PORT)  [vite]$(RESET)\n"
	$(MAKE) -j2 dev-election dev-frontend
	$(MAKE) auth-up

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

.PHONY: dev-election
dev-election:
	@printf "$(CYAN)-> [election-service] port $(ELECTION_PORT)...$(RESET)\n"
	cd $(ELECTION_DIR) && uv run uvicorn main:app --reload --host 0.0.0.0 --port $(ELECTION_PORT)

.PHONY: dev-frontend
dev-frontend:
	@printf "$(CYAN)-> [frontend] port $(FRONTEND_PORT)...$(RESET)\n"
	cd $(FRONTEND_DIR) && npm run dev

# ==============================================================================
#  TESTS
# ==============================================================================

.PHONY: test
test: test-auth test-election

.PHONY: test-auth
test-auth:
	@printf "$(CYAN)-> [auth-service] pytest...$(RESET)\n"
	cd $(AUTH_DIR) && uv run pytest

.PHONY: test-election
test-election:
	@printf "$(CYAN)-> [election-service] pytest...$(RESET)\n"
	cd $(ELECTION_DIR) && uv run pytest

.PHONY: test-auth-cov
test-auth-cov:
	@printf "$(CYAN)-> [auth-service] pytest + coverage...$(RESET)\n"
	cd $(AUTH_DIR) && uv run pytest --cov=app --cov-report=term-missing

.PHONY: test-election-cov
test-election-cov:
	@printf "$(CYAN)-> [election-service] pytest + coverage...$(RESET)\n"
	cd $(ELECTION_DIR) && uv run pytest --cov=app --cov-report=term-missing

# ==============================================================================
#  LINT
# ==============================================================================

.PHONY: lint
lint: lint-auth lint-election lint-frontend

.PHONY: lint-auth
lint-auth:
	@printf "$(CYAN)-> [auth-service] ruff check...$(RESET)\n"
	cd $(AUTH_DIR) && uv run ruff check .

.PHONY: lint-election
lint-election:
	@printf "$(CYAN)-> [election-service] ruff check...$(RESET)\n"
	cd $(ELECTION_DIR) && uv run ruff check .

.PHONY: lint-frontend
lint-frontend:
	@printf "$(CYAN)-> [frontend] eslint...$(RESET)\n"
	cd $(FRONTEND_DIR) && npm run lint

# ==============================================================================
#  FORMAT
# ==============================================================================

.PHONY: format
format: format-auth format-election format-frontend

.PHONY: format-auth
format-auth:
	@printf "$(CYAN)-> [auth-service] ruff format...$(RESET)\n"
	cd $(AUTH_DIR) && uv run ruff format .

.PHONY: format-election
format-election:
	@printf "$(CYAN)-> [election-service] ruff format...$(RESET)\n"
	cd $(ELECTION_DIR) && uv run ruff format .

.PHONY: format-frontend
format-frontend:
	@printf "$(CYAN)-> [frontend] prettier...$(RESET)\n"
	cd $(FRONTEND_DIR) && npm run format

# ==============================================================================
#  BASE DE DONNEES - Migrations Alembic
# ==============================================================================

.PHONY: migrate
migrate: migrate-auth migrate-election

.PHONY: migrate-auth
migrate-auth:
	@printf "$(CYAN)-> [auth-service] alembic upgrade head...$(RESET)\n"
	cd $(AUTH_DIR) && uv run alembic upgrade head

.PHONY: migrate-election
migrate-election:
	@printf "$(CYAN)-> [election-service] alembic upgrade head...$(RESET)\n"
	cd $(ELECTION_DIR) && uv run alembic upgrade head

.PHONY: migration-auth
migration-auth:
	cd $(AUTH_DIR) && uv run alembic revision --autogenerate -m "$(MSG)"

.PHONY: migration-election
migration-election:
	cd $(ELECTION_DIR) && uv run alembic revision --autogenerate -m "$(MSG)"

# ==============================================================================
#  BUILD PRODUCTION
# ==============================================================================

.PHONY: build
build:
	@printf "$(CYAN)-> [frontend] build production...$(RESET)\n"
	cd $(FRONTEND_DIR) && npm run build

# ==============================================================================
#  NETTOYAGE
# ==============================================================================

.PHONY: clean
clean:
	@printf "$(CYAN)-> Nettoyage...$(RESET)\n"
	find $(AUTH_DIR) -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find $(ELECTION_DIR) -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find $(AUTH_DIR) -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find $(ELECTION_DIR) -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf $(FRONTEND_DIR)/dist 2>/dev/null || true
	@printf "$(GREEN)OK - Nettoyage termine.$(RESET)\n"

.PHONY: clean-venv
clean-venv:
	@printf "$(CYAN)-> Suppression des .venv...$(RESET)\n"
	rm -rf $(AUTH_DIR)/.venv
	rm -rf $(ELECTION_DIR)/.venv
	@printf "$(GREEN)OK - .venv supprimes. Relancez 'make install' pour les recreer.$(RESET)\n"
