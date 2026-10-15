import { ViewTransition, type ReactNode } from "react"

/**
 * The big page word. Shares a name across pages so following a link can glide
 * one title into the next. The rest of the page swaps instantly.
 */
export function TitleTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition name="page-title" share="morph" default="none">
      {children}
    </ViewTransition>
  )
}
