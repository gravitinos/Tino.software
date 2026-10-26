#!/usr/bin/env node
// Homepage gate: zero axe violations in both views, plus wordmark, md link,
// and contribution grid behavior.
//
//   bun run build && bun run test:home          # starts `next start` itself
//   BASE_URL=https://tino.software bun run test:home
//
// Screenshots of each view land in artifacts/home/ for sharing.

import { execFileSync, spawn } from "node:child_process"
import { mkdirSync } from "node:fs"
import { setTimeout as sleep } from "node:timers/promises"

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

/** Run page JS; returns the eval result (avoids shell-quoting issues). */
function evalResult(js) {
  const b64 = Buffer.from(js).toString("base64")
  return ab("eval", "-b", b64, "--json").data.result
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
  // Top-right `md` must point at the tino.md twin, not a same-origin .md route.
  {
    const hrefJs =
      'document.querySelector(\'a[href^="https://tino.md"]\')?.getAttribute("href")'
    ab("open", base + "/")
    const homeMd = evalResult(hrefJs)
    if (homeMd !== "https://tino.md/") {
      failures.push(`html md link href ${homeMd} (expected https://tino.md/)`)
    } else {
      console.log("[html] md link → https://tino.md/")
    }

    const siteInfo = evalResult(
      '!!document.querySelector(\'a[href="/site"], a[href$="/site"]\')'
    )
    if (siteInfo) failures.push("html still links to /site")

    // The wordmark stays at rest when hovered or clicked and is not a control.
    const wordmarkStyle = `(() => {
      const title = document.querySelector('h1');
      if (!title || title.textContent.trim().toLowerCase() !== 'tino') return null;
      return [...title.querySelectorAll('*')].map((element) => {
        const style = getComputedStyle(element);
        return [style.fontFamily, style.color, style.transform, style.animationName,
          style.transitionDuration, element.getBoundingClientRect().toJSON()];
      });
    })()`
    const restingWordmark = JSON.stringify(evalResult(wordmarkStyle))
    const wordmarkInteractive = evalResult(
      '!!document.querySelector(\'h1 :is(button, a, [role="button"], [tabindex])\')'
    )
    if (restingWordmark === "null" || wordmarkInteractive) {
      failures.push("html wordmark missing or still interactive")
    }
    ab("hover", "h1")
    ab("click", "h1")
    if (JSON.stringify(evalResult(wordmarkStyle)) !== restingWordmark) {
      failures.push("html wordmark changed on hover/click")
    } else {
      console.log("[html] wordmark stays static on hover/click")
    }

    // Contribution grid: accessible cells + less/more legend.
    const gridOk = evalResult(
      '!!document.querySelector(\'[role="grid"][aria-label*="contributions"]\')'
    )
    if (!gridOk) failures.push("html missing contributions grid")
    const cellOk = evalResult(
      '!!document.querySelector(\'[role="grid"] [role="gridcell"][aria-label*="contribution"]\')'
    )
    if (!cellOk) failures.push("html missing labeled contribution cells")
    const legend = evalResult(
      'document.body.innerText.includes("Less") && document.body.innerText.includes("More")'
    )
    if (!legend) failures.push("html missing Less/More contribution legend")

    evalResult(`(() => {
      const cell = document.querySelector('[role="grid"] button[role="gridcell"]');
      cell?.focus();
      return !!cell;
    })()`)
    ab("wait", "300")
    const readout = evalResult(`(() => {
      const live = document.querySelector('[role="grid"][aria-describedby]');
      const id = live?.getAttribute('aria-describedby');
      const label = id ? document.getElementById(id)?.textContent?.trim() : '';
      return label && /contribution/i.test(label) ? label : null;
    })()`)
    if (!readout) {
      failures.push("html contribution cell focus did not update day readout")
    } else {
      console.log(`[html] contribution readout → ${readout}`)
    }
  }

  for (const view of VIEWS) {
    ab("open", base + view.path)
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
