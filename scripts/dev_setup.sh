#!/usr/bin/env bash
# Development environment setup for HA Reminders.
#
# Creates a virtualenv with the Python test dependencies and installs the
# frontend dependencies for the dashboard card.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

.venv/bin/pip install --upgrade pip
.venv/bin/pip install pytest

if [ -f "card/package.json" ]; then
  (
    cd card
    npm install
  )
fi

echo
echo "Development environment ready."
echo "  Run Python tests:     .venv/bin/pytest"
echo "  Build the card:       cd card && npm run build"