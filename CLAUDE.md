@AGENTS.md

# Homepage quality bar

The homepage keeps **zero axe-core violations** (html and `?view=md`) and **"good" Core Web Vitals** (LCP ≤ 2.5s, FCP ≤ 1.8s, TTFB ≤ 800ms, CLS ≤ 0.1, INP ≤ 200ms).

- Run `bun run build && bun run test:home` before pushing any change that touches `app/`, `components/`, `registry/`, `lib/`, or `app/globals.css`. It must pass; CI (`.github/workflows/home.yml`) runs it on every PR.
- Fix violations; never lower thresholds, skip a view, or filter out axe rules to get green. If a design choice fails contrast, change the token and say so in the PR.
- New pages should get the same check: add them to `VIEWS` in `scripts/check-home.mjs`.

# Show your work with agent-browser

Use the `agent-browser` skill (`bunx agent-browser …`; load `bunx agent-browser skills get core` first) to look at UI work in a real browser instead of guessing.

- While working: after a visible change, take a screenshot (`bunx agent-browser screenshot artifacts/<name>.png`) and share it with the user in the chat. For motion, interaction, or view switches, record a short video at 60 fps (`record start artifacts/<name>.mp4 --fps 60` … `record stop`) and share that too.
- In PRs: CI posts html/md screenshots and a walkthrough video as a sticky comment. Also put before/after screenshots of what changed in the PR description. For inline images, commit them to the `pr-media` branch under `pr-<number>/` and link `https://raw.githubusercontent.com/gravitinos/Tino.software/pr-media/pr-<number>/<file>`. Never commit media to the feature branch.
- `artifacts/` is gitignored.
- In Claude Code on the web, the SessionStart hook (`.claude/hooks/session-start.sh`) runs `bun install`, sets `AGENT_BROWSER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (Chrome for Testing can't be downloaded there), and installs `ffmpeg` for `record`.
