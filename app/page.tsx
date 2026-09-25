import type { ReactNode } from "react"
import Link from "next/link"

import { PixelWord } from "@/components/pixel-word"
import { getGitHubStats, GITHUB_USER } from "@/lib/github"
import { GraphActivity } from "@/registry/default/graph-activity/graph-activity"
import { GraphCheck } from "@/registry/default/graph-check/graph-check"
import { GraphKpi } from "@/registry/default/graph-kpi/graph-kpi"
import { GraphRank } from "@/registry/default/graph-rank/graph-rank"
import { GraphStat } from "@/registry/default/graph-stat/graph-stat"
import { GraphTable } from "@/registry/default/graph-table/graph-table"
import { GraphTimeline } from "@/registry/default/graph-timeline/graph-timeline"
import { GraphTimer } from "@/registry/default/graph-timer/graph-timer"
import { GraphTree } from "@/registry/default/graph-tree/graph-tree"
import { Terminal } from "@/registry/default/terminal/terminal"

export const revalidate = 3600

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

function Section({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <section id={id} className="flex flex-col gap-10 py-14 sm:py-20">
      <h2 className="font-pixel text-2xl tracking-wide text-graph-muted uppercase sm:text-3xl">
        {label}
      </h2>
      {children}
    </section>
  )
}

