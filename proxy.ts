import { NextResponse, type NextRequest } from "next/server"

/** Pages with a markdown twin. */
const MARKDOWN: Record<string, string> = {
  "/": "/index.md",
  "/site": "/site.md",
}

// Terminal clients: they send a wildcard Accept but have no use for HTML.
const CLI = /^(curl|wget|httpie|xh|fetch)\b/i

/** Serves the markdown twin when the client asks for it or is a terminal. */
function wantsMarkdown(request: NextRequest) {
  const accept = request.headers.get("accept") ?? ""
  if (/\btext\/markdown\b/.test(accept)) return true
  if (/\btext\/html\b/.test(accept)) return false
  return CLI.test(request.headers.get("user-agent") ?? "")
}

export function proxy(request: NextRequest) {
  const markdown = MARKDOWN[request.nextUrl.pathname]
  const response = wantsMarkdown(request)
    ? NextResponse.rewrite(new URL(markdown, request.url))
    : NextResponse.next()
  response.headers.set("Vary", "Accept, User-Agent")
  response.headers.set("Link", `<${markdown}>; rel="alternate"; type="text/markdown"`)
  return response
}

export const config = {
  matcher: ["/", "/site"],
}
