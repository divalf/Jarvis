#!/usr/bin/env python3
"""Move a task (by id) between mission_control/TASKS_*.md files.

This script treats each TASKS_*.md as a markdown file containing a "## Tasks" section
with YAML-ish task blocks. A task block starts with "- id:" at column 0 and runs
until the next "- id:" or EOF.

Behavior / invariants (kept on every write):
- Exactly 1 blank line after "## Tasks".
- Exactly 1 blank line between task blocks.
- Task internal "status" always matches the destination column.
- "updated_at" is set to today's local date when moving.
- A status-change line is appended to the task log.

Usage:
  python3 scripts/move_task.py --id T-YYYYMMDD-### --to inbox|doing|review|done|blocked
  python3 scripts/move_task.py --id T-YYYYMMDD-### --to blocked --owner devinho
"""

from __future__ import annotations

import argparse
import datetime as dt
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
MC = ROOT / "mission_control"

STATE_TO_FILE: Dict[str, Path] = {
    "inbox": MC / "TASKS_INBOX.md",
    "doing": MC / "TASKS_DOING.md",
    "review": MC / "TASKS_REVIEW.md",
    "done": MC / "TASKS_DONE.md",
    "blocked": MC / "TASKS_BLOCKED.md",
}

FILE_TO_STATE: Dict[str, str] = {
    "TASKS_INBOX.md": "inbox",
    "TASKS_DOING.md": "doing",
    "TASKS_REVIEW.md": "review",
    "TASKS_DONE.md": "done",
    "TASKS_BLOCKED.md": "blocked",
}

ID_LINE_RE = re.compile(r"^- id:\s*(?P<id>\S+)\s*$")


def now_local() -> dt.datetime:
    # timezone per environment (America/Sao_Paulo)
    return dt.datetime.now().astimezone()


def today_local_date() -> str:
    return now_local().strftime("%Y-%m-%d")


def now_local_hhmm() -> str:
    return now_local().strftime("%H:%M")


def default_actor() -> str:
    # Prefer OpenClaw agent id/name if present; else fall back to OS user.
    return (
        os.environ.get("OPENCLAW_AGENT_ID")
        or os.environ.get("OPENCLAW_AGENT")
        or os.environ.get("MC_BY")
        or os.environ.get("USER")
        or "unknown"
    )


@dataclass
class ParsedFile:
    path: Path
    header: List[str]  # includes "## Tasks" line and everything before it
    tasks: List[List[str]]  # list of task blocks (each block: list of lines)


def _split_tasks_section(lines: List[str], *, path: Path) -> ParsedFile:
    """Parse a TASKS_*.md file into header + list of task blocks."""

    try:
        idx = next(i for i, ln in enumerate(lines) if ln.strip() == "## Tasks")
    except StopIteration:
        raise SystemExit(f"Could not find '## Tasks' section in {path}")

    header = lines[: idx + 1]
    tail = lines[idx + 1 :]

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
            # Anything before the first task (blank lines, notes) is ignored.
            continue

        cur.append(ln)

    if cur is not None:
        tasks.append(cur)

    # Normalize: trim trailing blank lines inside each task block
    norm_tasks: List[List[str]] = []
    for blk in tasks:
        b = [ln.rstrip("\n") for ln in blk]
        while b and b[-1].strip() == "":
            b.pop()
        norm_tasks.append(b)

    return ParsedFile(path=path, header=[ln.rstrip("\n") for ln in header], tasks=norm_tasks)


def _render_file(parsed: ParsedFile, *, state: str) -> str:
    """Render back to markdown, enforcing spacing invariants."""

    out: List[str] = []
    out.extend(ln.rstrip("\n") for ln in parsed.header)
    out.append("")  # exactly one blank line after ## Tasks

    if not parsed.tasks:
        if state == "inbox":
            out.append("- (vazio)")
        out.append("")
        return "\n".join(out).rstrip("\n") + "\n"

    for i, blk in enumerate(parsed.tasks):
        if i > 0:
            out.append("")  # exactly one blank line between blocks
        out.extend(ln.rstrip("\n") for ln in blk)

    out.append("")
    return "\n".join(out).rstrip("\n") + "\n"


def _find_task(parsed: ParsedFile, task_id: str) -> Optional[int]:
    for i, blk in enumerate(parsed.tasks):
        if not blk:
            continue
        m = ID_LINE_RE.match(blk[0].rstrip("\n"))
        if m and m.group("id") == task_id:
            return i
    return None


def _remove_duplicate_scalar_lines(blk: List[str], key: str) -> List[str]:
    """Keep only the first occurrence of a scalar key line (best-effort)."""

    key_re = re.compile(rf"^\s*{re.escape(key)}:\s*.*$")
    out: List[str] = []
    seen = False
    for ln in blk:
        if key_re.match(ln):
            if seen:
                continue
            seen = True
        out.append(ln)
    return out


