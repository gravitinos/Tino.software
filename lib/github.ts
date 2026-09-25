import "server-only"

export const GITHUB_USER = "gravitinos"

const REVALIDATE = 60 * 60 // 1h

type Repo = {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  fork: boolean
  pushed_at: string
}

type ContributionDay = { date: string; count: number }

type PushEvent = {
  type: string
  created_at: string
  repo: { name: string }
  payload: { commits?: { message: string }[]; ref_type?: string; action?: string }
}

export type GitHubStats = {
  ok: boolean
  user: {
    name: string
    login: string
    bio: string | null
    followers: number
    publicRepos: number
    createdAt: string | null
  }
  stars: number
  forks: number
  contributions: ContributionDay[]
  contributionsTotal: number
  weekly: number[]
  languages: { label: string; value: number }[]
  topRepos: Repo[]
  recent: { date: string; label: string }[]
}

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tino.software",
  }
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: headers(),
      next: { revalidate: REVALIDATE },
      ...init,
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/** Last year of daily contributions. GraphQL with a token, public proxy without. */
async function getContributions(): Promise<ContributionDay[]> {
  if (process.env.GITHUB_TOKEN) {
    const query = `query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }`
    const data = await getJson<{
      data?: {
        user?: {
          contributionsCollection: {
            contributionCalendar: {
              weeks: {
                contributionDays: { date: string; contributionCount: number }[]
              }[]
            }
          }
        }
      }
    }>("https://api.github.com/graphql", {
      method: "POST",
      body: JSON.stringify({ query, variables: { login: GITHUB_USER } }),
    })
    const weeks =
      data?.data?.user?.contributionsCollection.contributionCalendar.weeks
    if (weeks) {
      return weeks.flatMap((w) =>
        w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
        }))
      )
    }
  }

  const data = await getJson<{ contributions: ContributionDay[] }>(
    `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`
  )
  return data?.contributions.map(({ date, count }) => ({ date, count })) ?? []
}

function describe(event: PushEvent): string | null {
  const repo = event.repo.name.replace(`${GITHUB_USER}/`, "")
  switch (event.type) {
    case "PushEvent": {
      const msg = event.payload.commits?.at(-1)?.message.split("\n")[0]
      return msg ? `${repo}: ${msg}` : `pushed to ${repo}`
    }
    case "PullRequestEvent":
      return `${event.payload.action} a pull request in ${repo}`
    case "CreateEvent":
      return event.payload.ref_type === "repository"
        ? `created ${repo}`
        : null
    case "WatchEvent":
      return `starred ${repo}`
    case "ReleaseEvent":
      return `released ${repo}`
    default:
      return null
  }
}

function lowercase(s: string, max = 52) {
  const t = s.toLowerCase()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

export async function getGitHubStats(): Promise<GitHubStats> {
  const [user, repos, events, contributions] = await Promise.all([
    getJson<{
      name: string | null
      login: string
      bio: string | null
      followers: number
      public_repos: number
      created_at: string
    }>(`https://api.github.com/users/${GITHUB_USER}`),
    getJson<Repo[]>(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`
    ),
    getJson<PushEvent[]>(
      `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=50`
    ),
    getContributions(),
  ])

  const own = (repos ?? []).filter((r) => !r.fork)

  const languageCounts = new Map<string, number>()
  for (const r of own) {
    if (r.language) {
      languageCounts.set(r.language, (languageCounts.get(r.language) ?? 0) + 1)
    }
  }
  const languages = [...languageCounts]
    .map(([label, value]) => ({ label: label.toLowerCase(), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const topRepos = [...own]
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        +new Date(b.pushed_at) - +new Date(a.pushed_at)
    )
    .slice(0, 6)

  // Weekly totals for the last 12 weeks, oldest first.
  const weekly: number[] = []
  for (let i = contributions.length; i > 0 && weekly.length < 12; i -= 7) {
    weekly.unshift(
      contributions
        .slice(Math.max(0, i - 7), i)
        .reduce((sum, d) => sum + d.count, 0)
    )
  }

  const seen = new Set<string>()
  const recent: GitHubStats["recent"] = []
  for (const e of events ?? []) {
    const label = describe(e)
    if (!label || seen.has(label)) continue
    seen.add(label)
    recent.push({
      date: new Date(e.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }).toLowerCase(),
      label: lowercase(label),
    })
    if (recent.length === 5) break
  }

  return {
    ok: user != null,
    user: {
      name: user?.name ?? GITHUB_USER,
      login: user?.login ?? GITHUB_USER,
      bio: user?.bio ?? null,
      followers: user?.followers ?? 0,
      publicRepos: user?.public_repos ?? 0,
      createdAt: user?.created_at ?? null,
    },
    stars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
    forks: own.reduce((sum, r) => sum + r.forks_count, 0),
    contributions,
    contributionsTotal: contributions.reduce((sum, d) => sum + d.count, 0),
    weekly,
    languages,
    topRepos,
    recent,
  }
}
