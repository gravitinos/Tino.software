import type { ReactNode } from "react"

import {
  childItems,
  defineItem,
  Graph,
  GraphBody,
  hasHost,
  itemText,
  listItems,
  splitLabel,
  textOf,
} from "@/registry/default/graph-frame/graph-frame"
import { staggerDelay } from "@/registry/default/graph-frame/graph-motion"
import { cn } from "@/lib/utils"

type SpecRow = {
  label: string
  /** Falls back to the child text: `<Field label="Family">Geist Mono</Field>`. */
  value?: string
  accent?: boolean
}

type GraphSpecProps = {
  title: string
  /** Data form. Or write `<Field />` children. */
  rows?: SpecRow[]
  children?: ReactNode
  corner?: string
  className?: string
}

/** `<Field label="ETA" accent>Thu</Field>` inside `<GraphSpec>`. */
const Field = defineItem<SpecRow>("Field")

function GraphSpec({
  title,
  rows: rowsProp,
  children,
  corner,
  className,
}: GraphSpecProps) {
  const listed = listItems(children).map((item) => {
    const { label, rest } = splitLabel(itemText(item))
    const content = (item.props as { children?: ReactNode }).children
    return {
      label,
      value: rest,
      accent: hasHost(content, ["strong", "b"]),
    }
  })
  const tagged = childItems(children, Field).map((entry) => ({
    ...entry,
    value: entry.value ?? textOf(entry.children),
  }))
  const rows = (rowsProp ?? (listed.length > 0 ? listed : tagged)).map(
    (entry) => ({ ...entry, value: entry.value ?? "" })
  )

  return (
    <Graph title={title} className={className} corner={corner}>
      <GraphBody>
        <dl className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <div
              className="graph-enter grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] items-baseline gap-x-3 sm:gap-x-6"
              key={row.label}
              style={staggerDelay(index, 0.04)}
            >
              <dt className="text-graph-muted">{row.label}</dt>
              <dd
                className={cn(
                  "tabular-nums",
                  row.accent ? "text-graph-accent" : "text-foreground"
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </GraphBody>
    </Graph>
  )
}

export { Field, GraphSpec }
export type { GraphSpecProps, SpecRow }
