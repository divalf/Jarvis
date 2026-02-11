# move_task

Move uma task (por id) entre as colunas do Kanban baseado em arquivos `mission_control/TASKS_*.md`.

## O que ele faz

- Encontra a task em **exatamente um** dos arquivos:
  - `TASKS_INBOX.md`
  - `TASKS_DOING.md`
  - `TASKS_REVIEW.md`
  - `TASKS_DONE.md`
  - `TASKS_BLOCKED.md`
- Remove o bloco da task do arquivo de origem
- Insere o bloco no topo do arquivo de destino
- Atualiza dentro do bloco:
  - `status: <destino>`
  - `updated_at: "YYYY-MM-DD"`
  - adiciona no `log:` a linha: `"[status YYYY-MM-DD] <from>-><to>"`

## Uso

```bash
python3 scripts/move_task.py --id T-20260208-006 --to review
```

### Flags

- `--id` (obrigatório): id da task (ex.: `T-20260208-006`)
- `--to` (obrigatório): destino (`inbox|doing|review|done|blocked`)
- `--owner` (opcional): sobrescreve `owner` no bloco movido (use string vazia para limpar)

## Validação

```bash
python3 -m py_compile scripts/move_task.py
```

## Exemplos (2)

### 1) DOING -> REVIEW

```bash
python3 scripts/move_task.py --id T-20260208-006 --to review
```

Efeito esperado no `log:` da task:

- adiciona uma linha no final:
  - `"[status 2026-02-08] doing->review"`

### 2) REVIEW -> DONE (ajustando owner)

```bash
python3 scripts/move_task.py --id T-20260207-002 --to done --owner devinho
```

## Observações

- O script preserva o cabeçalho do arquivo e re-renderiza a seção `## Tasks` de forma determinística:
  - 1 linha em branco após `## Tasks`
  - tasks separadas por 1 linha em branco
  - `INBOX` vazio volta a mostrar `- (vazio)`
- Se a task não tiver `log:`, o script cria `log:` no final do bloco e adiciona a linha de status.
