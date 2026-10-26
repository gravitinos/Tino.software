"use client"

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react"

import { dayLabel, type ContributionDay } from "@/lib/contributions"
import { cn } from "@/lib/utils"
import { Graph, GraphBody } from "@/registry/default/graph-frame/graph-frame"

type YearDay = ContributionDay

type GraphYearProps = {
  title: string
  days: YearDay[]
  /** Muted line under the grid when no day is active. */
  caption?: string
  className?: string
}

/** Steps of accent over the empty cell, matching the link preview card. */
const SHADES = [0, 35, 55, 78, 100] as const
const PHONE_WEEKS = 26

function shade(count: number, peak: number): CSSProperties | undefined {
  if (count === 0 || peak === 0) return undefined
  const pct = SHADES[Math.min(4, Math.ceil((count / peak) * 4))]
  return {
    backgroundColor: `color-mix(in oklab, var(--graph-accent) ${pct}%, var(--contrast-14))`,
  }
}

/** Columns of seven days, Sunday first; the first week is padded. */
function weeksOf(days: YearDay[]) {
  if (days.length === 0) return [] as (YearDay | null)[][]
  const lead = new Date(`${days[0]!.date}T00:00:00Z`).getUTCDay()
  const cells: (YearDay | null)[] = [...Array<null>(lead).fill(null), ...days]
  const weeks: (YearDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

type FocusPos = { week: number; day: number }

/**
 * A year of contributions as solid squares that stretch to fill the frame.
 * Phones show the last 26 weeks. Cells are a keyboard grid with a day readout
 * on hover, focus, and tap.
 */
function GraphYear({ title, days, caption, className }: GraphYearProps) {
  const weeks = useMemo(() => weeksOf(days), [days])
  const peak = useMemo(
    () => Math.max(0, ...days.map((day) => day.count)),
    [days]
  )
  const total = useMemo(
    () => days.reduce((sum, day) => sum + day.count, 0),
    [days]
  )
  const recent = Math.max(0, weeks.length - PHONE_WEEKS)
  const labelId = useId()

  const [compact, setCompact] = useState(false)
  const [focusState, setFocus] = useState<FocusPos | null>(null)
  const [hover, setHover] = useState<FocusPos | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const sync = () => setCompact(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  const weekVisible = (w: number) => !compact || w >= recent

  // A focused day hidden by the phone layout no longer counts as focused.
  const focus =
    focusState && weekVisible(focusState.week) ? focusState : null

  const firstFocusable = ((): FocusPos | null => {
    for (let w = 0; w < weeks.length; w++) {
      if (!weekVisible(w)) continue
      for (let d = 0; d < 7; d++) {
        if (weeks[w]?.[d]) return { week: w, day: d }
      }
    }
    return null
  })()

  const lastFocusable = ((): FocusPos | null => {
    for (let w = weeks.length - 1; w >= 0; w--) {
      if (!weekVisible(w)) continue
      for (let d = 6; d >= 0; d--) {
        if (weeks[w]?.[d]) return { week: w, day: d }
      }
    }
    return null
  })()

  // Prefer the most recent day as the tab stop.
  const tabStop = focus ?? lastFocusable ?? firstFocusable

  const active = hover ?? focus
  const activeDay =
    active && weeks[active.week]?.[active.day]
      ? weeks[active.week]![active.day]
      : null
  const readout = activeDay ? dayLabel(activeDay) : (caption ?? null)

  function moveFocus(next: FocusPos) {
    setFocus(next)
    setHover(null)
    // Focus after state updates so tabindex="0" is on the target.
    requestAnimationFrame(() => {
      const el = document.getElementById(
        `${labelId}-c-${next.week}-${next.day}`
      )
      el?.focus()
    })
  }

  function onCellKeyDown(e: KeyboardEvent, pos: FocusPos) {
    let week = pos.week
    let day = pos.day
    switch (e.key) {
      case "ArrowUp":
        day -= 1
        break
      case "ArrowDown":
        day += 1
        break
      case "ArrowLeft":
        week -= 1
        break
      case "ArrowRight":
        week += 1
        break
      case "Home":
        week = firstFocusable?.week ?? week
        day = pos.day
        break
      case "End":
        week = lastFocusable?.week ?? week
        day = pos.day
        break
      case "PageUp":
        day = 0
        break
      case "PageDown":
        day = 6
        break
      case "Escape":
        setHover(null)
        ;(e.currentTarget as HTMLElement).blur()
        setFocus(null)
        return
      default:
        return
    }
    e.preventDefault()

    const clampDay = Math.max(0, Math.min(6, day))
    const findInWeek = (w: number, prefer: number, dir: 1 | -1) => {
      if (!weekVisible(w) || !weeks[w]) return null
      if (weeks[w]![prefer]) return { week: w, day: prefer }
      for (let step = 1; step < 7; step++) {
        const a = prefer + step * dir
        const b = prefer - step * dir
        if (a >= 0 && a < 7 && weeks[w]![a]) return { week: w, day: a }
        if (b >= 0 && b < 7 && weeks[w]![b]) return { week: w, day: b }
      }
      for (let d = 0; d < 7; d++) {
        if (weeks[w]![d]) return { week: w, day: d }
      }
      return null
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const dir = e.key === "ArrowDown" ? 1 : -1
      for (let d = clampDay; d >= 0 && d < 7; d += dir) {
        if (d === pos.day) continue
        if (weeks[pos.week]?.[d]) {
          moveFocus({ week: pos.week, day: d })
          return
        }
      }
      return
    }

    const dir = e.key === "ArrowRight" || e.key === "End" ? 1 : -1
    for (let w = week; w >= 0 && w < weeks.length; w += dir) {
      const hit = findInWeek(w, clampDay, dir)
      if (hit) {
        moveFocus(hit)
        return
      }
    }
  }

  return (
    <Graph title={title} className={className}>
      <GraphBody className="flex flex-col gap-4">
        <div
          role="grid"
          aria-label={`${total.toLocaleString("en-US")} contributions in the last year. Arrow keys move by day.`}
          aria-describedby={labelId}
          className="flex gap-[3px]"
        >
          {weeks.map((week, w) => (
            <div
              key={w}
              role="row"
              className={cn(
                "flex min-w-0 flex-1 flex-col gap-[3px]",
                w < recent && "max-sm:hidden"
              )}
            >
              {week.map((day, d) => {
                if (!day) {
                  return (
                    <span
                      key={`pad-${d}`}
                      role="gridcell"
                      aria-hidden="true"
                      className="aspect-square w-full"
                    />
                  )
                }
                const pos = { week: w, day: d }
                const isTabStop =
                  tabStop?.week === w && tabStop.day === d && weekVisible(w)
                const label = dayLabel(day)
                return (
                  <button
                    key={day.date}
                    id={`${labelId}-c-${w}-${d}`}
                    type="button"
                    role="gridcell"
                    tabIndex={isTabStop ? 0 : -1}
                    aria-label={label}
                    className={cn(
                      "aspect-square w-full bg-contrast-14 transition-[outline-offset] focus-visible:outline-offset-1",
                      active?.week === w &&
                        active.day === d &&
                        "ring-1 ring-graph-accent ring-offset-1 ring-offset-background"
                    )}
                    style={shade(day.count, peak)}
                    onMouseEnter={() => setHover(pos)}
                    onMouseLeave={() =>
                      setHover((h) =>
                        h?.week === w && h.day === d ? null : h
                      )
                    }
                    onFocus={() => setFocus(pos)}
                    onKeyDown={(e) => onCellKeyDown(e, pos)}
                  />
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            id={labelId}
            className="min-h-[1.25em] text-graph-muted tabular-nums"
            aria-live="polite"
          >
            {readout}
          </p>
          <p className="flex items-center gap-2 text-graph-muted">
            <span>Less</span>
            <span aria-hidden="true" className="flex gap-[3px]">
              {SHADES.map((pct, i) => (
                <span
                  key={pct}
                  className="size-2.5 bg-contrast-14 sm:size-3"
                  style={
                    i === 0
                      ? undefined
                      : {
                          backgroundColor: `color-mix(in oklab, var(--graph-accent) ${pct}%, var(--contrast-14))`,
                        }
                  }
                />
              ))}
            </span>
            <span>More</span>
          </p>
        </div>
      </GraphBody>
    </Graph>
  )
}

export { GraphYear }
export type { GraphYearProps }
