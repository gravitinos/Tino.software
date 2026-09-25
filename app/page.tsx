import { PixelWord } from "@/components/pixel-word"
import { getGitHubStats, GITHUB_URL, GITHUB_USER } from "@/lib/github"
import { GraphActivity } from "@/registry/default/graph-activity/graph-activity"
import { GraphStat } from "@/registry/default/graph-stat/graph-stat"

export const revalidate = 3600

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const link =
  "text-foreground underline decoration-graph-frame underline-offset-4 hover:decoration-graph-accent"

export default async function Page() {
  const gh = await getGitHubStats()
  const since = gh.createdAt ? new Date(gh.createdAt) : null

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 sm:px-8">
      <main className="flex flex-1 flex-col gap-16 py-20 sm:py-32">
        <section className="flex flex-col gap-8">
          <h1>
            <PixelWord text="tino" className="text-[clamp(5rem,22vw,11rem)]" />
          </h1>
          <p className="text-sm text-graph-muted">
            Software.{" "}
            <a className={link} href={GITHUB_URL} rel="noreferrer" target="_blank">
              github.com/{GITHUB_USER}
            </a>
          </p>
        </section>

        {gh.ok ? (
          <section className="flex flex-col gap-10">
            <GraphStat
              title="GitHub"
              items={[
                { value: gh.publicRepos, label: "repos" },
                { value: compact.format(gh.stars), label: "stars" },
                {
                  value: compact.format(gh.contributionsTotal),
                  label: "contributions, 1y",
                },
                ...(since
                  ? [{ value: since.getFullYear(), label: "since" }]
                  : []),
              ]}
            />
            {gh.contributions.length > 0 ? (
              <GraphActivity
                title="Last year"
                days={gh.contributions}
                legend={false}
              />
            ) : null}
          </section>
        ) : null}
      </main>

      <footer className="flex justify-between py-8 text-xs text-graph-muted">
        <span>tino.software</span>
        <a className="hover:text-foreground" href={GITHUB_URL} rel="noreferrer" target="_blank">
          github
        </a>
      </footer>
    </div>
  )
}
