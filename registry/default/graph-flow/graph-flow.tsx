import * as React from "react"

import { GraphArrow } from "@/registry/default/graph-frame/graph-arrow"
import {
  childItems,
  defineItem,
  Graph,
  GraphBody,
  isHost,
  listItems,
  paragraphsOf,
  textOf,
} from "@/registry/default/graph-frame/graph-frame"
import {
  staggerDelay,
  toneClass as paletteTone,
  type GraphPalette,
} from "@/registry/default/graph-frame/graph-motion"
import { cn } from "@/lib/utils"

type FlowTone = "default" | "accent" | "muted"

type FlowNode = {
  label: string
  tone?: FlowTone
  stretch?: boolean
}

type FlowRow = {
  nodes: FlowNode[]
}

type PathProps = {
  children?: React.ReactNode
}

type GraphFlowProps = {
  title: string
  /** Data form. Or write `<Path>` children. */
  rows?: FlowRow[]
  children?: React.ReactNode
  palette?: GraphPalette
  corner?: string
  className?: string
}

/**
 * One row of the flow. Markdown:
 *
 * ```mdx
 * <GraphFlow title="PUBLISH">
 *
 * write → review → **ship**
 *
 * </GraphFlow>
 * ```
 *
 * Split on `→` or `->`. Bold is the accent node, italic recedes.
 */
const Path = defineItem<PathProps>("Path")

const ARROW = /\s*(?:→|->|—>|=>)\s*/

function nodesOf(children: React.ReactNode): FlowNode[] {
  const nodes: FlowNode[] = []

  for (const child of React.Children.toArray(children)) {
    if (typeof child === "string" || typeof child === "number") {
      for (const part of String(child).split(ARROW)) {
        const label = part.trim()
        if (label) {
          nodes.push({ label })
        }
      }
      continue
    }

    if (!React.isValidElement<{ children?: React.ReactNode }>(child)) {
      continue
    }

    if (isHost(child, ["strong", "b"])) {
      nodes.push({ label: textOf(child).trim(), tone: "accent" })
      continue
    }

    if (isHost(child, ["em", "i"])) {
      nodes.push({ label: textOf(child).trim(), tone: "muted" })
      continue
    }

    nodes.push(...nodesOf(child.props.children))
  }

  return nodes
}

function rowsOf(children: React.ReactNode): FlowRow[] {
  const tagged = childItems(children, Path).map((path) => ({
    nodes: nodesOf(path.children),
  }))
  if (tagged.length > 0) {
    return tagged
  }

  const listed = listItems(children)
  if (listed.length > 0) {
    return listed.map((item) => ({
      nodes: nodesOf((item.props as { children?: React.ReactNode }).children),
    }))
  }

  const paragraphs = paragraphsOf(children)
  if (paragraphs.length > 0) {
    return paragraphs.map((paragraph) => ({
      nodes: nodesOf(
        (paragraph.props as { children?: React.ReactNode }).children
      ),
    }))
  }

  const text = textOf(children).trim()
  if (!text) {
    return []
  }

  return text.split(/\n+/).map((line) => ({ nodes: nodesOf(line) }))
}

function nodeTone(palette: GraphPalette | undefined): Record<FlowTone, string> {
  return {
    default: "text-foreground",
    accent: paletteTone(palette, "primary"),
    muted: paletteTone(palette, "secondary"),
  }
}

function GraphFlow({
  title,
  rows: rowsProp,
  children,
  palette,
  corner,
  className,
}: GraphFlowProps) {
  const tones = nodeTone(palette)
  const rows = rowsProp ?? rowsOf(children)

  return (
    <Graph title={title} className={className} corner={corner}>
      <GraphBody className="flex flex-col gap-7">
        <div className="flex flex-col gap-7">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="graph-enter flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap"
              style={staggerDelay(rowIndex, 0.08)}
            >
              {row.nodes.map((node, nodeIndex) => {
                const tone = node.tone ?? "default"
                const live = tone === "accent"

                return (
                  <div
                    key={`${node.label}-${nodeIndex}`}
                    className={cn(
                      "flex min-w-0 items-center gap-3",
                      node.stretch && "min-w-16 flex-1"
                    )}
                  >
                    {nodeIndex > 0 ? (
                      <GraphArrow accent={live} stretch={node.stretch} />
                    ) : null}
                    <span
                      className={cn("shrink-0 whitespace-nowrap", tones[tone])}
                    >
                      {node.label}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </GraphBody>
    </Graph>
  )
}

export { GraphFlow, Path }
export type { FlowNode, FlowRow, GraphFlowProps, PathProps }
