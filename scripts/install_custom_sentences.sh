#!/usr/bin/env bash
# Install the HA Reminders custom sentences into a Home Assistant config dir.
#
# Usage:
#   HA_CONFIG=/path/to/your/config ./scripts/install_custom_sentences.sh
#
# Defaults to /config (typical for Home Assistant OS / containers).
# Existing files are never overwritten (-n), so upgrades keep your edits.

set -euo pipefail

HA_CONFIG="${HA_CONFIG:-/config}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR/../custom_sentences"

if [ ! -d "$SRC_DIR/en" ]; then
  echo "ERROR: sentence templates not found in $SRC_DIR/en" >&2
  exit 1
fi

mkdir -p "$HA_CONFIG/custom_sentences"
cp -rn "$SRC_DIR/en" "$HA_CONFIG/custom_sentences/"

echo "Installed HA Reminders sentences into $HA_CONFIG/custom_sentences/en"
echo "Restart Home Assistant (or reload Assist) to activate them."