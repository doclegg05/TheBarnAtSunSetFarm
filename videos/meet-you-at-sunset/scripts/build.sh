#!/usr/bin/env bash
# Rebuild both root compositions (16:9 here, 9:16 in the sibling project) and re-carve the music bed under the narration.
# build_index.py rewrites the root files, so the carve must run after it.
set -euo pipefail
cd "$(dirname "$0")/.."
CARVE="$HOME/.claude/skills/hyperframes-audio/scripts/carve.mjs"
python3 scripts/build_index.py
node "$CARVE" --comp index.html --bed music | tail -1
python3 scripts/build_index.py vertical
node "$CARVE" --comp ../meet-you-at-sunset-vertical/index.html --bed music --core . | tail -1
