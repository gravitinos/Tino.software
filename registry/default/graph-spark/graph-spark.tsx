import {
  Graph,
  GraphBody,
  GraphTick,
  GraphTrack,
  numbers,
} from "@/registry/default/graph-frame/graph-frame"
import {
  DIM_OPACITY,
  enterDelay,
  fillDelay,
  isMonoPalette,
  resolveGlyphs,
  toneClass,
  type Glyphs,
  type GraphPalette,
} from "@/registry/default/graph-frame/graph-motion"
import { cn } from "@/lib/utils"

const SPARK_DEFAULT = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]

type GraphSparkProps = {
  title: string
  /** `[2, 3, 4]` or `"2 3 4"`. Scaled to the max. */
  data: number[] | string
  caption?: string
  glyphs?: Glyphs
  palette?: GraphPalette
  corner?: string
  className?: string
}

function GraphSpark({
  title,
  data: dataProp,
  caption,
  glyphs,
  palette,
  corner,
  className,
}: GraphSparkProps) {
  const data = numbers(dataProp)
  const max = Math.max(...data, 1)
  const last = data.length - 1
  const set = glyphs == null ? SPARK_DEFAULT : resolveGlyphs(glyphs)
  const points = data.map((value) => {
    const index = Math.round((value / max) * (set.length - 1))
    return set[index] ?? set[0] ?? "▁"
  })

  return (
    <Graph title={title} className={className} corner={corner}>
      <GraphBody className="flex flex-col items-center gap-4">
        <GraphTrack className="justify-center gap-0.5">
          {points.map((glyph, index) => {
            const live = index === last

            return (
              <GraphTick className="flex-none" key={`${glyph}-${index}`}>
                <span
                  className={cn(
                    "graph-fade",
                    live
                      ? toneClass(palette, "primary")
                      : toneClass(palette, "secondary")
                  )}
                  style={{
                    opacity: live || !isMonoPalette(palette) ? 1 : DIM_OPACITY,
                    ...enterDelay(fillDelay(index)),
                  }}
                >
                  {glyph}
                </span>
              </GraphTick>
            )
          })}
        </GraphTrack>
        {caption ? <p className="text-graph-muted">{caption}</p> : null}
        <span className="sr-only">
          Sparkline with {data.length} points
          {caption ? `. ${caption}` : ""}
        </span>
      </GraphBody>
    </Graph>
  )
}

export { GraphSpark }
export type { GraphSparkProps }
