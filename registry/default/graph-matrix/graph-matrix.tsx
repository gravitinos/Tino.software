import type { ReactNode } from "react"

import {
  childItems,
  Graph,
  GraphBody,
  GraphRule,
  labeledTable,
  Row,
  textOf,
  words,
} from "@/registry/default/graph-frame/graph-frame"
import {
  DIM_OPACITY,
  staggerDelay,
  toneClass,
  type GraphPalette,
} from "@/registry/default/graph-frame/graph-motion"
import { cn } from "@/lib/utils"

type MatrixRow = {
  label: string
  values: (number | string)[]
}

type GraphMatrixProps = {
  title: string
  /** Data form. Or `"Pos Neg"`. */
  columns?: string[] | string
  /** Data form. Or write `<Row label="Pos">41 3</Row>`. */
  rows?: MatrixRow[]
  children?: ReactNode
  accent?: string
  palette?: GraphPalette
  corner?: string
  className?: string
}

function matrixValues(text: string): (number | string)[] {
  return text
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((token) => {
      const parsed = Number(token)
      return Number.isFinite(parsed) ? parsed : token
    })
}

function formatCell(value: number | string) {
  if (typeof value === "number") {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
    })
  }

  return value
}

function RuleY() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 graph-rule-y"
    />
  )
}

function GraphMatrix({
  title,
  columns: columnsProp,
  rows: rowsProp,
  children,
  accent,
  palette,
  corner,
  className,
}: GraphMatrixProps) {
  const markdown = labeledTable(children)
  const columns =
    columnsProp == null ? (markdown?.columns ?? []) : words(columnsProp)
  const taggedRows = childItems(children, Row).map((row) => ({
    label: row.label ?? "",
    values: matrixValues(textOf(row.children)),
  }))
  const rows = (
    rowsProp ??
    (taggedRows.length > 0
      ? taggedRows
      : (markdown?.rows.map((row) => ({
          label: row.label,
          values: matrixValues(row.values.join(" ")),
        })) ?? []))
  ).map((row) => ({ ...row, label: row.label ?? "" }))
  const template = `minmax(6rem, 1fr) repeat(${columns.length}, minmax(4.5rem, 7rem))`

  return (
    <Graph title={title} className={className} corner={corner}>
      <GraphBody className="graph-scroll-x">
        <div className="flex min-w-lg flex-col">
          <div
            className="grid items-end"
            style={{ gridTemplateColumns: template }}
          >
            <span />
            {columns.map((column) => (
              <span
                className="relative px-3 pb-3 text-right text-graph-muted"
                key={column}
              >
                <RuleY />
                {column}
              </span>
            ))}
          </div>
          <GraphRule />
          <ul className="flex flex-col" role="list">
            {rows.map((row, rowIndex) => {
              const live = Boolean(accent) && row.label === accent
              const dim = Boolean(accent) && !live

              return (
                <li
                  className="graph-enter grid items-baseline"
                  key={row.label}
                  style={{
                    gridTemplateColumns: template,
                    opacity: dim ? DIM_OPACITY : undefined,
                    ...staggerDelay(rowIndex, 0.04),
                  }}
                >
                  <span
                    className={cn(
                      "truncate py-2.5 pr-3",
                      live ? toneClass(palette, "primary") : "text-foreground"
                    )}
                  >
                    {row.label}
                  </span>
                  {columns.map((column, index) => (
                    <span
                      className={cn(
                        "relative px-3 py-2.5 text-right tabular-nums",
                        live ? toneClass(palette, "primary") : "text-foreground"
                      )}
                      key={`${row.label}-${column}`}
                    >
                      <RuleY />
                      {formatCell(row.values[index] ?? "")}
                    </span>
                  ))}
                </li>
              )
            })}
          </ul>
        </div>
        <span className="sr-only">
          Matrix with {rows.length} rows and {columns.length} columns
        </span>
      </GraphBody>
    </Graph>
  )
}

export { GraphMatrix, Row }
export type { GraphMatrixProps, MatrixRow }
