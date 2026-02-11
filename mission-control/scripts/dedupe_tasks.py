#!/usr/bin/env python3
"""Deduplicate Mission Control TASKS_*.md files by task id.

This script works with the "YAML-ish" task blocks used in mission_control/TASKS_*.md.
A task block starts with "- id:" at column 0 and continues until the next "- id:" or EOF.

Core behavior
- Deduplicate by task id, keeping exactly 1 block per id.
- Merge rule is documented in scripts/README_dedupe_tasks.md.
- Supports dry-run (default) and --in-place.

Usage
  # dry-run (default)
  python3 scripts/dedupe_tasks.py mission_control/TASKS_DONE.md

  # write changes back
  python3 scripts/dedupe_tasks.py --in-place mission_control/TASKS_DONE.md
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

ID_LINE_RE = re.compile(r"^- id:\s*(?P<id>\S+)\s*$")
TOP_SCALAR_RE = re.compile(r"^\s{2}(?P<key>[a-zA-Z_][a-zA-Z0-9_\-]*):\s*(?P<val>.*)$")
TOP_KEY_ONLY_RE = re.compile(r"^\s{2}(?P<key>[a-zA-Z_][a-zA-Z0-9_\-]*):\s*$")
LIST_ITEM_RE = re.compile(r"^\s{4}-\s*(?P<item>.*)$")

PREFERRED_KEY_ORDER: List[str] = [
    "title",
    "owner",
    "status",
    "priority",
    "created_at",
    "updated_at",
    "context",
    "subtasks",
    "acceptance_criteria",
    "deliverables",
    "dependencies",
    "log",
]

LIST_KEYS = {
    "context",
    "subtasks",
    "acceptance_criteria",
    "deliverables",
    "dependencies",
    "log",
}


@dataclass
class ParsedFile:
    path: Path
    header: List[str]  # up to and including '## Tasks'
    tasks: List[List[str]]  # each task block is list of lines (no trailing newlines)


@dataclass
class TaskBlock:
    task_id: str
    scalar: Dict[str, str]
    lists: Dict[str, List[str]]
    extra_lines: List[str]


def _parse_date_ymd(s: str) -> Optional[datetime]:
    s = s.strip().strip('"').strip("'")
    if not s:
        return None
    try:
        return datetime.strptime(s, "%Y-%m-%d")
    except ValueError:
        return None


def _split_tasks_section(lines: Sequence[str], *, path: Path) -> ParsedFile:
    try:
        idx = next(i for i, ln in enumerate(lines) if ln.strip() == "## Tasks")
    except StopIteration:
        raise SystemExit(f"Could not find '## Tasks' section in {path}")

    header = [ln.rstrip("\n") for ln in lines[: idx + 1]]
    tail = [ln.rstrip("\n") for ln in lines[idx + 1 :]]

    # Remove placeholder '- (vazio)' if present.
    tail = [ln for ln in tail if ln.strip() != "- (vazio)"]

    tasks: List[List[str]] = []
    cur: Optional[List[str]] = None

    for ln in tail:
        if ln.startswith("- id:"):
            if cur is not None:
                tasks.append(cur)
            cur = [ln]
            continue

        if cur is None:
            # Ignore any content before the first task.
            continue

        cur.append(ln)

    if cur is not None:
        tasks.append(cur)

    # Trim trailing blank lines inside each task block
    norm: List[List[str]] = []
    for blk in tasks:
        b = [x.rstrip("\n") for x in blk]
        while b and b[-1].strip() == "":
            b.pop()
        norm.append(b)

    return ParsedFile(path=path, header=header, tasks=norm)


def _render_file(parsed: ParsedFile) -> str:
    out: List[str] = []
    out.extend(ln.rstrip("\n") for ln in parsed.header)
    out.append("")  # exactly one blank line after ## Tasks

    if not parsed.tasks:
        # Keep convention: DONE can be empty without placeholder.
        out.append("")
        return "\n".join(out).rstrip("\n") + "\n"

    for i, blk in enumerate(parsed.tasks):
        if i > 0:
            out.append("")  # exactly one blank line between blocks
        out.extend(ln.rstrip("\n") for ln in blk)

    out.append("")
    return "\n".join(out).rstrip("\n") + "\n"


def _task_id_from_block(blk: Sequence[str], *, path: Path) -> str:
    if not blk:
        raise SystemExit(f"Empty task block in {path}")
    m = ID_LINE_RE.match(blk[0].rstrip("\n"))
    if not m:
        raise SystemExit(f"Malformed task block (missing '- id:') in {path}: {blk[0]!r}")
    return m.group("id")


def _strip_wrapping_quotes(s: str) -> str:
    st = s.strip()
    if len(st) >= 2 and ((st[0] == '"' and st[-1] == '"') or (st[0] == "'" and st[-1] == "'")):
        return st[1:-1]
    return st


def _parse_task_block(blk: Sequence[str], *, path: Path) -> TaskBlock:
    task_id = _task_id_from_block(blk, path=path)

    scalar: Dict[str, str] = {}
    lists: Dict[str, List[str]] = {k: [] for k in LIST_KEYS}
    extra_lines: List[str] = []

    i = 1
    while i < len(blk):
        ln = blk[i]

        # list header like '  log:'
        m_key_only = TOP_KEY_ONLY_RE.match(ln)
        if m_key_only:
            key = m_key_only.group("key")
            if key in LIST_KEYS:
                i += 1
                while i < len(blk):
                    m_item = LIST_ITEM_RE.match(blk[i])
                    if not m_item:
                        break
                    lists[key].append(m_item.group("item").rstrip())
                    i += 1
                continue

        # scalar line like '  updated_at: "2026-02-08"'
        m_scalar = TOP_SCALAR_RE.match(ln)
        if m_scalar:
            key = m_scalar.group("key")
            val = m_scalar.group("val").rstrip()
            # If it's a list-key but written as scalar, treat as scalar.
            scalar[key] = val
            i += 1
            continue

        # preserve any unknown/extra lines (including blank lines inside block)
        extra_lines.append(ln.rstrip("\n"))
        i += 1

    # remove empty list keys to keep output compact
    lists = {k: v for k, v in lists.items() if v}

    return TaskBlock(task_id=task_id, scalar=scalar, lists=lists, extra_lines=extra_lines)


def _block_completeness_score(blk: Sequence[str]) -> Tuple[int, int]:
    """Higher is 'more complete'.

    Returns a tuple so sorting is stable:
    - number of non-empty lines
    - total characters
    """

    non_empty = sum(1 for ln in blk if ln.strip() != "")
    chars = sum(len(ln) for ln in blk)
    return (non_empty, chars)


def _updated_at_of(block: TaskBlock) -> Optional[datetime]:
    v = block.scalar.get("updated_at")
    if not v:
        return None
    return _parse_date_ymd(_strip_wrapping_quotes(v))


def _dedupe_preserve_order(items: Iterable[str]) -> List[str]:
    out: List[str] = []
    seen = set()
    for x in items:
        key = x.rstrip()
        if key in seen:
            continue
        seen.add(key)
        out.append(x)
    return out


def _merge_task_blocks(blks: Sequence[Sequence[str]], *, path: Path) -> List[str]:
    """Merge duplicate blocks for the same task id into a single block."""

    if not blks:
        raise ValueError("No blocks to merge")

    parsed = [_parse_task_block(b, path=path) for b in blks]

    # Choose base:
    # 1) prefer the most complete block
    # 2) tie-breaker: most recent updated_at
    scored: List[Tuple[Tuple[int, int], Optional[datetime], int]] = []
    for idx, raw in enumerate(blks):
        score = _block_completeness_score(raw)
        up = _updated_at_of(parsed[idx])
        scored.append((score, up, idx))

    base_idx = max(scored, key=lambda t: (t[0], t[1] or datetime.min, -t[2]))[2]

    # For conflict resolution on scalars, prefer the value coming from the most recent updated_at.
    # If updated_at missing/unparseable, fall back to base.
    by_recency = list(range(len(parsed)))
    by_recency.sort(key=lambda i: (_updated_at_of(parsed[i]) or datetime.min))

    base = parsed[base_idx]

    merged_scalar: Dict[str, str] = dict(base.scalar)
    merged_lists: Dict[str, List[str]] = {k: list(v) for k, v in base.lists.items()}

    # Fill missing scalars from others (most recent wins on conflict).
    all_keys = set().union(*(p.scalar.keys() for p in parsed))
    for key in all_keys:
        # gather candidates in ascending recency, then pick last non-empty
        chosen: Optional[str] = None
        for i in by_recency:
            v = parsed[i].scalar.get(key)
            if v is None:
                continue
            if v.strip() == "":
                continue
            chosen = v
        if chosen is None:
            continue

        if key not in merged_scalar or merged_scalar[key].strip() == "":
            merged_scalar[key] = chosen
        else:
            # conflict: prefer most recent
            merged_scalar[key] = chosen

    # Merge lists.
    all_list_keys = set().union(*(p.lists.keys() for p in parsed))
    for key in all_list_keys:
        items: List[str] = []
        # keep roughly chronological: oldest -> newest for log; for others, base-first then others.
        if key == "log":
            for i in by_recency:
                items.extend(parsed[i].lists.get(key, []))
        else:
            items.extend(base.lists.get(key, []))
            for i, p in enumerate(parsed):
                if i == base_idx:
                    continue
                items.extend(p.lists.get(key, []))

        merged_lists[key] = _dedupe_preserve_order(items)

    # Prefer base extra lines, but preserve unique non-empty extra lines from others.
    extra = list(base.extra_lines)
    extra_seen = {ln.rstrip() for ln in extra if ln.strip()}
    for i, p in enumerate(parsed):
        if i == base_idx:
            continue
        for ln in p.extra_lines:
            if ln.strip() == "":
                continue
            k = ln.rstrip()
            if k in extra_seen:
                continue
            extra_seen.add(k)
            extra.append(ln)

    # Render canonical block.
    out: List[str] = []
    out.append(f"- id: {base.task_id}")

    used_keys = set()

    def emit_scalar(k: str) -> None:
        if k in merged_scalar:
            out.append(f"  {k}: {merged_scalar[k]}")
            used_keys.add(k)

    def emit_list(k: str) -> None:
        if k in merged_lists and merged_lists[k]:
            out.append(f"  {k}:")
            for item in merged_lists[k]:
                out.append(f"    - {item}")
            used_keys.add(k)

    for k in PREFERRED_KEY_ORDER:
        if k in LIST_KEYS:
            emit_list(k)
        else:
            emit_scalar(k)

    # Emit any remaining keys not in preferred order.
    remaining_scalars = sorted([k for k in merged_scalar.keys() if k not in used_keys])
    for k in remaining_scalars:
        emit_scalar(k)

    remaining_lists = sorted([k for k in merged_lists.keys() if k not in used_keys])
    for k in remaining_lists:
        emit_list(k)

    # Emit extra lines at end (best-effort).
    for ln in extra:
        if ln.strip() == "":
            continue
        out.append(ln)

    # Trim trailing blank lines
    while out and out[-1].strip() == "":
        out.pop()

    return out


def dedupe_parsed_file(parsed: ParsedFile) -> Tuple[ParsedFile, Dict[str, int]]:
    groups: Dict[str, List[List[str]]] = {}
    order: List[str] = []

    for blk in parsed.tasks:
        tid = _task_id_from_block(blk, path=parsed.path)
        if tid not in groups:
            groups[tid] = []
            order.append(tid)
        groups[tid].append(blk)

    new_tasks: List[List[str]] = []
    stats = {
        "tasks_in": len(parsed.tasks),
        "tasks_out": 0,
        "duplicate_ids": 0,
        "duplicate_blocks_removed": 0,
    }

    for tid in order:
        blks = groups[tid]
        if len(blks) == 1:
            new_tasks.append([ln.rstrip("\n") for ln in blks[0]])
            continue

        merged = _merge_task_blocks(blks, path=parsed.path)
        new_tasks.append(merged)
        stats["duplicate_ids"] += 1
        stats["duplicate_blocks_removed"] += (len(blks) - 1)

    stats["tasks_out"] = len(new_tasks)

    return ParsedFile(path=parsed.path, header=parsed.header, tasks=new_tasks), stats


def main(argv: Optional[Sequence[str]] = None) -> int:
    ap = argparse.ArgumentParser(description="Deduplicate TASKS_*.md by '- id:' task blocks.")
    ap.add_argument("path", help="Path to TASKS_*.md (e.g. mission_control/TASKS_DONE.md)")
    ap.add_argument(
        "--in-place",
        action="store_true",
        help="Write the deduplicated file back to disk (default is dry-run).",
    )
    ap.add_argument(
        "--dry-run",
        action="store_true",
        help="Only report what would change (default behavior).",
    )

    ns = ap.parse_args(argv)

    path = Path(ns.path)
    if not path.exists():
        print(f"ERROR: file not found: {path}", file=sys.stderr)
        return 2

    # default behavior: dry-run unless --in-place
    dry_run = bool(ns.dry_run) or not ns.in_place

    original = path.read_text(encoding="utf-8")
    parsed = _split_tasks_section(original.splitlines(), path=path)

    new_parsed, stats = dedupe_parsed_file(parsed)
    rendered = _render_file(new_parsed)

    changed = rendered != original

    # Report
    dup_ids: List[str] = []
    if stats["duplicate_ids"]:
        # compute duplicate ids list
        counts: Dict[str, int] = {}
        for blk in parsed.tasks:
            tid = _task_id_from_block(blk, path=path)
            counts[tid] = counts.get(tid, 0) + 1
        dup_ids = sorted([tid for tid, c in counts.items() if c > 1])

    mode = "DRY-RUN" if dry_run else "APPLY"
    print(f"[{mode}] {path}")
    print(
        "Summary: tasks_in={tasks_in} tasks_out={tasks_out} duplicate_ids={duplicate_ids} duplicate_blocks_removed={duplicate_blocks_removed}".format(
            **stats
        )
    )
    if dup_ids:
        print("Duplicate ids:")
        for tid in dup_ids:
            print(f"  - {tid}")

    if not changed:
        print("No changes needed.")
        return 0

    if dry_run:
        print("Would write updated file (use --in-place to apply).")
        return 0

    path.write_text(rendered, encoding="utf-8")
    print("Wrote updated file.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
