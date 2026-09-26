import "server-only"

import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { ReactNode } from "react"

/**
 * Link preview cards (`opengraph-image.tsx`). The renderer takes plain CSS
 * colors and TTF/OTF fonts, so the dark theme tokens from globals.css are
 * repeated here as hex, and Geist Pixel ships as a TTF in assets/fonts
 * (converted from the package's woff2; OFL, see assets/fonts/OFL.txt).
 */

export const og = {
  background: "#000000",
  foreground: "#ebebeb", // --foreground
  muted: "#7a7a7a", // --graph-muted
  frame: "#5d5d5d", // --graph-frame
  empty: "#1b1b1b", // --contrast-14
  accent: "#d4845a", // --graph-accent
}

/** Blends hex `a` over `b`; `t` is how much of `a`. */
export function mix(a: string, b: string, t: number) {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  const out = [0, 1, 2].map((i) => Math.round(ch(a, i) * t + ch(b, i) * (1 - t)))
  return `#${out.map((n) => n.toString(16).padStart(2, "0")).join("")}`
}

export async function ogFonts() {
  const dir = join(process.cwd(), "assets/fonts")
  const [pixel, mono] = await Promise.all([
    readFile(join(dir, "GeistPixel-Square.ttf")),
    readFile(join(dir, "GeistMono-Regular.ttf")),
  ])
  return [
    { name: "Geist Pixel", data: pixel, style: "normal" as const, weight: 400 as const },
    { name: "Geist Mono", data: mono, style: "normal" as const, weight: 400 as const },
  ]
}

/** Page chrome shared by every card: big pixel word, a line under it, a footer. */
export function Card({
  word,
  line,
  children,
}: {
  word: string
  line: ReactNode
  children?: ReactNode
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "56px 64px",
        background: og.background,
        color: og.foreground,
        fontFamily: "Geist Mono",
        fontSize: 26,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", color: og.muted, fontSize: 22 }}>
        <span>tino.software</span>
        <span style={{ display: "flex", gap: 8 }}>
          <span style={{ color: og.frame }}>[</span>
          <span style={{ color: og.foreground }}>html</span>
          <span style={{ color: og.frame }}>/</span>
          <span>md</span>
          <span style={{ color: og.frame }}>]</span>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 28,
          fontFamily: "Geist Pixel",
          fontSize: 180,
          lineHeight: 0.85,
          letterSpacing: -4,
        }}
      >
        {word.toUpperCase()}
      </div>
      <div style={{ display: "flex", marginTop: 32, color: og.muted }}>{line}</div>
      <div style={{ display: "flex", flex: 1, alignItems: "flex-end" }}>{children}</div>
    </div>
  )
}

/** A bordered figure with a `[ TITLE ]` label, like the site's Graph frame. */
export function Frame({
  title,
  grow,
  children,
}: {
  title: string
  /** Fill the remaining width of the row. */
  grow?: boolean
  children: ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        flexGrow: grow ? 1 : 0,
        border: `1px dashed ${og.frame}`,
        padding: "28px 24px 20px",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: -14,
          left: 20,
          padding: "0 8px",
          background: og.background,
          color: og.accent,
          fontSize: 18,
          letterSpacing: 2,
          whiteSpace: "nowrap",
        }}
      >
        {`[ ${title.toUpperCase()} ]`}
      </span>
      {children}
    </div>
  )
}
