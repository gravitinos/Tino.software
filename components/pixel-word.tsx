import { cn } from "@/lib/utils"

export function PixelWord({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "block text-left leading-[0.85] tracking-tight uppercase select-none",
        className
      )}
    >
      {[...text].map((char, i) => (
        <span key={i} className="inline-block font-pixel">
          {char}
        </span>
      ))}
    </span>
  )
}
