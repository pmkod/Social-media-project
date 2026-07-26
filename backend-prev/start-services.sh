#!/usr/bin/env bash

# =============================================================================
# Démarrage des microservices backend
# =============================================================================
# Ce script se positionne dans chaque dossier de service et lance :
#   bun run dev
#
# Usage : ./start-services.sh
# Arrêt : Ctrl+C pour tout arrêter proprement
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Couleurs pour les logs
# -----------------------------------------------------------------------------
readonly RESET='\033[0m'
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'

log() {
	local color="$1"
	local label="$2"
	shift 2
	printf "${color}[%-12s]${RESET} %s\n" "$label" "$*"
}

info() { log "$BLUE" "INFO" "$@"; }
success() { log "$GREEN" "OK" "$@"; }
warn() { log "$YELLOW" "WARN" "$@"; }
error() { log "$RED" "ERROR" "$@"; }
step() { log "$CYAN" "STEP" "$@"; }

# -----------------------------------------------------------------------------
# Répertoire racine du backend
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

info "Démarrage depuis : $SCRIPT_DIR"

# -----------------------------------------------------------------------------
# Vérification des prérequis
# -----------------------------------------------------------------------------
step "Vérification des prérequis"

command -v bun >/dev/null 2>&1 || {
	error "Bun n'est pas installé (https://bun.sh)"
	exit 1
}

success "Prérequis OK (bun)"

# -----------------------------------------------------------------------------
# Gestion de l'arrêt propre
# -----------------------------------------------------------------------------
PIDS=()

stop_all() {
	warn "Arrêt des services en cours..."

	for pid in "${PIDS[@]}"; do
		if kill -0 "$pid" 2>/dev/null; then
			kill "$pid" 2>/dev/null || true
		fi
	done

	success "Tous les services ont été arrêtés"
	exit 0
}

trap stop_all SIGINT SIGTERM EXIT

# -----------------------------------------------------------------------------
# Démarrage des microservices backend
# -----------------------------------------------------------------------------
step "Démarrage des microservices backend"

start_backend_service() {
	local service="$1"
	local service_dir="$SCRIPT_DIR/services/$service"

	info "Démarrage de $service..."
	(
		cd "$service_dir"
		bun run dev
	) &
	local pid=$!
	PIDS+=("$pid")
	success "$service lancé (PID: $pid)"
}

start_backend_service "authentication-service"
start_backend_service "user-service"
start_backend_service "content-service"

# -----------------------------------------------------------------------------
# Récapitulatif
# -----------------------------------------------------------------------------
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🚀 Microservices backend en cours d'exécution             ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║  Auth Service    : http://localhost:8081                       ║"
echo "║  User Service    : http://localhost:8082                       ║"
echo "║  Content Service : http://localhost:8083                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
info "Appuyez sur Ctrl+C pour arrêter tous les services"
echo ""

# -----------------------------------------------------------------------------
# Attendre la fin de tous les processus
# -----------------------------------------------------------------------------
wait
