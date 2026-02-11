# Mission Control — Operação (guia rápido)

## Onde fica
Pasta:
- /root/.openclaw-mc/workspace/mission-control

Entrar:
- cd /root/.openclaw-mc/workspace/mission-control

## Inicializar (1 comando)
Sempre rode:
- source scripts/mc_init.sh

Testes rápidos:
- mc_health
- mc_cron_list_hb
- mc_status

## Como funciona (bem simples)
Colunas (arquivos):
- mission_control/TASKS_INBOX.md
- mission_control/TASKS_DOING.md
- mission_control/TASKS_REVIEW.md
- mission_control/TASKS_DONE.md
- mission_control/TASKS_BLOCKED.md

Fluxo:
1) Task nasce no INBOX
2) Jarvis triageia e move para DOING (define owner)
3) Especialista executa e move para REVIEW
4) Jarvis valida e move para DONE (ou devolve para DOING)
5) Se travar, mover para BLOCKED e explicar

## Padrão de log de status (auditoria)
Formato (sempre que uma task muda de coluna):
- [status YYYY-MM-DD HH:MM] from->to by=<agente>

Exemplo:
- [status 2026-02-08 17:29] inbox->doing by=jarvis

Observações:
- O script `scripts/move_task.py` já escreve nesse formato.
- Se quiser forçar o autor manualmente: use `--by devinho` (ou defina `MC_BY`).

## Criar uma task nova
Opção A (recomendada):
- python3 scripts/create_task.py --title "..." --owner jarvis --priority med

Opção B (atalho):
- mc_create_task "..." jarvis med

## Mover uma task
- python3 scripts/move_task.py --id T-YYYYMMDD-### --to review

Atalho:
- mc_move_task T-YYYYMMDD-### review

## Higienizar formatação (quando precisar)
- python3 scripts/format_tasks.py --in-place

## Automação (crons)
- Heartbeats a cada 30 min (Jarvis + 4 especialistas)
- Snapshot diário 08:00 (Jarvis): gera bloco para APPEND em memory/YYYY-MM-DD.md

Ver crons:
- mc_cron_list_hb

## Estado atual
- memory/WORKING.md

## Diário (auditoria)
- memory/YYYY-MM-DD.md
