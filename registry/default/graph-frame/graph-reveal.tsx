"use client"

import * as React from "react"

/**
 * Sets `data-inview` on its parent the first time the parent scrolls into
 * view. That starts the `graph-enter` / `graph-fade` CSS animations under it,
 * so the graph itself can stay a Server Component.
 */
function GraphReveal() {
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const host = ref.current?.parentElement
    if (!host) {
      return
    }

    if (typeof IntersectionObserver === "undefined") {
      host.dataset.inview = ""
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          host.dataset.inview = ""
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    )

    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  return <span hidden ref={ref} />
}

export { GraphReveal }
