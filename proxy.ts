import { existsSync } from "node:fs"
import { join } from "node:path"

import { NextResponse, type NextRequest } from "next/server"

import { MD_HOST, toMarkdownPath } from "@/lib/markdown-twin"

// Terminal clients: they send a wildcard Accept but have no use for HTML.
const CLI = /^(curl|wget|httpie|xh|fetch)\b/i

function hostname(request: NextRequest) {
  return (request.headers.get("host") ?? "").split(":")[0]!.toLowerCase()
}

/** Serves the markdown twin when the client asks for it or is a terminal. */
function wantsMarkdown(request: NextRequest) {
  const accept = request.headers.get("accept") ?? ""
  if (/\btext\/markdown\b/.test(accept)) return true
  if (/\btext\/html\b/.test(accept)) return false
  return CLI.test(request.headers.get("user-agent") ?? "")
}

function notFoundMarkdown() {
  return new NextResponse("# Not Found\n", {
    status: 404,
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}

/** True when `app/<name>.md/route.ts` exists (no hardcoded path list). */
function hasMarkdownRoute(markdownPath: string) {
  const dir = join(process.cwd(), "app", markdownPath.slice(1))
  return existsSync(join(dir, "route.ts"))
}

/**
 * Host-based markdown site (tino.md) and Accept/UA negotiation (tino.software).
 * www.tino.md always redirects to tino.md.
 *
 * On tino.md, any path P maps to the markdown twin for P (`/` → `/index.md`,
 * `/foo` → `/foo.md`, …) when that route exists; unknown paths (including
 * explicit `/foo.md`) get a clean markdown 404.
 */
export function proxy(request: NextRequest) {
  const host = hostname(request)
  const { pathname } = request.nextUrl

  if (host === `www.${MD_HOST}`) {
    const url = request.nextUrl.clone()
    url.hostname = MD_HOST
    url.protocol = "https:"
    url.port = ""
    return NextResponse.redirect(url, 308)
  }

  // Non-markdown static files (images, favicon, …) — leave alone.
  if (pathname.includes(".") && !pathname.endsWith(".md")) {
    return NextResponse.next()
  }

  const markdown = toMarkdownPath(pathname)

  if (host === MD_HOST) {
    if (!markdown || !hasMarkdownRoute(markdown)) return notFoundMarkdown()
    // Explicit `/index.md` — hand off to the route handler.
    if (pathname === markdown) return NextResponse.next()
    return NextResponse.rewrite(new URL(markdown, request.url))
  }

  if (!markdown || !hasMarkdownRoute(markdown)) return NextResponse.next()

  // Explicit `/index.md` on tino.software — serve the handler as-is.
  if (pathname === markdown) return NextResponse.next()

  const response = wantsMarkdown(request)
    ? NextResponse.rewrite(new URL(markdown, request.url))
    : NextResponse.next()
  response.headers.set("Vary", "Accept, User-Agent")
  response.headers.set("Link", `<${markdown}>; rel="alternate"; type="text/markdown"`)
  return response
}

export const config = {
  // Pages and `.md` twins. Skip Next internals; other extensions are filtered
  // in `proxy` so tino.md can return a clean markdown 404 for `/foo.md`.
  matcher: ["/", "/((?!_next/static|_next/image).*)"],
}
