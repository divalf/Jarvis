#!/usr/bin/env bash
set -euo pipefail

# Wrapper for create_task.py
# Usage:
#   scripts/create_task.sh --title "Minha task" [--owner jarvis] [--priority low|med|high]

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$DIR/create_task.py" "$@"
