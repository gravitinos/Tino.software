/** Daily contribution helpers for HTML captions and markdown twins. */

export type ContributionDay = { date: string; count: number }

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

/** `Oct 12 · 14 contributions` (singular when count is 1). */
export function dayLabel(day: ContributionDay): string {
  const d = new Date(`${day.date}T00:00:00Z`)
  const month = MONTHS[d.getUTCMonth()]
  const date = d.getUTCDate()
  const noun = day.count === 1 ? "contribution" : "contributions"
  return `${month} ${date} · ${day.count.toLocaleString("en-US")} ${noun}`
}

/** Last N days, oldest first. */
export function lastDays(days: ContributionDay[], n: number): ContributionDay[] {
  if (n <= 0 || days.length === 0) return []
  return days.slice(-n)
}

/** Day with the highest count; ties go to the most recent. */
export function busiestDay(days: ContributionDay[]): ContributionDay | null {
  if (days.length === 0) return null
  let best = days[0]!
  for (const day of days) {
    if (day.count >= best.count) best = day
  }
  return best
}

/**
 * Current streak ends on the last day in `days` (most recent).
 * Longest is the max run of consecutive days with count > 0.
 */
export function streaks(days: ContributionDay[]): {
  current: number
  longest: number
} {
  if (days.length === 0) return { current: 0, longest: 0 }

  let longest = 0
  let run = 0
  for (const day of days) {
    if (day.count > 0) {
      run += 1
      if (run > longest) longest = run
    } else {
      run = 0
    }
  }

  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]!.count > 0) current += 1
    else break
  }

  return { current, longest }
}

/** Calendar-month totals, oldest month first. */
export function monthlyTotals(
  days: ContributionDay[]
): { month: string; total: number }[] {
  const map = new Map<string, number>()
  for (const day of days) {
    const key = day.date.slice(0, 7) // YYYY-MM
    map.set(key, (map.get(key) ?? 0) + day.count)
  }
  return [...map.entries()].map(([month, total]) => ({ month, total }))
}

/** Markdown pipe table from rows of cells. */
export function markdownTable(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(" | ")} |`
  const sep = `| ${headers.map(() => "---").join(" | ")} |`
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n")
  return [head, sep, body].filter(Boolean).join("\n")
}
