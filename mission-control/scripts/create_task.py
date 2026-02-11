#!/usr/bin/env python3
"""Create a new task entry and insert it into mission_control/TASKS_INBOX.md.

Design goals:
- deterministic, file-based (no external deps)
- preserves existing markdown outside the task insertion
- generates incremental IDs per day: T-YYYYMMDD-###

Usage:
  python3 scripts/create_task.py --title "Minha task" [--owner jarvis] [--priority low|med|high]
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MC = ROOT / "mission_control"
INBOX = MC / "TASKS_INBOX.md"
ALL_TASK_FILES = [
    MC / "TASKS_INBOX.md",
    MC / "TASKS_DOING.md",
    MC / "TASKS_REVIEW.md",
    MC / "TASKS_DONE.md",
    MC / "TASKS_BLOCKED.md",
]

ID_RE = re.compile(r"\bT-(\d{8})-(\d{3})\b")


def now_local() -> dt.datetime:
    # Uses system timezone (container configured to America/Sao_Paulo in OpenClaw runtime)
    return dt.datetime.now().astimezone()


def next_id_for_day(day: str) -> str:
    """Return next T-YYYYMMDD-### scanning all task files."""
    max_seq = 0
    for p in ALL_TASK_FILES:
        if not p.exists():
            continue
        text = p.read_text(encoding="utf-8")
        for m in ID_RE.finditer(text):
            d, seq = m.group(1), int(m.group(2))
            if d == day and seq > max_seq:
                max_seq = seq
    return f"T-{day}-{max_seq+1:03d}"


def render_task(
    *,
    task_id: str,
    title: str,
    owner: str,
    priority: str,
    created_at: str,
    updated_at: str,
    log_line: str,
) -> str:
    # Keep format consistent with templates/TASK_TEMPLATE.md and TASKS_DOING.md
    # Note: owner can be empty in INBOX (unassigned)
    owner_value = owner if owner else ""

    return (
        f"- id: {task_id}\n"
        f"  title: \"{title}\"\n"
        f"  owner: {owner_value}\n"
        f"  status: inbox\n"
        f"  priority: {priority}\n"
        f"  created_at: \"{created_at}\"\n"
        f"  updated_at: \"{updated_at}\"\n"
        f"  context:\n"
        f"    - \"\"\n"
        f"  acceptance_criteria:\n"
        f"    - \"\"\n"
        f"  deliverables:\n"
        f"    - \"\"\n"
        f"  dependencies:\n"
        f"    - \"\"\n"
        f"  log:\n"
        f"    - \"{log_line}\"\n"
    )


def insert_into_inbox(task_block: str) -> None:
    if not INBOX.exists():
        raise SystemExit(f"INBOX file not found: {INBOX}")

    text = INBOX.read_text(encoding="utf-8")

    marker = "## Tasks\n"
    idx = text.find(marker)
    if idx == -1:
        raise SystemExit("Could not find '## Tasks' section in TASKS_INBOX.md")

    head = text[: idx + len(marker)]
    tail = text[idx + len(marker) :]

    # If inbox is empty with placeholder '- (vazio)', remove it.
    tail = re.sub(r"\n- \(vazio\)\s*\n?", "\n", tail, flags=re.MULTILINE)

    # Ensure there is exactly one blank line after marker
    if not head.endswith("\n\n"):
        if head.endswith("\n"):
            head += "\n"
        else:
            head += "\n\n"

    # Insert at top of tasks list for visibility
    new_text = head + "\n" + task_block + "\n" + tail.lstrip("\n")

    INBOX.write_text(new_text, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--title", required=True)
    ap.add_argument("--owner", default="")
    ap.add_argument("--priority", default="med", choices=["low", "med", "high"])
    args = ap.parse_args()

    t = now_local()
    day = t.strftime("%Y%m%d")
    task_id = next_id_for_day(day)

    created_at = t.strftime("%Y-%m-%d")
    updated_at = created_at
    log_line = f"[init {t.strftime('%Y-%m-%d %H:%M')}] criado no INBOX"

    block = render_task(
        task_id=task_id,
        title=args.title.replace('"', "\\\""),
        owner=args.owner,
        priority=args.priority,
        created_at=created_at,
        updated_at=updated_at,
        log_line=log_line,
    )

    insert_into_inbox(block)

    print(task_id)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
