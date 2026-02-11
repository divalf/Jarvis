#!/usr/bin/env bash
# Inicializa o ambiente do Mission Control no shell atual.
# Uso:
#   source scripts/mc_init.sh
set -euo pipefail

cd /root/.openclaw-mc/workspace/mission-control

# Carrega URL/senha do gateway
source .mc_env

# Carrega comandos auxiliares
source scripts/mc.sh

echo "[mc_init] OK. Tente: mc_health | mc_cron_list_hb | mc_status"