def _set_scalar_line(
    blk: List[str], *, key: str, value: str, quote_value: bool = False, indent: str = "  "
) -> List[str]:
    """Set a top-level scalar line like '  status: doing'.

    - Enforces a consistent 2-space indent for top-level fields.
    - If the key is not found, inserts near the top.
    """

    target_re = re.compile(rf"^\s*{re.escape(key)}:\s*(?P<rest>.*)$")
    v = f'"{value}"' if quote_value else value

    for i, ln in enumerate(blk):
        if target_re.match(ln):
            blk[i] = f"{indent}{key}: {v}"
            return blk

    # Insert near the top: after title if present, else after id.
    insert_at = 1
    for i, ln in enumerate(blk[:10]):
        if ln.lstrip().startswith("title:") or ln.lstrip().startswith("title: "):
            insert_at = i + 1
            break
    blk.insert(insert_at, f"{indent}{key}: {v}")
    return blk


def _append_log_line(blk: List[str], log_line: str) -> List[str]:
    """Append a line under '  log:' with consistent indentation."""

    for i, ln in enumerate(blk):
        if ln.rstrip("\n") == "  log:":
            j = i + 1
            while j < len(blk) and blk[j].startswith("    - "):
                j += 1
            blk.insert(j, f"    - \"{log_line}\"")
            return blk

    blk.append("  log:")
    blk.append(f"    - \"{log_line}\"")
    return blk


def _update_task_block(
    blk: List[str], *, from_state: str, to_state: str, owner: Optional[str], by: str
) -> List[str]:
    date = today_local_date()
    hhmm = now_local_hhmm()

    blk = [ln.rstrip("\n") for ln in blk]

    # Make sure there aren't multiple conflicting scalar lines.
    for k in ("status", "updated_at", "owner"):
        blk = _remove_duplicate_scalar_lines(blk, k)

    # status must always match destination
    blk = _set_scalar_line(blk, key="status", value=to_state, quote_value=False)

    # owner (optional override)
    if owner is not None:
        blk = _set_scalar_line(blk, key="owner", value=owner, quote_value=False)

    # updated_at always set to today when moving
    blk = _set_scalar_line(blk, key="updated_at", value=date, quote_value=True)

    # log append (auditable)
    blk = _append_log_line(blk, f"[status {date} {hhmm}] {from_state}->{to_state} by={by}")

    return blk


def _load_parsed(state: str) -> ParsedFile:
    path = STATE_TO_FILE[state]
    if not path.exists():
        raise SystemExit(f"File not found: {path}")
    lines = path.read_text(encoding="utf-8").splitlines()
    return _split_tasks_section(lines, path=path)


def main() -> int:
    ap = argparse.ArgumentParser(description="Move a task between TASKS_*.md columns")
    ap.add_argument("--id", required=True, dest="task_id", help="Task id (e.g., T-20260208-006)")
    ap.add_argument(
        "--to",
        required=True,
        choices=list(STATE_TO_FILE.keys()),
        help="Destination column/state",
    )
    ap.add_argument(
        "--owner",
        default=None,
        help="Optional: override owner in the moved task (use empty string to clear)",
    )
    ap.add_argument(
        "--by",
        default=None,
        help="Optional: actor name/id for audit (default: OPENCLAW_AGENT_ID|MC_BY|USER)",
    )
    args = ap.parse_args()

    task_id: str = args.task_id
    to_state: str = args.to
    by: str = (args.by or default_actor()).strip() or "unknown"

    found: List[Tuple[str, int]] = []
    parsed_by_state: Dict[str, ParsedFile] = {}

    for st in STATE_TO_FILE.keys():
        parsed = _load_parsed(st)
        parsed_by_state[st] = parsed
        idx = _find_task(parsed, task_id)
        if idx is not None:
            found.append((st, idx))

    if not found:
        raise SystemExit(f"Task id not found: {task_id}")
    if len(found) > 1:
        raise SystemExit(f"Task id appears in multiple files: {found}")

    from_state, from_idx = found[0]
    if from_state == to_state:
        raise SystemExit(f"Task is already in '{to_state}'")

    src = parsed_by_state[from_state]
    dst = parsed_by_state[to_state]

    blk = src.tasks.pop(from_idx)
    blk2 = _update_task_block(blk, from_state=from_state, to_state=to_state, owner=args.owner, by=by)

    # Insert at top of destination list (visibility)
    dst.tasks.insert(0, blk2)

    src_text = _render_file(src, state=from_state)
    dst_text = _render_file(dst, state=to_state)

    STATE_TO_FILE[from_state].write_text(src_text, encoding="utf-8")
    STATE_TO_FILE[to_state].write_text(dst_text, encoding="utf-8")

    print(f"moved {task_id}: {from_state}->{to_state}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
