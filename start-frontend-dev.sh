#!/usr/bin/env bash

# Couleurs ANSI pour la console
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[1;35m'
BLUE='\033[1;34m'
GRAY='\033[0;90m'
RESET='\033[0m'

# Répertoire du script (racine du projet)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo -e "${BLUE}====================================================${RESET}"
echo -e "${BLUE}      Démarrage des applications frontend           ${RESET}"
echo -e "${BLUE}====================================================${RESET}\n"

# Tableau pour suivre les PIDs des processus enfants
PIDS=()

# Fonction de nettoyage lors de l'arrêt (Ctrl+C, etc.)
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt de toutes les applications frontend en cours...${RESET}"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
        fi
    done
    wait 2>/dev/null
    echo -e "${GREEN}✔ Toutes les applications frontend ont été arrêtées.${RESET}"
    exit 0
}

trap cleanup EXIT SIGINT SIGTERM

# Fonction pour démarrer une application avec préfixe et couleur sur les logs
run_app() {
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

# Lancement des applications frontend depuis la racine du projet
run_app "WEB-APP   " "clients/apps/web" "$CYAN" 3000
run_app "ADMIN-APP " "clients/apps/admin" "$MAGENTA" 3001

echo -e "\n${GREEN}✔ Toutes les applications frontend ont été démarrées !${RESET}"
echo -e "${GRAY}Appuyez sur Ctrl+C pour tout arrêter.${RESET}\n"

# Attente des processus d'arrière-plan
wait
