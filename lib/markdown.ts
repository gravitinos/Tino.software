import { fence } from "@/registry/default/graph-knap/frame"
import { asciiSpark, asciiStat } from "@/registry/default/graph-knap/graphs"

import {
  BUILD_URL,
  GITHUB_URL,
  GITHUB_USER,
  type GitHubStats,
} from "@/lib/github"

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function formatCompact(n: number) {
  return compact.format(n)
}

/** Stat items shared by the HTML and markdown views. */
export function statItems(gh: GitHubStats) {
  const since = gh.createdAt ? new Date(gh.createdAt).getFullYear() : null
  return [
    { value: String(gh.publicRepos), label: "repos" },
    { value: formatCompact(gh.stars), label: "stars" },
    { value: formatCompact(gh.contributionsTotal), label: "contributions, 1y" },
    ...(since ? [{ value: String(since), label: "since" }] : []),
  ]
}

/** Weekly contribution totals, oldest first. */
function weekly(gh: GitHubStats) {
  const weeks: number[] = []
  for (let i = 0; i < gh.contributions.length; i += 7) {
    weeks.push(
      gh.contributions.slice(i, i + 7).reduce((sum, d) => sum + d.count, 0)
    )
  }
  return weeks
}

export function homeMarkdown(gh: GitHubStats) {
  const parts = [
    "# tino",
    `Software. [github.com/${GITHUB_USER}](${GITHUB_URL})`,
    `Experiments: [tino.build](${BUILD_URL})`,
  ]

  if (gh.ok) {
    parts.push("## GitHub")
    if (gh.lastPushAt) {
      const at = new Date(gh.lastPushAt).toISOString().slice(0, 16)
      parts.push(`Last commit: ${at.replace("T", " ")} UTC`)
    }
    parts.push(fence(asciiStat({ title: "GitHub", items: statItems(gh) })))
    if (gh.contributions.length > 0) {
      parts.push(
        fence(
          asciiSpark({
            title: "Last year",
            data: weekly(gh),
            caption: `${gh.contributionsTotal.toLocaleString("en-US")} contributions, by week`,
          })
        )
      )
    }
  }

  parts.push("---", `tino.software · [github](${GITHUB_URL})`)

  return parts.join("\n\n") + "\n"
}
