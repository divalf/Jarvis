# AGENTS — Manual Operacional (Mission Control)

## Fonte de verdade
- Kanban:
  - mission_control/TASKS_INBOX.md
  - mission_control/TASKS_DOING.md
  - mission_control/TASKS_REVIEW.md
  - mission_control/TASKS_DONE.md
  - mission_control/TASKS_BLOCKED.md
- Estado atual: memory/WORKING.md
- Registro: mission_control/ACTIVITY_LOG.md

## Regras simples (leigo-friendly)
1) Toda tarefa entra no INBOX.
2) Jarvis pega do INBOX, define dono (owner) e move para DOING.
3) O especialista executa, atualiza o log e move para REVIEW.
4) Jarvis valida e move para DONE (ou devolve para DOING).
5) Se travar, move para BLOCKED e explica o que falta.
