#!/usr/bin/env node
// Verifies Host-based markdown routing for tino.md against a running server.
//
//   bun run build && bun run test:tino-md

import { execFileSync, spawn } from "node:child_process"
import { setTimeout as sleep } from "node:timers/promises"

const MD_TYPE = "text/markdown; charset=utf-8"

async function startServer() {
  const port = process.env.PORT ?? "3124"
  const server = spawn("node_modules/.bin/next", ["start", "-p", port], {
    stdio: "ignore",
  })
  const url = `http://127.0.0.1:${port}`
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return { url, server }
    } catch {}
    await sleep(500)
  }
  server.kill()
  throw new Error(`next start did not come up on ${url}`)
}

/** curl so we can set Host (Node fetch forbids it). */
function req(base, path, host, { accept } = {}) {
  const url = new URL(path, base).href
  const args = ["-sS", "-D", "-", "-o", "-", "-H", `Host: ${host}`]
  if (accept) args.push("-H", `Accept: ${accept}`)
  // Do not follow redirects; we assert Location ourselves.
  args.push("--max-redirs", "0", url)
  let raw
  try {
    raw = execFileSync("curl", args, { encoding: "utf8" })
  } catch (err) {
    // curl exits 47 on --max-redirs 0 when a redirect is returned; headers+body still print.
    raw = (err.stdout ?? "") + (err.stderr ?? "")
    if (!raw.includes("HTTP/")) throw err
  }
  const sep = raw.indexOf("\r\n\r\n")
  const head = sep === -1 ? raw : raw.slice(0, sep)
  const body = sep === -1 ? "" : raw.slice(sep + 4)
  const status = Number(/HTTP\/[\d.]+ (\d+)/.exec(head)?.[1] ?? 0)
  const type = /^content-type:\s*(.+)$/im.exec(head)?.[1]?.trim() ?? null
  const location = /^location:\s*(.+)$/im.exec(head)?.[1]?.trim() ?? null
  return { status, type, body, location }
}

const own = process.env.BASE_URL ? null : await startServer()
const base = (process.env.BASE_URL ?? own.url).replace(/\/$/, "")
const failures = []

try {
  {
    const r = req(base, "/", "tino.md")
    if (r.status !== 200) failures.push(`tino.md / status ${r.status}`)
    if (r.type !== MD_TYPE) failures.push(`tino.md / type ${r.type}`)
    if (!/#|\btino\b/i.test(r.body)) {
      failures.push("tino.md / body does not look like markdown")
    }
    if (!/^html:\s*\[tino\.software\]\(https:\/\/tino\.software\)$/m.test(r.body)) {
      failures.push("tino.md / missing html link back to tino.software")
    }
    if (!/\[site info\]\(\/site\)/.test(r.body)) {
      failures.push("tino.md / missing tino.md-relative link to /site")
    }
  }

  {
    const r = req(base, "/site", "tino.md")
    if (r.status !== 200) failures.push(`tino.md /site status ${r.status}`)
    if (r.type !== MD_TYPE) failures.push(`tino.md /site type ${r.type}`)
    if (!/^html:\s*\[tino\.software\/site\]\(https:\/\/tino\.software\/site\)$/m.test(r.body)) {
      failures.push("tino.md /site missing html link back to tino.software/site")
    }
    if (!/\[back\]\(\/\)/.test(r.body)) {
      failures.push("tino.md /site missing tino.md-relative link to /")
    }
  }

  {
    const r = req(base, "/site.md", "tino.md")
    if (r.status !== 200) failures.push(`tino.md /site.md status ${r.status}`)
    if (r.type !== MD_TYPE) failures.push(`tino.md /site.md type ${r.type}`)
  }

  {
    const r = req(base, "/index.md", "tino.md")
    if (r.status !== 200) failures.push(`tino.md /index.md status ${r.status}`)
    if (r.type !== MD_TYPE) failures.push(`tino.md /index.md type ${r.type}`)
  }

  {
    const r = req(base, "/nope", "tino.md")
    if (r.status !== 404) failures.push(`tino.md /nope status ${r.status}`)
    if (r.type !== MD_TYPE) failures.push(`tino.md /nope type ${r.type}`)
    if (r.body.includes("<html")) failures.push("tino.md /nope returned HTML")
  }

  {
    const r = req(base, "/nope.md", "tino.md")
    if (r.status !== 404) failures.push(`tino.md /nope.md status ${r.status}`)
    if (r.type !== MD_TYPE) failures.push(`tino.md /nope.md type ${r.type}`)
    if (r.body.includes("<html")) failures.push("tino.md /nope.md returned HTML")
  }

  {
    const r = req(base, "/site?x=1", "www.tino.md")
    if (r.status !== 308) failures.push(`www.tino.md status ${r.status}`)
    if (!r.location?.startsWith("https://tino.md/site")) {
      failures.push(`www.tino.md location ${r.location}`)
    }
  }

  {
    const r = req(base, "/", "localhost", { accept: "text/html" })
    if (r.status !== 200) failures.push(`localhost / status ${r.status}`)
    if (!r.type?.includes("text/html")) failures.push(`localhost / type ${r.type}`)
  }

  {
    const r = req(base, "/index.md", "localhost")
    if (r.status !== 200) failures.push(`localhost /index.md status ${r.status}`)
    if (r.type !== MD_TYPE) failures.push(`localhost /index.md type ${r.type}`)
    if (!/^markdown:\s*\[tino\.md\]\(https:\/\/tino\.md\)$/m.test(r.body)) {
      failures.push("localhost /index.md missing markdown link to tino.md")
    }
  }

  {
    const r = req(base, "/site.md", "localhost")
    if (r.status !== 200) failures.push(`localhost /site.md status ${r.status}`)
    if (r.type !== MD_TYPE) failures.push(`localhost /site.md type ${r.type}`)
    if (!/^markdown:\s*\[tino\.md\/site\]\(https:\/\/tino\.md\/site\)$/m.test(r.body)) {
      failures.push("localhost /site.md missing markdown link to tino.md/site")
    }
  }

  if (failures.length) {
    console.error("tino.md checks failed:")
    for (const f of failures) console.error(" -", f)
    process.exitCode = 1
  } else {
    console.log("tino.md ok")
  }
} finally {
  own?.server.kill()
}
