import { ImageResponse } from "next/og"

import { Card, Frame, og, ogFonts } from "@/lib/og"
import { stack } from "@/lib/site"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "site: how tino.software is built."

export default async function Image() {
  return new ImageResponse(
    (
      <Card word="site" line="How tino.software is built.">
        <Frame title="Stack">
          <div style={{ display: "flex", gap: 28, fontSize: 24 }}>
            {stack.map((tab, i) => (
              <span key={tab.label} style={{ color: i === 0 ? og.accent : og.muted }}>
                {tab.label}
              </span>
            ))}
          </div>
        </Frame>
      </Card>
    ),
    { ...size, fonts: await ogFonts() }
  )
}
