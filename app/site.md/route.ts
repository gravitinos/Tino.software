import { markdownSurface } from "@/lib/markdown-twin"
import { siteMarkdown } from "@/lib/site"

export function GET(request: Request) {
  const surface = markdownSurface(request.headers.get("host"))
  return new Response(siteMarkdown(surface), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
