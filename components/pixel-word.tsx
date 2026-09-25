"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

const VARIANTS = [
  { name: "square", className: "font-pixel" },
  { name: "grid", className: "font-pixel-grid" },
  { name: "circle", className: "font-pixel-circle" },
  { name: "triangle", className: "font-pixel-triangle" },
  { name: "line", className: "font-pixel-line" },
] as const

/** Big Geist Pixel word. Click (or hover a letter) to cycle the pixel shape. */
export function PixelWord({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const [base, setBase] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <button
      type="button"
      onClick={() => setBase((b) => (b + 1) % VARIANTS.length)}
      onMouseLeave={() => setHovered(null)}
      aria-label={`${text}, set in Geist Pixel ${VARIANTS[base].name}. Click to change.`}
      className={cn(
        "block cursor-pointer text-left leading-[0.85] tracking-tight uppercase select-none",
        className
      )}
    >
      {[...text].map((char, i) => {
        const offset = hovered == null ? 0 : Math.max(0, 2 - Math.abs(i - hovered))
        const variant = VARIANTS[(base + offset) % VARIANTS.length]
        return (
          <span
            aria-hidden="true"
            key={i}
            onMouseEnter={() => setHovered(i)}
            className={cn(
              "inline-block transition-colors duration-200",
              variant.className,
              offset > 0 && "text-graph-accent"
            )}
          >
            {char}
          </span>
        )
      })}
    </button>
  )
}

