import type { CSSProperties, ReactNode } from "react"

import {
  childItems,
  defineItem,
  Graph,
  GraphBody,
  GraphRule,
  hasHost,
  itemText,
  listItems,
  splitLabel,
  textOf,
} from "@/registry/default/graph-frame/graph-frame"
import {
  staggerDelay,
  toneClass,
  type GraphPalette,
} from "@/registry/default/graph-frame/graph-motion"
import { cn } from "@/lib/utils"

type DiffSign = "add" | "remove" | "keep"

type DiffRow = {
  /** Falls back to the child text: `<Line sign="add" value="31 kb">app</Line>`. */
  label?: string
  value: string
  sign?: DiffSign
}

type DiffLineProps = DiffRow & {
  /** Draw this row under a rule as the total. */
  total?: boolean
}

type GraphDiffProps = {
  title: string
  /** Data form. Or write `<Line />` children. */
  rows?: DiffRow[]
  footer?: DiffRow
  children?: ReactNode
  palette?: GraphPalette
  corner?: string
  className?: string
}

/** `<Line sign="add" value="31 kb">app</Line>`. `total` puts it under the rule. */
const Line = defineItem<DiffLineProps>("Line")

function signOf(value: string): DiffSign | undefined {
  const text = value.trim()
  if (/^\+/.test(text)) {
    return "add"
  }
  if (/^[−\-]/.test(text)) {
    return "remove"
  }
  return undefined
}

function diffFromList(children: ReactNode): DiffLineProps[] {
  return listItems(children).map((item) => {
    const { label, rest } = splitLabel(itemText(item))
    const content = (item.props as { children?: ReactNode }).children
    return {
      label,
      value: rest.replace(/^[+\-−]\s*/, "") || rest,
      sign: signOf(rest),
      total: hasHost(content, ["strong", "b"]),
    }
  })
}

const signGlyph: Record<DiffSign, string> = {
  add: "+",
  remove: "-",
  keep: " ",
}

function DiffLine({
  row,
  style,
  palette,
}: {
  row: DiffRow
  style?: CSSProperties
  palette?: GraphPalette
}) {
  const sign = row.sign ?? "keep"
  const tone =
    sign === "add"
      ? toneClass(palette, "primary")
      : sign === "remove"
        ? toneClass(palette, "secondary")
        : sign === "keep"
          ? "text-foreground"
          : toneClass(palette, "empty")
  const mark = sign === "keep" ? toneClass(palette, "empty") : tone

  return (
    <div
      className="graph-enter grid grid-cols-[1.25rem_minmax(0,1fr)_8ch] items-baseline gap-x-3"
      style={style}
    >
      <span aria-hidden="true" className={cn("text-center select-none", mark)}>
        {signGlyph[sign]}
      </span>
      <span className={tone}>{row.label}</span>
      <span className={cn("text-right tabular-nums", tone)}>{row.value}</span>
    </div>
  )
}

function GraphDiff({
  title,
  rows: rowsProp,
  footer: footerProp,
  children,
  palette,
  corner,
  className,
}: GraphDiffProps) {
  const listed = diffFromList(children)
  const tagged = childItems(children, Line).map((entry) => ({
    ...entry,
    label: entry.label ?? textOf(entry.children),
  }))
  const lines = listed.length > 0 ? listed : tagged
  const rows = (rowsProp ?? lines.filter((entry) => !entry.total)).map(
    (entry) => ({ ...entry, label: entry.label ?? "" })
  )
  const footerLine = footerProp ?? lines.find((entry) => entry.total)
  const footer = footerLine
    ? { ...footerLine, label: footerLine.label ?? "" }
    : undefined

  return (
    <Graph title={title} className={className} corner={corner}>
      <GraphBody className="flex flex-col gap-3">
        <ul role="list" className="flex flex-col gap-2">
          {rows.map((row, index) => (
            <li key={row.label}>
              <DiffLine
                palette={palette}
                row={row}
                style={staggerDelay(index, 0.04)}
              />
            </li>
          ))}
        </ul>
        {footer ? (
          <>
            <GraphRule />
            <div>
              <DiffLine
                palette={palette}
                row={footer}
                style={staggerDelay(rows.length, 0.04)}
              />
            </div>
          </>
        ) : null}
      </GraphBody>
    </Graph>
  )
}

export { GraphDiff, Line }
export type { DiffLineProps, DiffRow, DiffSign, GraphDiffProps }
