import { ImageResponse } from "next/og"

import { getGitHubStats, GITHUB_USER } from "@/lib/github"
import { formatCompact } from "@/lib/markdown"
import { Card, Frame, mix, og, ogFonts } from "@/lib/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "tino: software. Contribution graph and last commit from GitHub."
export const revalidate = 300

const CELL = 11
const GAP = 3

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  const units: [number, string][] = [
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ]
  for (const [secs, unit] of units) {
    if (s >= secs) return `${Math.floor(s / secs)}${unit} ago`
  }
  return "just now"
}

/** Five steps, like the page's heatmap: empty, then four shades of accent. */
function shade(count: number, peak: number) {
  if (count === 0 || peak === 0) return og.empty
  const level = Math.min(4, Math.ceil((count / peak) * 4))
  return mix(og.accent, og.empty, [0, 0.35, 0.55, 0.78, 1][level])
}

export default async function Image() {
  const [gh, fonts] = await Promise.all([getGitHubStats(), ogFonts()])
  const days = gh.contributions.slice(-53 * 7)
  const peak = Math.max(0, ...days.map((d) => d.count))
  const weeks: (typeof days)[] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return new ImageResponse(
    (
      <Card
        word="tino"
        line={
          <>
            Software.&nbsp;<span style={{ color: og.foreground }}>github.com/{GITHUB_USER}</span>
          </>
        }
      >
        {gh.ok ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, width: "100%" }}>
            {weeks.length > 0 ? (
              <Frame title={`Last year · ${formatCompact(gh.contributionsTotal)}`}>
                <div style={{ display: "flex", gap: GAP }}>
                  {weeks.map((week, w) => (
                    <div key={w} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                      {week.map((day) => (
                        <div
                          key={day.date}
                          style={{ width: CELL, height: CELL, background: shade(day.count, peak) }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </Frame>
            ) : null}
            {gh.lastPushAt ? (
              <Frame title="Last commit" grow>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 44, color: og.accent }}>{ago(gh.lastPushAt)}</span>
                  <span style={{ fontSize: 18, color: og.muted }}>pushed to github</span>
                </div>
              </Frame>
            ) : null}
          </div>
        ) : null}
      </Card>
    ),
    { ...size, fonts }
  )
}
