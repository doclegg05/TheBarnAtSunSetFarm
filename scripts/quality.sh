#!/usr/bin/env bash
# Quality gate for TheBarnAtSunSetFarm (education-toolkit contract).
# Runs the repo's real checks: typecheck, tests, lint, production build.
# Exit 0 means the gate passes. Safe to run from any directory.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d node_modules ] || [ "${CI:-}" = "true" ]; then
  npm ci
fi

npm run typecheck
npm test -- --run
npm run lint
npm run build
