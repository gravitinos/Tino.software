import { ViewTransition, type ReactNode } from "react"

const NAV = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }

/**
 * Slides page content left on links tagged `nav-forward`, right on `nav-back`.
 * Goes in each page, not the layout: layouts persist, so they never enter or exit.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={NAV} exit={NAV} default="none">
      {children}
    </ViewTransition>
  )
}

/** The big page word. Shares a name across pages so "tino" morphs into "site". */
export function TitleTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition name="page-title" share="morph" default="none">
      {children}
    </ViewTransition>
  )
}
