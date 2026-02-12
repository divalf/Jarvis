#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/transcribe_audio.sh /path/to/audio.ogg
#
# Notes:
# - Uses a dedicated venv at /root/.openclaw-mc/workspace/.venv-audio
# - Downloads the Whisper model on first run (cached in ~/.cache/huggingface)

AUDIO_PATH="${1:-}"
if [[ -z "${AUDIO_PATH}" ]]; then
  echo "Usage: $0 /path/to/audio.(ogg|mp3|m4a|wav)" >&2
  exit 2
fi

if [[ ! -f "${AUDIO_PATH}" ]]; then
  echo "File not found: ${AUDIO_PATH}" >&2
  exit 2
fi

VENV_DIR="/root/.openclaw-mc/workspace/.venv-audio"
PY="${VENV_DIR}/bin/python"

if [[ ! -x "${PY}" ]]; then
  echo "Audio venv not found. Create it first: python3 -m venv ${VENV_DIR} && ${VENV_DIR}/bin/pip install faster-whisper" >&2
  exit 2
fi

# Convert to wav mono 16k for consistent ASR
TMP_WAV="$(mktemp --suffix=.wav)"
trap 'rm -f "${TMP_WAV}"' EXIT

ffmpeg -hide_banner -loglevel error -y -i "${AUDIO_PATH}" -ac 1 -ar 16000 "${TMP_WAV}"

WAV_PATH="${TMP_WAV}" "${PY}" - <<'PY'
import os
from faster_whisper import WhisperModel

wav_path = os.environ["WAV_PATH"]

# small is a good default (accuracy vs speed). You can switch to medium if needed.
model = WhisperModel("small", device="cpu", compute_type="int8")
segments, info = model.transcribe(wav_path, language="pt")

print(f"language={info.language} (prob={info.language_probability:.2f})")
print("---")
for s in segments:
    print(s.text.strip())
PY
