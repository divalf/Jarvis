# RUNBOOK (curto)
cd /root/.openclaw-mc/workspace/mission-control
source scripts/mc_init.sh
mc_health
mc_status
mc_cron_list_hb
python3 scripts/create_task.py --title "<TITULO>" --owner jarvis --priority med
python3 scripts/move_task.py --id T-YYYYMMDD-### --to review
python3 scripts/format_tasks.py --in-place
python3 scripts/dedupe_tasks.py mission_control/TASKS_DONE.md --dry-run
python3 scripts/dedupe_tasks.py mission_control/TASKS_DONE.md --in-place
