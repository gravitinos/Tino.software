import "server-only"

export const GITHUB_USER = "gravitinos"
export const GITHUB_URL = `https://github.com/${GITHUB_USER}`
export const BUILD_URL = "https://tino.build"
export const LINKEDIN_URL = "https://www.linkedin.com/in/valentino-e"

const REVALIDATE = 60 * 60 // 1h
/** The last-commit timer refetches more often; everything else stays hourly. */
const PUSH_REVALIDATE = 5 * 60 // 5m

type ContributionDay = { date: string; count: number }

export type GitHubStats = {
  ok: boolean
  /** Public repos, or public + private when GITHUB_TOKEN is the owner's. */
  publicRepos: number
  createdAt: string | null
  stars: number
  /** Most recent push, including private repos when GITHUB_TOKEN is the owner's. */
  lastPushAt: string | null
  contributions: ContributionDay[]
  contributionsTotal: number
}

function headers(auth = true): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tino.software",
  }
  if (auth && process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

async function getJson<T>(
  url: string,
  init?: RequestInit,
  revalidate = REVALIDATE,
  auth = true
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: headers(auth),
      next: { revalidate },
      ...init,
    })
    if (!res.ok) {
      if (
        auth &&
        process.env.GITHUB_TOKEN &&
        (res.status === 401 || res.status === 403)
      ) {
        console.error(
          `[github] GITHUB_TOKEN rejected (${res.status} ${res.statusText}) for ${url}; falling back to public data`
        )
      }
      return null
    }
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
    `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`,
    undefined,
    REVALIDATE,
    false
  )
  return data?.contributions.map(({ date, count }) => ({ date, count })) ?? []
}

type PushedRepo = { pushed_at: string | null; owner: { login: string } }

function newest(...dates: (string | null | undefined)[]): string | null {
  let best: string | null = null
  for (const d of dates) {
    if (d && (best == null || Date.parse(d) > Date.parse(best))) best = d
  }
  return best
}

/**
 * Newest push. The events API can lag by hours, so it's paired with the repo
 * list sorted by `pushed_at`, which updates as soon as a push lands. Both are
 * one small request on a short cache; the newest timestamp wins.
 */
async function getLastPushAt(): Promise<string | null> {
  const token = Boolean(process.env.GITHUB_TOKEN)
  const publicReposUrl = `https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=1`
  const publicEventsUrl = `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=30`

  const [authRepos, authEvents] = await Promise.all([
    // With the owner's token, /user/repos includes private repos.
    token
      ? getJson<PushedRepo[]>(
          "https://api.github.com/user/repos?affiliation=owner&sort=pushed&per_page=1",
          undefined,
          PUSH_REVALIDATE
        )
      : Promise.resolve(null),
    // Catches pushes to repos the user doesn't own. Authenticated as the owner,
    // /events includes private activity; only the timestamp is used, so
    // private repo names never reach the page.
    token
      ? getJson<{ type: string; created_at: string }[]>(
          `https://api.github.com/users/${GITHUB_USER}/events?per_page=30`,
          undefined,
          PUSH_REVALIDATE
        )
      : Promise.resolve(null),
  ])

  const [repos, events] = await Promise.all([
    authRepos ??
      getJson<PushedRepo[]>(publicReposUrl, undefined, PUSH_REVALIDATE, false),
    authEvents ??
      getJson<{ type: string; created_at: string }[]>(
        publicEventsUrl,
        undefined,
        PUSH_REVALIDATE,
        false
      ),
  ])
  const repo = repos?.[0]
  return newest(
    repo?.owner.login.toLowerCase() === GITHUB_USER ? repo.pushed_at : null,
    events?.find((e) => e.type === "PushEvent")?.created_at
  )
}

type PublicUser = { public_repos: number; created_at: string }
type AuthUser = PublicUser & {
  login: string
  total_private_repos?: number
}

/**
 * Profile for repo count + account age. With the owner's token, `/user` includes
 * `total_private_repos`; on auth failure we log and fall back to the public user.
 */
async function getProfile(): Promise<PublicUser | null> {
  if (process.env.GITHUB_TOKEN) {
    const me = await getJson<AuthUser>("https://api.github.com/user")
    if (me && me.login.toLowerCase() === GITHUB_USER) {
      return {
        public_repos: me.public_repos + (me.total_private_repos ?? 0),
        created_at: me.created_at,
      }
    }
    // Token rejected or wrong account — public profile without Authorization.
    return getJson<PublicUser>(
      `https://api.github.com/users/${GITHUB_USER}`,
      undefined,
      REVALIDATE,
      false
    )
  }

  return getJson<PublicUser>(`https://api.github.com/users/${GITHUB_USER}`)
}

export async function getGitHubStats(): Promise<GitHubStats> {
  const [user, repos, lastPushAt, contributions] = await Promise.all([
    getProfile(),
    // Stars are public; skip Authorization so a bad token cannot block this.
    getJson<{ fork: boolean; stargazers_count: number }[]>(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`,
      undefined,
      REVALIDATE,
      false
    ),
    getLastPushAt(),
    getContributions(),
  ])

  return {
    ok: user != null,
    publicRepos: user?.public_repos ?? 0,
    createdAt: user?.created_at ?? null,
    stars: (repos ?? [])
      .filter((r) => !r.fork)
      .reduce((sum, r) => sum + r.stargazers_count, 0),
    lastPushAt,
    contributions,
    contributionsTotal: contributions.reduce((sum, d) => sum + d.count, 0),
  }
}
