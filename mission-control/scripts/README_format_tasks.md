# format_tasks.py — Normalizador dos TASKS_*.md

Este script normaliza a formatação dos arquivos `mission_control/TASKS_*.md` para evitar que blocos de tasks fiquem colados ou iniciem de forma malformada.

## O que ele garante

Dentro da seção `## Tasks`:

- **1 linha em branco entre blocos de tasks** (cada task é um “bloco”).
- **Cada bloco começa com `- id:` na coluna 0**.
- **Conserta linhas onde o início da task ficou colado com lixo**, por exemplo:

```text
34-- id: T-20260208-007
```

vira:

```text
- id: T-20260208-007
```

> Observação: o script não “valida” o conteúdo YAML-ish; ele apenas organiza a casca (separação e começo do bloco).

## Como usar

### Formatar e sobrescrever os arquivos (recomendado)

Na raiz do repo:

```bash
python3 scripts/format_tasks.py --in-place
```

### Só imprimir o resultado (sem escrever)

```bash
python3 scripts/format_tasks.py
```

### Formatar paths específicos (glob)

```bash
python3 scripts/format_tasks.py --in-place --path mission_control/TASKS_REVIEW.md
python3 scripts/format_tasks.py --in-place --path 'mission_control/TASKS_*.md'
```

## Validação

```bash
python3 -m py_compile scripts/format_tasks.py
```
