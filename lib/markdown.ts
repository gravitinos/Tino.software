import { fence } from "@/registry/default/graph-knap/frame"
import { asciiSpark, asciiStat } from "@/registry/default/graph-knap/graphs"

import {
  busiestDay,
  dayLabel,
  lastDays,
  markdownTable,
  monthlyTotals,
  streaks,
} from "@/lib/contributions"
import {
  BUILD_URL,
  GITHUB_URL,
  GITHUB_USER,
  LINKEDIN_URL,
  type GitHubStats,
} from "@/lib/github"
import {
  crossLinkFooter,
  type MarkdownSurface,
} from "@/lib/markdown-twin"

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

function contributionDetails(gh: GitHubStats): string[] {
  const days = gh.contributions
  if (days.length === 0) return []

  const parts: string[] = []
  const recent = lastDays(days, 30)
  parts.push("### Last 30 days")
  parts.push(
    markdownTable(
      ["Date", "Contributions"],
      recent.map((day) => [day.date, String(day.count)])
    )
  )

  const busy = busiestDay(days)
  if (busy) {
    parts.push(`Busiest day: ${dayLabel(busy)} (\`${busy.date}\`)`)
  }

  const { current, longest } = streaks(days)
  parts.push(
    `Current streak: ${current} day${current === 1 ? "" : "s"} · Longest streak: ${longest} day${longest === 1 ? "" : "s"}`
  )

  const months = monthlyTotals(days)
  if (months.length > 0) {
    parts.push("### By month")
    parts.push(
      markdownTable(
        ["Month", "Contributions"],
        months.map((row) => [row.month, String(row.total)])
      )
    )
  }

  return parts
}

export function homeMarkdown(
  gh: GitHubStats,
  surface: MarkdownSurface = "software"
) {
  const brand = surface === "md" ? "tino.md" : "tino.software"
  const parts = [
    "# tino",
    `Software. [github.com/${GITHUB_USER}](${GITHUB_URL}) · [linkedin](${LINKEDIN_URL})`,
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
      parts.push(...contributionDetails(gh))
    }
  }

  parts.push(
    "---",
    `${brand} · [github](${GITHUB_URL}) · [linkedin](${LINKEDIN_URL})`,
    crossLinkFooter("/", surface)
  )

  return parts.join("\n\n") + "\n"
}
