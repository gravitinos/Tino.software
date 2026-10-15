"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { toTinoMdHref } from "@/lib/markdown-twin"
import { cn } from "@/lib/utils"

type View = "html" | "md"

function setView(view: View) {
  const root = document.documentElement
  if (view === "md") root.dataset.view = "md"
  else delete root.dataset.view
  try {
    localStorage.setItem("view", view)
  } catch {}
  const url = new URL(location.href)
  if (url.searchParams.has("view")) {
    url.searchParams.delete("view")
    history.replaceState(null, "", url)
  }
}

function toggle() {
  setView(document.documentElement.dataset.view === "md" ? "html" : "md")
}

/**
 * View chrome: `html` stays on this page; `md` opens the matching tino.md URL.
 * Press `m` (or `?view=md`) for the in-page markdown preview.
 */
export function ViewSwitch({ className }: { className?: string }) {
  const pathname = usePathname()
  const mdHref = toTinoMdHref(pathname)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "m" || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest("input, textarea, [contenteditable]")) return
      toggle()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const item =
    "px-1 text-graph-muted transition-colors hover:text-foreground"

  return (
    <div
      role="group"
      aria-label="View as"
      className={cn("flex items-center text-xs select-none", className)}
    >
      <span className="text-graph-frame">[</span>
      <button
        type="button"
        onClick={() => setView("html")}
        className={cn(item, "not-in-data-[view=md]:text-foreground")}
      >
        html
      </button>
      <span className="text-graph-frame">/</span>
      <a
        href={mdHref}
        className={cn(item, "in-data-[view=md]:text-foreground")}
      >
        md
      </a>
      <span className="text-graph-frame">]</span>
    </div>
  )
}
