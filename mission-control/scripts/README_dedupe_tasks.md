# dedupe_tasks.py — deduplicar tasks por id

Este repositório usa arquivos `mission_control/TASKS_*.md` com blocos “YAML-ish” que começam com `- id:`.
Com o tempo, podem surgir tasks duplicadas (mesmo `id`) no mesmo arquivo. Este script resolve isso.

## O que ele faz

- Lê um arquivo `TASKS_*.md`.
- Identifica blocos que começam com `- id:`.
- Agrupa por `id`.
- Quando existem múltiplos blocos com o mesmo `id`, faz **merge** e mantém **um único bloco**.

Por padrão roda em **dry-run** (não escreve).

## Como rodar

Dry-run (padrão):

```bash
python3 scripts/dedupe_tasks.py mission_control/TASKS_DONE.md
```

Aplicar no arquivo (escreve em disco):

```bash
python3 scripts/dedupe_tasks.py --in-place mission_control/TASKS_DONE.md
```

Dica: valide a sintaxe do script:

```bash
python3 -m py_compile scripts/dedupe_tasks.py
```

## Regra de merge (como ele decide o que fica)

Quando há duplicatas do mesmo `id`, o script faz um merge **tentando preservar o máximo de informação**:

1) **Escolha de base (“versão mais completa”)**
- O bloco base é o que tem mais conteúdo (proxy: mais linhas não vazias; desempate por mais caracteres).
- Se ainda empatar, desempata por `updated_at` mais recente.

2) **Campos escalares (ex.: `title`, `owner`, `status`, `priority`, `created_at`, `updated_at`)**
- O merge tenta manter todos os campos.
- Se houver conflito (valores diferentes para o mesmo campo), vence o valor do bloco com `updated_at` **mais recente**.
- Se `updated_at` estiver ausente ou inválido, o bloco base tende a prevalecer.

3) **Listas (ex.: `context`, `subtasks`, `acceptance_criteria`, `deliverables`, `dependencies`)**
- Concatena os itens preservando ordem:
  - Para listas comuns: base primeiro, depois os itens dos outros blocos.
  - Para `log`: concatena em ordem de recência (do mais antigo para o mais novo), para manter uma linha do tempo mais natural.
- Remove duplicatas por comparação **exata** da linha (mesmo texto = não duplica).

4) **Logs (`log`)**
- Sempre concatena.
- Remove linhas idênticas (exatamente iguais).

5) **Linhas extras/desconhecidas**
- Mantém as linhas extras do bloco base.
- Acrescenta linhas extras únicas (não vazias) vindas dos outros blocos.

## Formatação de saída

Ao escrever, o script também normaliza:
- 1 linha em branco logo após `## Tasks`.
- 1 linha em branco entre tasks.

(sem tentar reformatar conteúdo interno além do necessário para renderizar o merge)
