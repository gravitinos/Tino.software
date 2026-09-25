import "server-only"

export const GITHUB_USER = "gravitinos"
export const GITHUB_URL = `https://github.com/${GITHUB_USER}`

const REVALIDATE = 60 * 60 // 1h

type ContributionDay = { date: string; count: number }

export type GitHubStats = {
  ok: boolean
  publicRepos: number
  createdAt: string | null
  stars: number
  contributions: ContributionDay[]
  contributionsTotal: number
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

export async function getGitHubStats(): Promise<GitHubStats> {
  const [user, repos, contributions] = await Promise.all([
    getJson<{ public_repos: number; created_at: string }>(
      `https://api.github.com/users/${GITHUB_USER}`
    ),
    getJson<{ fork: boolean; stargazers_count: number }[]>(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`
    ),
    getContributions(),
  ])

  return {
    ok: user != null,
    publicRepos: user?.public_repos ?? 0,
    createdAt: user?.created_at ?? null,
    stars: (repos ?? [])
      .filter((r) => !r.fork)
      .reduce((sum, r) => sum + r.stargazers_count, 0),
    contributions,
    contributionsTotal: contributions.reduce((sum, d) => sum + d.count, 0),
  }
}
