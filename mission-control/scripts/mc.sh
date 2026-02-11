#!/usr/bin/env bash
set -euo pipefail

# Mission Control helpers (instância openclaw-mc)
#
# Uso:
#   cd /root/.openclaw-mc/workspace/mission-control
#   source .mc_env
#   source scripts/mc.sh
#
# Requer (para comandos do gateway):
#   MC_URL
#   OPENCLAW_GATEWAY_PASSWORD   (a CLI respeita por env; flags --password podem não funcionar)

mc_require_env() {
  : "${MC_URL:?Defina MC_URL (ex.: ws://127.0.0.1:18790)}"
  : "${OPENCLAW_GATEWAY_PASSWORD:?Defina OPENCLAW_GATEWAY_PASSWORD (senha do gateway MC)}"
}

mc_cd() {
  cd /root/.openclaw-mc/workspace/mission-control
}

mc_health() {
  mc_require_env
  openclaw gateway health --url "$MC_URL"
}

mc_cron_list() {
  mc_require_env
  openclaw gateway call cron.list --url "$MC_URL" --timeout 300000 --params '{"includeDisabled":true}'
}

mc_cron_list_hb() {
  mc_require_env
  mc_cron_list | grep -E '"name": "(hb-jarvis-30m|hb-(devinho|desire|analise|copinho)-60m|daily-snapshot-kanban-0800)"|everyMs|enabled|nextRunAtMs' -A 2

  echo
  echo "== GO-LIVE: watchdog (últimos logs) =="
  journalctl -u mc-watch-ls-invalid.service --since "6 hours ago" --no-pager | tail -n 40
}

mc_health_main() {
  # Health do gateway principal (18789) usando token direto do config
  local token
  token="$(python3 - <<'PY'
import json
print(json.load(open("/root/.openclaw/openclaw.json"))["gateway"]["auth"]["token"])
PY
)"
  OPENCLAW_GATEWAY_TOKEN="$token" openclaw gateway health --url ws://127.0.0.1:18789
}

mc_golive() {
  echo "== GO-LIVE: serviços =="
  systemctl is-active openclaw openclaw-mc mc-watch-ls-invalid.timer || true

  echo
  echo "== GO-LIVE: health principal (18789) =="
  mc_health_main

  echo
  echo "== GO-LIVE: health MC + kanban =="
  mc_health
  mc_status

  echo
  echo "== GO-LIVE: crons essenciais (MC) =="
  openclaw gateway call cron.list --url "$MC_URL" --timeout 300000 --params '{"includeDisabled":true}' \
    | grep -E '"name": "(hb-jarvis-30m|hb-(devinho|desire|analise|copinho)-60m|daily-snapshot-kanban-0800)"|everyMs|enabled|nextRunAtMs' -A 2

  echo
  echo "== GO-LIVE: watchdog (últimos logs) =="
  journalctl -u mc-watch-ls-invalid.service --since "6 hours ago" --no-pager | tail -n 40
}
