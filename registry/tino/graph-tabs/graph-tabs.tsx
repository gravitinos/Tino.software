import type { ReactNode } from "react"
import { Tabs } from "@base-ui/react/tabs"

import {
  childItems,
  defineItem,
  Graph,
  GraphBody,
  GraphProse,
  GraphRule,
  headingSections,
} from "@/registry/default/graph-frame/graph-frame"
import { cn } from "@/lib/utils"

type TabProps = {
  /** Tab text. Also the value unless `value` is set. */
  label: string
  value?: string
  disabled?: boolean
  /** Markdown. The panel body. */
  children?: ReactNode
}

type GraphTabsProps = {
  title?: string
  /** Tab open on first paint. Defaults to the first tab. */
  defaultValue?: string
  children?: ReactNode
  corner?: string
  className?: string
}

/** `<Tab label="web">…</Tab>` inside `<GraphTabs>`. */
const Tab = defineItem<TabProps>("Tab")

function tabsOf(children: ReactNode): TabProps[] {
  const tagged = childItems(children, Tab)
  if (tagged.length > 0) {
    return tagged
  }

  return headingSections(children).map((section) => ({
    label: section.title,
    children: section.children,
  }))
}

/**
 * Panels in one frame. A Server Component: only the Base UI parts hydrate,
 * the panel bodies arrive as rendered HTML. Every panel is kept mounted so
 * find-in-page and crawlers see all of them.
 *
 * ```mdx
 * <GraphTabs title="STACK">
 *
 * ## web
 *
 * Next.js, Tailwind, mdxcn.
 *
 * ## infra
 *
 * Bun, Vercel.
 *
 * </GraphTabs>
 * ```
 *
 * Or `<Tab label="web">` children.
 */
function GraphTabs({
  title,
  defaultValue,
  children,
  corner,
  className,
}: GraphTabsProps) {
  const tabs = tabsOf(children)
  const valueOf = (tab: TabProps) => tab.value ?? tab.label

  if (tabs.length === 0) {
    return null
  }

  return (
    <Graph className={className} corner={corner} title={title}>
      <Tabs.Root defaultValue={defaultValue ?? valueOf(tabs[0]!)}>
        <Tabs.List className="graph-scroll-x relative flex gap-1 px-3 pt-6 sm:px-6 sm:pt-7">
          {tabs.map((tab) => (
            <Tabs.Tab
              className={cn(
                "group flex shrink-0 items-center px-2 py-1.5 whitespace-nowrap text-graph-muted uppercase select-none",
                "hover:text-foreground data-active:text-graph-accent data-disabled:text-graph-frame",
                "focus-visible:-outline-offset-2"
              )}
              disabled={tab.disabled}
              key={valueOf(tab)}
              value={valueOf(tab)}
            >
              <span
                aria-hidden="true"
                className="opacity-0 group-data-active:opacity-100"
              >
                [&nbsp;
              </span>
              {tab.label}
              <span
                aria-hidden="true"
                className="opacity-0 group-data-active:opacity-100"
              >
                &nbsp;]
              </span>
            </Tabs.Tab>
          ))}
          <Tabs.Indicator className="absolute bottom-0 left-0 h-px w-(--active-tab-width) translate-x-(--active-tab-left) bg-graph-accent transition-[translate,width] duration-200 ease-[cubic-bezier(0.215,0.61,0.355,1)] motion-reduce:transition-none" />
        </Tabs.List>
        <GraphRule />
        {tabs.map((tab) => (
          <Tabs.Panel
            className="focus-visible:-outline-offset-4"
            keepMounted
            key={valueOf(tab)}
            value={valueOf(tab)}
          >
            <GraphBody className="graph-panel">
              <GraphProse className="text-foreground">{tab.children}</GraphProse>
            </GraphBody>
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </Graph>
  )
}

export { GraphTabs, Tab }
export type { GraphTabsProps, TabProps }
