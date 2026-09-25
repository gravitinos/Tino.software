"use client"

import { Graph, GraphBody } from "@/registry/default/graph-frame/graph-frame"
import {
  formatAgo,
  formatClock,
  formatHms,
  parseInstant,
  useGraphNow,
} from "@/registry/default/graph-frame/graph-clock"
import {
  toneClass,
  type GraphPalette,
} from "@/registry/default/graph-frame/graph-motion"
import { cn } from "@/lib/utils"

type TimerKind = "elapsed" | "ago" | "clock"

type GraphTimerProps = {
  title: string
  kind?: TimerKind
  at?: Date | number | string
  caption?: string
  palette?: GraphPalette
  corner?: string
  className?: string
}

function GraphTimer({
  title,
  kind = "elapsed",
  at,
  caption,
  palette,
  corner,
  className,
}: GraphTimerProps) {
  const now = useGraphNow()
  const origin = at == null ? Number.NaN : parseInstant(at)
  let value = kind === "ago" ? "0s ago" : "00:00:00"
  let spoken = "timer"

  if (now != null) {
    if (kind === "clock") {
      value = formatClock(now)
      spoken = `local time ${value}`
    } else if (Number.isFinite(origin)) {
      const elapsed = Math.max(0, now - origin)
      if (kind === "ago") {
        value = formatAgo(elapsed)
        spoken = value
      } else {
        value = formatHms(elapsed)
        spoken = `elapsed ${value}`
      }
    }
  }

  return (
    <Graph title={title} className={className} corner={corner}>
      <GraphBody>
        <div className="graph-enter flex flex-col gap-2">
          <p
            className={cn(
              "text-3xl tracking-tight tabular-nums sm:text-4xl",
              toneClass(palette, "primary")
            )}
          >
            {value}
          </p>
          {caption ? <p className="text-graph-muted">{caption}</p> : null}
        </div>
        <span className="sr-only">{spoken}</span>
      </GraphBody>
    </Graph>
  )
}

export { GraphTimer }
export type { GraphTimerProps, TimerKind }
