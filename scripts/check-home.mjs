#!/usr/bin/env node
// Homepage gate: zero axe violations in both views, Core Web Vitals "good".
//
//   bun run build && bun run test:home          # starts `next start` itself
//   BASE_URL=https://tino.software bun run test:home
//
// Screenshots of each view land in artifacts/home/ for sharing. With RECORD=1
// it also records home.mp4: scroll the page, flip to markdown (`m`) and back.

import { execFileSync, spawn } from "node:child_process"
import { mkdirSync } from "node:fs"
import { setTimeout as sleep } from "node:timers/promises"

// web.dev "good" thresholds (ms, except CLS).
const GOOD = { lcp: 2500, fcp: 1800, ttfb: 800, inp: 200, cls: 0.1 }
const VIEWS = [
  { name: "html", path: "/" },
  { name: "md", path: "/?view=md" },
]
const OUT = "artifacts/home"
const SESSION = "check-home"

function ab(...args) {
  const out = execFileSync(
    "agent-browser",
    ["--session", SESSION, ...args],
    { encoding: "utf8", env: { ...process.env, PATH: `node_modules/.bin:${process.env.PATH}` } }
  )
  return args.includes("--json") ? JSON.parse(out) : out
}

async function startServer() {
  const port = process.env.PORT ?? "3123"
  const server = spawn("node_modules/.bin/next", ["start", "-p", port], {
    stdio: "ignore",
  })
  const url = `http://localhost:${port}`
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return { url, server }
    } catch {}
    await sleep(500)
  }
  server.kill()
  throw new Error(`next start did not come up on ${url} (did you run \`bun run build\`?)`)
}

const own = process.env.BASE_URL ? null : await startServer()
const base = (process.env.BASE_URL ?? own.url).replace(/\/$/, "")
const failures = []
mkdirSync(OUT, { recursive: true })

try {
  for (const view of VIEWS) {
    const url = base + view.path

    // Fresh load so vitals measure this navigation only.
    ab("open", url)
    const vitals = ab("vitals", "--json").data
    const measured = {
      lcp: vitals.lcp?.startTime,
      fcp: vitals.fcp,
      ttfb: vitals.ttfb,
      inp: vitals.inp,
      cls: vitals.cls?.score,
    }
    const row = Object.entries(measured)
      .map(([k, v]) => `${k}=${v ?? "-"}`)
      .join(" ")
    console.log(`[${view.name}] vitals ${row}`)
    for (const [k, v] of Object.entries(measured)) {
      if (v != null && v > GOOD[k]) {
        failures.push(`[${view.name}] ${k} ${v} > ${GOOD[k]}`)
      }
    }

    const a11y = ab("a11y", "--json").data
    console.log(
      `[${view.name}] a11y violations=${a11y.counts.violations} passes=${a11y.counts.passes} incomplete=${a11y.counts.incomplete}`
    )
    for (const v of a11y.violations) {
      const targets = v.nodes.map((n) => n.target.flat().join(" ")).join(", ")
      failures.push(`[${view.name}] a11y ${v.impact} ${v.id}: ${v.help} (${targets}) ${v.helpUrl}`)
    }

    ab("screenshot", "--full", `${OUT}/${view.name}.png`)
  }

  if (process.env.RECORD) {
    ab("open", base + "/")
    ab("record", "start", `${OUT}/home.mp4`)
    for (const step of [
      ["wait", "1000"],
      ["scroll", "down", "800"],
      ["wait", "1000"],
      ["scroll", "up", "800"],
      ["wait", "600"],
      ["press", "m"],
      ["wait", "1500"],
      ["press", "m"],
      ["wait", "1000"],
    ]) {
      ab(...step)
    }
    ab("record", "stop")
  }
} finally {
  try {
    ab("close")
  } catch {}
  own?.server.kill()
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s):\n` + failures.map((f) => `  - ${f}`).join("\n"))
  process.exit(1)
}
console.log(`\nhomepage ok. screenshots in ${OUT}/`)
