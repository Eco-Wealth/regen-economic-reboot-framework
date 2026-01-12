#!/usr/bin/env bash
set -euo pipefail

# Create a short animated GIF for documentation.
#
# Requirements:
# - chromium (or chromium-browser)
# - ffmpeg
# - Regen Hub running locally (default http://localhost:3000)
#
# Usage:
#   REGEN_HUB_URL=http://localhost:3000 bash scripts/record-demo.sh
#
# Output:
#   docs/regen-hub/demo-desktop.gif
#   docs/regen-hub/demo-mobile.gif

BASE_URL=${REGEN_HUB_URL:-http://localhost:3000}
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

CHROME_BIN=${CHROME_BIN:-""}
if [[ -z "$CHROME_BIN" ]]; then
  CHROME_BIN=$(command -v chromium 2>/dev/null || true)
fi
if [[ -z "$CHROME_BIN" ]]; then
  CHROME_BIN=$(command -v chromium-browser 2>/dev/null || true)
fi

if [[ -z "$CHROME_BIN" ]]; then
  echo "chromium not found. Set CHROME_BIN=/path/to/chromium" >&2
  exit 1
fi

command -v ffmpeg >/dev/null 2>&1 || {
  echo "ffmpeg not found" >&2
  exit 1
}

OUT_DIR="$ROOT_DIR/docs/regen-hub"
FRAMES_DIR="$OUT_DIR/_frames"
mkdir -p "$FRAMES_DIR"

rm -f "$FRAMES_DIR"/*.png

capture() {
  local route=$1
  local width=$2
  local height=$3
  local out=$4
  "$CHROME_BIN" \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --hide-scrollbars \
    --window-size="$width,$height" \
    --screenshot="$FRAMES_DIR/$out" \
    "$BASE_URL$route" \
    >/dev/null 2>&1
}

echo "Capturing frames from $BASE_URL ..."

# Desktop frames
capture "/" 1280 720 "desk_001.png"
capture "/projects" 1280 720 "desk_002.png"
capture "/governance" 1280 720 "desk_003.png"
capture "/mentor" 1280 720 "desk_004.png"

# Mobile frames
capture "/" 390 844 "mob_001.png"
capture "/projects" 390 844 "mob_002.png"
capture "/governance" 390 844 "mob_003.png"
capture "/mentor" 390 844 "mob_004.png"

echo "Encoding GIFs..."
ffmpeg -y -hide_banner -loglevel error -framerate 1 -i "$FRAMES_DIR/desk_%03d.png" \
  -vf "scale=1280:-1:flags=lanczos" \
  "$OUT_DIR/demo-desktop.gif"

ffmpeg -y -hide_banner -loglevel error -framerate 1 -i "$FRAMES_DIR/mob_%03d.png" \
  -vf "scale=390:-1:flags=lanczos" \
  "$OUT_DIR/demo-mobile.gif"

echo "Wrote: $OUT_DIR/demo-desktop.gif"
echo "Wrote: $OUT_DIR/demo-mobile.gif"
