import { NextResponse, type NextRequest } from "next/server"

/** Pages with a markdown twin. */
const MARKDOWN: Record<string, string> = {
  "/": "/index.md",
  "/site": "/site.md",
}

const MD_HOST = "tino.md"

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

/**
 * Host-based markdown site (tino.md) and Accept/UA negotiation (tino.software).
 * www.tino.md always redirects to tino.md.
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

  if (host === MD_HOST) {
    const markdown = MARKDOWN[pathname]
    if (!markdown) return notFoundMarkdown()
    return NextResponse.rewrite(new URL(markdown, request.url))
  }

  const markdown = MARKDOWN[pathname]
  if (!markdown) return NextResponse.next()

  const response = wantsMarkdown(request)
    ? NextResponse.rewrite(new URL(markdown, request.url))
    : NextResponse.next()
  response.headers.set("Vary", "Accept, User-Agent")
  response.headers.set("Link", `<${markdown}>; rel="alternate"; type="text/markdown"`)
  return response
}

export const config = {
  // Page routes only. Skip Next internals and any path with a file extension
  // (favicon, images, explicit `/index.md` handlers, etc.).
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
