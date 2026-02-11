# create_task

Cria uma nova task e insere no `mission_control/TASKS_INBOX.md`.

## Uso

```bash
# via wrapper
scripts/create_task.sh --title "Minha task" --priority med

# com owner opcional (pode deixar vazio no INBOX)
scripts/create_task.sh --title "Corrigir X" --owner jarvis --priority high

# via python direto
python3 scripts/create_task.py --title "Minha task"
```

## Saída

Imprime o `id` gerado (ex.: `T-20260208-001`).

## Validação rápida

```bash
scripts/create_task.sh --title "(teste) task dummy" --priority low
sed -n '1,120p' mission_control/TASKS_INBOX.md
```
