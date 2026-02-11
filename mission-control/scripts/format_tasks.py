#!/usr/bin/env python3
"""format_tasks.py

Normaliza a formatação dos arquivos mission_control/TASKS_*.md.

Objetivos:
- Garantir exatamente 1 linha em branco entre blocos de tasks.
- Garantir que cada bloco de task comece com "- id:" na coluna 0.
- Consertar linhas onde o "- id:" ficou colado com lixo (ex.: "34-- id:") sem perder
  o restante da linha.

O formato é "YAML-ish" dentro da seção "## Tasks"; este script não tenta validar o
conteúdo, apenas normalizar a estrutura externa.
"""

from __future__ import annotations

import argparse
import glob
import os
import re
import sys
from dataclasses import dataclass
from typing import Iterable, List, Optional


TASKS_SECTION_RE = re.compile(r"^##\s+Tasks\s*$")
NEXT_SECTION_RE = re.compile(r"^##\s+\S")

# Detecta linhas que (mesmo malformadas) indicam o início de uma task.
# Exemplos aceitos:
#   - id: T-...
#   -- id: T-...
#   34-- id: T-...
#   34 - id: T-...
TASK_START_LOOSE_RE = re.compile(
    r"^(?P<prefix>\s*[^\S\r\n]*\d*\s*)?[-]{1,}\s*id\s*:(?P<rest>.*)$"
)


@dataclass
class FormatResult:
    changed: bool
    text: str


def _split_lines_keepends(text: str) -> List[str]:
    # splitlines(True) preserva \n; útil para não bagunçar o resto do arquivo.
    return text.splitlines(True)


def _join_lines(lines: Iterable[str]) -> str:
    return "".join(lines)


def _normalize_task_start_line(line: str) -> Optional[str]:
    """Se a linha parece um início de task, retorna a versão normalizada.

    - Sempre começa com "- id:" na coluna 0.
    - Mantém tudo depois de "id:".
    """
    m = TASK_START_LOOSE_RE.match(line.rstrip("\n"))
    if not m:
        return None

    rest = m.group("rest")
    newline = "\n" if line.endswith("\n") else ""

    rest_stripped = rest.lstrip()  # remove espaços logo após ':'
    if rest_stripped:
        return f"- id: {rest_stripped}{newline}"
    return f"- id:{newline}"


def format_tasks_text(text: str) -> FormatResult:
    lines = _split_lines_keepends(text)

    # Localiza a seção ## Tasks
    tasks_header_idx: Optional[int] = None
    for i, ln in enumerate(lines):
        if TASKS_SECTION_RE.match(ln.rstrip("\n")):
            tasks_header_idx = i
            break

    if tasks_header_idx is None:
        return FormatResult(changed=False, text=text)

    # Define o range da seção Tasks (até o próximo "## ..." ou EOF)
    body_start = tasks_header_idx + 1
    body_end = len(lines)
    for j in range(body_start, len(lines)):
        if NEXT_SECTION_RE.match(lines[j].rstrip("\n")):
            body_end = j
            break

    pre = lines[:body_start]
    body = lines[body_start:body_end]
    post = lines[body_end:]

    # Se não há nenhuma task ("- id:") na seção, não mexe.
    has_any_task = any(_normalize_task_start_line(ln) is not None for ln in body)
    if not has_any_task:
        return FormatResult(changed=False, text=text)

    # Parse em blocos: cada bloco começa em uma linha start (mesmo malformada).
    blocks: List[List[str]] = []
    current: Optional[List[str]] = None

    def push_current() -> None:
        nonlocal current
        if current is None:
            return
        # Remove espaços em branco no fim do bloco
        while current and current[-1].strip() == "":
            current.pop()
        blocks.append(current)
        current = None

    orphan_prefix_lines: List[str] = []

    for ln in body:
        norm_start = _normalize_task_start_line(ln)
        if norm_start is not None:
            push_current()
            current = [norm_start]
            continue

        if current is None:
            # Linhas antes da primeira task: tenta recuperar casos "colados".
            # Regra: se a linha tem "id:" mas não bateu no regex (muito estranho),
            # guardamos para anexar no primeiro bloco, sem quebrar o requisito
            # de "bloco começa com - id:".
            if "id:" in ln:
                orphan_prefix_lines.append(ln)
            # Caso contrário, ignora (típico: linhas em branco).
            continue

        # Dentro de um bloco, mantemos as linhas (normalização de brancos vem depois)
        current.append(ln)

    push_current()

    # Se existirem linhas órfãs com conteúdo (antes do primeiro - id:), anexar
    # ao primeiro bloco como linhas indentadas, para não perder conteúdo.
    if orphan_prefix_lines and blocks:
        fixed: List[str] = []
        for ol in orphan_prefix_lines:
            if ol.strip() == "":
                continue
            newline = "\n" if ol.endswith("\n") else ""
            fixed.append(f"  {ol.rstrip('\n')}{newline}")
        if fixed:
            # Insere logo após a linha "- id:" do primeiro bloco
            blocks[0] = [blocks[0][0]] + fixed + blocks[0][1:]

    # Normaliza linhas em branco dentro de cada bloco (colapsa múltiplas em 1)
    norm_blocks: List[List[str]] = []
    for blk in blocks:
        out: List[str] = []
        blank_run = 0
        for ln in blk:
            if ln.strip() == "":
                blank_run += 1
                if blank_run <= 1:
                    out.append("\n" if ln.endswith("\n") else "")
                continue
            blank_run = 0
            out.append(ln)
        # Remove brancos finais (de novo)
        while out and out[-1].strip() == "":
            out.pop()
        norm_blocks.append(out)

    # Re-monta o body com exatamente 1 linha em branco entre blocos.
    new_body: List[str] = []

    # Garantia: após "## Tasks" deve haver uma linha em branco antes da primeira task
    if pre and not pre[-1].endswith("\n"):
        pre[-1] = pre[-1] + "\n"

    # Sempre começa com uma linha em branco (uma só) antes do primeiro bloco
    new_body.append("\n")

    for idx, blk in enumerate(norm_blocks):
        if idx > 0:
            new_body.append("\n")  # 1 linha em branco entre tasks
        new_body.extend(blk)
        if not (new_body and new_body[-1].endswith("\n")):
            new_body.append("\n")

    # Remove excesso de \n no final do body: deixa no máximo 1 \n ao final da seção.
    while len(new_body) >= 2 and new_body[-1] == "\n" and new_body[-2] == "\n":
        new_body.pop()

    new_lines = pre + new_body + post
    new_text = _join_lines(new_lines)

    return FormatResult(changed=(new_text != text), text=new_text)


