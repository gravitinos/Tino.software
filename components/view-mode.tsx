import type { ReactNode } from "react"

/**
 * Runs before first paint: picks the view from `?view=` or localStorage and
 * sets `data-view` on <html>, so CSS shows the right one with no flash.
 */
export function ViewScript() {
  const js = `try{var v=new URLSearchParams(location.search).get("view")||localStorage.getItem("view");if(v==="md")document.documentElement.dataset.view="md"}catch(e){}`
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: js }}
    />
  )
}

/** Renders a page both ways; `data-view` on <html> decides which is visible. */
export function Swappable({
  markdown,
  children,
}: {
  markdown: string
  children: ReactNode
}) {
  return (
    <>
      <div className="contents in-data-[view=md]:hidden">{children}</div>
      <pre className="hidden flex-1 overflow-x-auto py-20 text-sm leading-relaxed whitespace-pre text-contrast-70 in-data-[view=md]:block sm:py-32">
        {markdown}
      </pre>
    </>
  )
}
