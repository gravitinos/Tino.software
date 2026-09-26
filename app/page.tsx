import Link from "next/link"

import { PageTransition, TitleTransition } from "@/components/page-transition"
import { PixelWord } from "@/components/pixel-word"
import { Swappable } from "@/components/view-mode"
import {
  BUILD_URL,
  getGitHubStats,
  GITHUB_URL,
  GITHUB_USER,
} from "@/lib/github"
import { homeMarkdown, statItems } from "@/lib/markdown"
import { GraphActivity } from "@/registry/default/graph-activity/graph-activity"
import { Graph, GraphBody } from "@/registry/default/graph-frame/graph-frame"
import { GraphStat } from "@/registry/default/graph-stat/graph-stat"
import { GraphTimer } from "@/registry/default/graph-timer/graph-timer"

export const revalidate = 300

const link =
  "text-foreground underline decoration-graph-frame underline-offset-4 hover:decoration-graph-accent"

export default async function Page() {
  const gh = await getGitHubStats()

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 sm:px-8">
      <PageTransition>
        <Swappable title="tino" markdown={homeMarkdown(gh)}>
          <main className="flex flex-1 flex-col gap-16 py-20 sm:py-32">
            <section className="flex flex-col gap-8">
              <h1>
                <TitleTransition>
                  <PixelWord text="tino" className="text-[clamp(5rem,22vw,11rem)]" />
                </TitleTransition>
              </h1>
              <p className="text-sm text-graph-muted">
                Software.{" "}
                <a className={link} href={GITHUB_URL} rel="noreferrer" target="_blank">
                  github.com/{GITHUB_USER}
                </a>
              </p>
            </section>

            <section className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              <Graph title="Experiments">
                <GraphBody className="flex flex-col gap-2">
                  <a
                    className="text-3xl tracking-tight text-graph-accent hover:underline hover:underline-offset-4 sm:text-4xl"
                    href={BUILD_URL}
                    rel="noreferrer"
                    target="_blank"
                  >
                    tino.build
                  </a>
                  <p className="text-graph-muted">kitchen sink, things in progress</p>
                </GraphBody>
              </Graph>
              {gh.lastPushAt ? (
                <GraphTimer
                  title="Last commit"
                  kind="ago"
                  at={gh.lastPushAt}
                  caption="pushed to github"
                />
              ) : null}
            </section>

            {gh.ok ? (
              <section className="flex flex-col gap-10">
                <GraphStat title="GitHub" items={statItems(gh)} />
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
            <span className="flex gap-4">
              <Link
                className="hover:text-foreground"
                href="/site"
                transitionTypes={["nav-forward"]}
              >
                site info
              </Link>
              <a className="hover:text-foreground" href={GITHUB_URL} rel="noreferrer" target="_blank">
                github
              </a>
            </span>
          </footer>
        </Swappable>
      </PageTransition>
    </div>
  )
}