def _default_repo_root() -> str:
    # scripts/format_tasks.py -> repo root = ..
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _default_globs(repo_root: str) -> List[str]:
    return [os.path.join(repo_root, "mission_control", "TASKS_*.md")]


def _iter_paths(globs_in: List[str]) -> List[str]:
    paths: List[str] = []
    for pat in globs_in:
        paths.extend(glob.glob(pat))
    # Dedup + ordena
    return sorted(set(paths))


def main(argv: Optional[List[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Normaliza mission_control/TASKS_*.md")
    p.add_argument(
        "--in-place",
        action="store_true",
        help="Sobrescreve os arquivos. Sem isso, imprime o conteúdo formatado no stdout.",
    )
    p.add_argument(
        "--path",
        action="append",
        default=None,
        help="Glob(s) de entrada. Pode repetir. Default: mission_control/TASKS_*.md",
    )
    args = p.parse_args(argv)

    repo_root = _default_repo_root()
    globs_in = args.path if args.path else _default_globs(repo_root)
    paths = _iter_paths(globs_in)

    if not paths:
        print("Nenhum arquivo encontrado.", file=sys.stderr)
        return 2

    any_changed = False
    any_error = False

    for path in paths:
        try:
            with open(path, "r", encoding="utf-8") as f:
                original = f.read()
        except Exception as e:
            print(f"ERRO: não consegui ler {path}: {e}", file=sys.stderr)
            any_error = True
            continue

        res = format_tasks_text(original)
        if res.changed:
            any_changed = True

        if args.in_place:
            if res.changed:
                try:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(res.text)
                    print(f"OK: formatado {os.path.relpath(path, repo_root)}")
                except Exception as e:
                    print(f"ERRO: não consegui escrever {path}: {e}", file=sys.stderr)
                    any_error = True
            else:
                print(f"OK: sem mudanças {os.path.relpath(path, repo_root)}")
        else:
            # Modo stdout: imprime sempre, com separador por arquivo.
            rel = os.path.relpath(path, repo_root)
            sys.stdout.write(f"\n===== {rel} =====\n")
            sys.stdout.write(res.text)
            if not res.text.endswith("\n"):
                sys.stdout.write("\n")

    if any_error:
        return 1

    return 0 if any_changed or args.in_place else 0


if __name__ == "__main__":
    raise SystemExit(main())
