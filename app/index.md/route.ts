import { getGitHubStats } from "@/lib/github"
import { homeMarkdown } from "@/lib/markdown"

export const revalidate = 3600

export async function GET() {
  return new Response(homeMarkdown(await getGitHubStats()), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
