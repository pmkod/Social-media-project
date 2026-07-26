#!/usr/bin/env bash

# Couleurs ANSI pour la console
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[1;35m'
RED='\033[1;31m'
BLUE='\033[1;34m'
GRAY='\033[0;90m'
RESET='\033[0m'

# Répertoire du script (backend/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo -e "${BLUE}====================================================${RESET}"
echo -e "${BLUE}   Démarrage de l'API Gateway et des Microservices  ${RESET}"
echo -e "${BLUE}====================================================${RESET}\n"

# Tableau pour suivre les PIDs des processus enfants
PIDS=()

# Fonction de nettoyage lors de l'arrêt (Ctrl+C, etc.)
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt de tous les services en cours...${RESET}"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
        fi
    done
    wait 2>/dev/null
    echo -e "${GREEN}✔ Tous les services ont été arrêtés.${RESET}"
    exit 0
}

trap cleanup EXIT SIGINT SIGTERM

# Fonction pour démarrer un service avec préfixe et couleur sur les logs
run_service() {
    local name="$1"
    local dir="$2"
    local color="$3"
    local port="$4"

    echo -e "${color}🚀 Lancement de ${name}${RESET} (Port ${port}) depuis ./${dir}"

    (
        cd "$dir" || exit 1
        FORCE_COLOR=1 bun run dev 2>&1 | while IFS= read -r line; do
            echo -e "${color}[${name}]${RESET} ${line}"
        done
    ) &

    PIDS+=($!)
}

# Lancement des microservices et de l'API Gateway depuis backend/
run_service "USER-SERVICE   " "services/user" "$CYAN" 8001
run_service "CONTENT-SERVICE" "services/content" "$GREEN" 8002
run_service "API-GATEWAY    " "gateway" "$MAGENTA" 8000

echo -e "\n${GREEN}✔ Tous les services ont été démarrés !${RESET}"
echo -e "${GRAY}Appuyez sur Ctrl+C pour tout arrêter.${RESET}\n"

# Attente des processus d'arrière-plan
wait
