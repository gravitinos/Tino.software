import { siteMarkdown } from "@/lib/site"

export const dynamic = "force-static"

export function GET() {
  return new Response(siteMarkdown(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
