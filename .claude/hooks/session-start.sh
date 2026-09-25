#!/bin/bash
# Claude Code on the web: deps for the app and for agent-browser.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
bun install

# agent-browser can't download Chrome for Testing here; use the preinstalled Chromium.
if [ -x /opt/pw-browsers/chromium ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export AGENT_BROWSER_EXECUTABLE_PATH=/opt/pw-browsers/chromium' >> "$CLAUDE_ENV_FILE"
fi

# `agent-browser record` pipes frames into ffmpeg.
if ! command -v ffmpeg >/dev/null 2>&1; then
  (apt-get install -y -qq ffmpeg || (apt-get update -qq && apt-get install -y -qq ffmpeg)) >/dev/null 2>&1 \
    || echo "ffmpeg install failed; agent-browser record will not work" >&2
fi
