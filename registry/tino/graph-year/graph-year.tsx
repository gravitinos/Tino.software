import type { CSSProperties } from "react"

import { Graph, GraphBody } from "@/registry/default/graph-frame/graph-frame"
import { cn } from "@/lib/utils"

type YearDay = { date: string; count: number }

type GraphYearProps = {
  title: string
  days: YearDay[]
  /** Muted line under the grid. */
  caption?: string
  className?: string
}

/** Steps of accent over the empty cell, matching the link preview card. */
const SHADES = [0, 35, 55, 78, 100]

function shade(count: number, peak: number): CSSProperties | undefined {
  if (count === 0 || peak === 0) return undefined
  const pct = SHADES[Math.min(4, Math.ceil((count / peak) * 4))]
  return {
    backgroundColor: `color-mix(in oklab, var(--graph-accent) ${pct}%, var(--contrast-14))`,
  }
}

/** Columns of seven days, Sunday first; the first week is padded. */
function weeksOf(days: YearDay[]) {
  if (days.length === 0) return []
  const lead = new Date(`${days[0].date}T00:00:00Z`).getUTCDay()
  const cells: (YearDay | null)[] = [...Array<null>(lead).fill(null), ...days]
  const weeks: (YearDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

/**
 * A year of contributions as solid squares that stretch to fill the frame.
 * Phones show the last 26 weeks. The grid is one image to assistive tech;
 * the caption and title carry the numbers.
 */
function GraphYear({ title, days, caption, className }: GraphYearProps) {
  const weeks = weeksOf(days)
  const peak = Math.max(0, ...days.map((day) => day.count))
  const total = days.reduce((sum, day) => sum + day.count, 0)
  const recent = weeks.length - 26

  return (
    <Graph title={title} className={className}>
      <GraphBody className="flex flex-col gap-4">
        <div
          role="img"
          aria-label={`${total.toLocaleString("en-US")} contributions in the last year`}
          className="flex gap-[3px]"
        >
          {weeks.map((week, w) => (
            <div
              key={w}
              className={cn(
                "flex min-w-0 flex-1 flex-col gap-[3px]",
                w < recent && "max-sm:hidden"
              )}
            >
              {week.map((day, d) => (
                <span
                  key={day?.date ?? `pad-${d}`}
                  className={cn("aspect-square w-full", day && "bg-contrast-14")}
                  style={day ? shade(day.count, peak) : undefined}
                />
              ))}
            </div>
          ))}
        </div>
        {caption ? <p className="text-graph-muted">{caption}</p> : null}
      </GraphBody>
    </Graph>
  )
}

export { GraphYear }
export type { GraphYearProps }
