import type { Metadata } from "next"
import Link from "next/link"

import { TitleTransition } from "@/components/page-transition"
import { PixelWord } from "@/components/pixel-word"
import { Swappable } from "@/components/view-mode"
import { GITHUB_URL } from "@/lib/github"
import {
  clientParts,
  commands,
  registry,
  siteMarkdown,
  stack,
  views,
} from "@/lib/site"
import { GraphSpec } from "@/registry/default/graph-spec/graph-spec"
import { GraphTree } from "@/registry/default/graph-tree/graph-tree"
import { Terminal } from "@/registry/default/terminal/terminal"
import { GraphTabs, Tab } from "@/registry/tino/graph-tabs/graph-tabs"

export const metadata: Metadata = {
  title: "site · tino.software",
  description: "How tino.software is built.",
}

const link =
  "text-foreground underline decoration-graph-frame underline-offset-4 hover:decoration-graph-accent"

export default function Page() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 sm:px-8">
      <Swappable title="site" markdown={siteMarkdown()}>
        <main className="flex flex-1 flex-col gap-16 py-20 sm:py-32">
          <section className="flex flex-col gap-8">
            <h1>
              <TitleTransition>
                <PixelWord text="site" className="text-[clamp(4rem,16vw,8rem)]" />
              </TitleTransition>
            </h1>
            <p className="text-sm text-graph-muted">
              How tino.software is built.{" "}
              <Link className={link} href="/">
                back
              </Link>
            </p>
          </section>

          <GraphTabs title="Stack">
            {stack.map((tab) => (
              <Tab key={tab.label} label={tab.label}>
                <p>{tab.body}</p>
              </Tab>
            ))}
          </GraphTabs>

          <section className="grid grid-cols-1 gap-10 sm:grid-cols-2">
            <GraphTree title="Registry" nodes={registry} />
            <Terminal title="Local">{commands.join("\n")}</Terminal>
          </section>

          <GraphSpec title="Client JS" rows={clientParts} />
          <GraphSpec title="Markdown" rows={views} />
        </main>

        <footer className="flex justify-between py-8 text-xs text-graph-muted">
          <Link className="hover:text-foreground" href="/">
            tino.software
          </Link>
          <a className="hover:text-foreground" href={GITHUB_URL} rel="noreferrer" target="_blank">
            github
          </a>
        </footer>
      </Swappable>
    </div>
  )
}
