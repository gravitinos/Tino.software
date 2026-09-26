import Link from "next/link"

import { TitleTransition } from "@/components/page-transition"
import { PixelWord } from "@/components/pixel-word"
import { Swappable } from "@/components/view-mode"
import {
  BUILD_URL,
  getGitHubStats,
  GITHUB_URL,
  GITHUB_USER,
  type GitHubStats,
} from "@/lib/github"
import { formatCompact, homeMarkdown, statItems } from "@/lib/markdown"
import { GraphTimer } from "@/registry/default/graph-timer/graph-timer"
import { GraphYear } from "@/registry/tino/graph-year/graph-year"

export const revalidate = 300

const link =
  "text-foreground underline decoration-graph-frame underline-offset-4 hover:decoration-graph-accent"

/** Repos, stars and start year in one line; contributions sit in the title. */
function statsLine(gh: GitHubStats) {
  return statItems(gh)
    .filter((item) => !item.label.startsWith("contributions"))
    .map((item) => {
      if (item.label === "since") return `since ${item.value}`
      const label = item.value === "1" ? item.label.replace(/s$/, "") : item.label
      return `${item.value} ${label}`
    })
    .join(" · ")
}

export default async function Page() {
  const gh = await getGitHubStats()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 sm:px-8">
      <Swappable title="tino" markdown={homeMarkdown(gh)}>
        <main data-still className="flex flex-1 flex-col gap-14 py-20 sm:gap-20 sm:py-28">
          <section className="flex flex-col gap-6">
            <h1>
              <TitleTransition>
                <PixelWord text="tino" className="-mb-[0.22em] text-[clamp(5rem,22vw,11rem)]" />
              </TitleTransition>
            </h1>
            <div className="flex flex-col gap-2 text-sm text-graph-muted">
              <p>
                Software.{" "}
                <a className={link} href={GITHUB_URL} rel="noreferrer" target="_blank">
                  github.com/{GITHUB_USER}
                </a>
              </p>
              <p>
                Experiments at{" "}
                <a className={link} href={BUILD_URL} rel="noreferrer" target="_blank">
                  tino.build
                </a>
                , the kitchen sink.
              </p>
            </div>
          </section>

          {gh.ok ? (
            <section className="flex flex-col gap-10 sm:flex-row sm:items-stretch sm:gap-6">
              {gh.contributions.length > 0 ? (
                <GraphYear
                  title={`Last year · ${formatCompact(gh.contributionsTotal)}`}
                  days={gh.contributions}
                  caption={statsLine(gh)}
                  className="sm:flex-1"
                />
              ) : null}
              {gh.lastPushAt ? (
                <GraphTimer
                  title="Last commit"
                  kind="ago"
                  at={gh.lastPushAt}
                  caption="pushed to github"
                  className="sm:w-56 sm:shrink-0"
                />
              ) : null}
            </section>
          ) : null}
        </main>

        <footer className="flex justify-between py-8 text-xs text-graph-muted">
          <span>tino.software</span>
          <span className="flex gap-4">
            <Link className="hover:text-foreground" href="/site">
              site info
            </Link>
            <a className="hover:text-foreground" href={GITHUB_URL} rel="noreferrer" target="_blank">
              github
            </a>
          </span>
        </footer>
      </Swappable>
    </div>
  )
}
