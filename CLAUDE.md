@AGENTS.md

# Homepage quality bar

The homepage keeps **zero axe-core violations** (html and `?view=md`).

- Run `bun run lint && bun run build && bun run test:home` before pushing any change that touches `app/`, `components/`, `registry/`, `lib/`, or `app/globals.css`. It must pass; CI (`.github/workflows/ci.yml`) runs it on every PR.
- Fix violations; never skip a view or filter out axe rules to get green. If a design choice fails contrast, change the token and say so in the PR.
- New pages should get the same check: add them to `VIEWS` in `scripts/check-home.mjs`.

# Show your work with agent-browser

Use the `agent-browser` skill (`bunx agent-browser …`; load `bunx agent-browser skills get core` first) to look at UI work in a real browser instead of guessing.

- While working: after a visible change, take a screenshot (`bunx agent-browser screenshot artifacts/<name>.png`) and share it with the user in the chat. For motion, interaction, or view switches, record a short video (`record start artifacts/<name>.mp4` … `record stop`) and share that too.
- In PRs that change UI: put before/after screenshots and a short video of what changed in the PR description. For inline media, commit them to the `pr-media` branch under `pr-<number>/` and link `https://raw.githubusercontent.com/gravitinos/Tino.software/pr-media/pr-<number>/<file>`. Never commit media to the feature branch.
- `artifacts/` is gitignored.
- In Claude Code on the web, set `AGENT_BROWSER_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (Chrome for Testing can't be downloaded there). `record` needs `ffmpeg` (`apt-get install -y ffmpeg`).