export default async function Page() {
  const gh = await getGitHubStats()
  const since = gh.user.createdAt ? new Date(gh.user.createdAt) : null
  const years = since
    ? Math.max(1, new Date().getFullYear() - since.getFullYear())
    : null
  const thisWeek = gh.weekly.at(-1) ?? 0
  const lastWeek = gh.weekly.at(-2) ?? 0

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-8">
      <header className="flex items-center justify-between py-6 text-sm">
        <Link href="/" className="font-pixel text-base tracking-wide uppercase">
          tino.software
        </Link>
        <nav className="flex gap-4 text-graph-muted sm:gap-5">
          <a className="hover:text-foreground" href="#github">
            github
          </a>
          <a className="hover:text-foreground" href="#resume">
            resume
          </a>
          <a
            className="hidden hover:text-foreground sm:inline"
            href={`https://github.com/${GITHUB_USER}`}
            rel="noreferrer"
            target="_blank"
          >
            @{GITHUB_USER}
          </a>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section className="grid grid-cols-1 gap-12 pt-10 pb-14 sm:pt-20 sm:pb-20 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end">
          <div className="flex flex-col gap-8">
            <h1 className="flex flex-col gap-3">
              <PixelWord
                text="tino"
                className="text-[clamp(5rem,22vw,12rem)]"
              />
              <PixelWord
                text="software"
                className="text-[clamp(2.4rem,10.5vw,5.75rem)] text-graph-muted"
              />
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-graph-muted">
              I build software. This page is drawn almost entirely with{" "}
              <a
                className="text-foreground underline decoration-graph-frame underline-offset-4 hover:decoration-graph-accent"
                href="https://mdxcn.dev"
                rel="noreferrer"
                target="_blank"
              >
                mdxcn
              </a>
              : glyphs in dashed frames, no SVG, no canvas. The stats below
              come live from GitHub. Click the big letters.
            </p>
          </div>
          <div className="flex flex-col gap-10">
            <GraphTimer title="Local" kind="clock" caption="your time, ticking" />
            <Terminal title="Shell">
              {`$ bunx shadcn add @mdxcn/all
✓ 53 files copied
$ curl api.github.com/users/${GITHUB_USER}
✓ ${gh.ok ? "200 ok" : "offline, showing fallbacks"}
# resume: loading…`}
            </Terminal>
          </div>
        </section>

        {/* GITHUB */}
        <Section id="github" label="GitHub">
          <GraphStat
            title="At a glance"
            items={[
              { value: gh.user.publicRepos, label: "public repos" },
              { value: compact.format(gh.stars), label: "stars earned", accent: true },
              { value: compact.format(gh.contributionsTotal), label: "contributions, 1y" },
              {
                value: years ?? "—",
                label: "years on github",
                hint: since ? `since ${since.getFullYear()}` : undefined,
              },
            ]}
          />

          {gh.contributions.length > 0 ? (
            <GraphActivity
              title="Last year"
              days={gh.contributions}
              caption={`${gh.contributionsTotal.toLocaleString("en-US")} contributions`}
            />
          ) : null}

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <GraphKpi
              title="This week"
              value={thisWeek.toLocaleString("en-US")}
              label="contributions"
              hint={
                gh.weekly.length > 1
                  ? `${thisWeek >= lastWeek ? "+" : ""}${thisWeek - lastWeek} vs last week`
                  : undefined
              }
              data={gh.weekly.length > 1 ? gh.weekly : [0, 0]}
            />
            <GraphRank
              title="Languages"
              items={
                gh.languages.length > 0
                  ? gh.languages.map((l) => ({
                      label: l.label,
                      value: l.value,
                      display: `${l.value} ${l.value === 1 ? "repo" : "repos"}`,
                    }))
                  : [{ label: "typescript", value: 1, display: "—" }]
              }
            />
          </div>

          {gh.topRepos.length > 0 ? (
            <GraphTable
              title="Repos"
              headers={["repo", "language", "stars", "forks"]}
              align={["left", "left", "right", "right"]}
              rows={gh.topRepos.map((r) => [
                <a
                  key={r.name}
                  className="hover:text-graph-accent"
                  href={r.html_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {r.name.toLowerCase()}
                </a>,
                (r.language ?? "—").toLowerCase(),
                r.stargazers_count,
                r.forks_count,
              ])}
              footer={["total", "", gh.stars, gh.forks]}
            />
          ) : null}

          {gh.recent.length > 0 ? (
            <GraphTimeline
              title="Recently"
              events={gh.recent.map((e, i) => ({
                ...e,
                state: i === 0 ? "now" : "done",
              }))}
            />
          ) : null}
        </Section>

        {/* RESUME */}
        <Section id="resume" label="Resume">
          <p className="max-w-md text-sm leading-relaxed text-graph-muted">
            Work history lands here soon. Until then, the plan:
          </p>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <GraphTimeline
              title="Work"
              events={[
                { date: "now", label: "building tino.software", state: "now" },
                { date: "next", label: "resume, role by role", state: "next" },
                { date: "later", label: "writing, in mdx", state: "next" },
              ]}
            />
            <GraphCheck
              title="Site"
              items={[
                { label: "geist pixel", done: true },
                { label: "next.js + shadcn", done: true },
                { label: "mdxcn figures", done: true },
                { label: "live github stats", done: true },
                { label: "resume", done: false, note: "soon" },
              ]}
            />
          </div>
        </Section>

        {/* STACK */}
        <Section id="stack" label="Stack">
          <GraphTree
            title="This site"
            nodes={[
              {
                label: "tino.software",
                accent: true,
                children: [
                  { label: "next.js", meta: "app router" },
                  { label: "shadcn", meta: "components.json" },
                  {
                    label: "mdxcn",
                    meta: "@/registry/default",
                    accent: true,
                    children: [
                      { label: "graph-activity", meta: "contributions" },
                      { label: "graph-stat", meta: "totals" },
                      { label: "graph-rank", meta: "languages" },
                      { label: "graph-table", meta: "repos" },
                    ],
                  },
                  { label: "geist pixel", meta: "headlines" },
                  { label: "github api", meta: "revalidates hourly" },
                ],
              },
            ]}
          />
        </Section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-graph-frame py-8 text-xs text-graph-muted">
        <span className="font-pixel text-sm uppercase">tino.software</span>
        <span>
          figures by{" "}
          <a
            className="hover:text-foreground"
            href="https://mdxcn.dev"
            rel="noreferrer"
            target="_blank"
          >
            mdxcn
          </a>{" "}
          · type by geist pixel
        </span>
      </footer>
    </div>
  )
}
