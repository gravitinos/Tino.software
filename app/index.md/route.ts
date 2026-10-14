import { getGitHubStats } from "@/lib/github"
import { homeMarkdown } from "@/lib/markdown"
import { markdownSurface } from "@/lib/markdown-twin"

export const revalidate = 300

export async function GET(request: Request) {
  const surface = markdownSurface(request.headers.get("host"))
  return new Response(homeMarkdown(await getGitHubStats(), surface), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
