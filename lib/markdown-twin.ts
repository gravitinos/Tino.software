/** Host and path helpers for the tino.md ↔ tino.software markdown twin. */

export const MD_HOST = "tino.md"
export const SITE_HOST = "tino.software"

export type MarkdownSurface = "md" | "software"

export function markdownSurface(hostHeader: string | null): MarkdownSurface {
  const host = (hostHeader ?? "").split(":")[0]!.toLowerCase()
  if (host === MD_HOST || host === `www.${MD_HOST}`) return "md"
  return "software"
}

/**
 * Map a public path to its markdown twin route.
 * `/` → `/index.md`, `/site` → `/site.md`, `/foo.md` → `/foo.md`.
 * Returns null for paths that cannot be a markdown twin.
 */
export function toMarkdownPath(pathname: string): string | null {
  if (!pathname.startsWith("/")) return null
  if (pathname === "/") return "/index.md"

  if (pathname.endsWith(".md")) {
    if (!/^\/[A-Za-z0-9._-]+\.md$/.test(pathname)) return null
    return pathname
  }

  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname
  if (!/^\/[A-Za-z0-9._-]+$/.test(path)) return null
  return `${path}.md`
}

/** `/index.md` → `/`, `/site.md` → `/site`. */
export function toPublicPath(markdownPath: string): string {
  if (markdownPath === "/index.md") return "/"
  if (markdownPath.endsWith(".md")) return markdownPath.slice(0, -3)
  return markdownPath
}

/**
 * Canonical tino.md URL for a page path on tino.software.
 * `/` → `https://tino.md/`, `/site` → `https://tino.md/site`.
 */
export function toTinoMdHref(pathname: string): string {
  if (!pathname || pathname === "/") return `https://${MD_HOST}/`
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname
  return `https://${MD_HOST}${path}`
}

/**
 * Footer line linking to the other surface with a matching path.
 * software → `markdown: [tino.md/site](https://tino.md/site)`
 * md → `html: [tino.software/site](https://tino.software/site)`
 */
export function crossLinkFooter(
  publicPath: string,
  surface: MarkdownSurface
): string {
  if (surface === "md") {
    const href =
      publicPath === "/" ? `https://${SITE_HOST}` : `https://${SITE_HOST}${publicPath}`
    const label = publicPath === "/" ? SITE_HOST : `${SITE_HOST}${publicPath}`
    return `html: [${label}](${href})`
  }
  const href =
    publicPath === "/" ? `https://${MD_HOST}` : `https://${MD_HOST}${publicPath}`
  const label = publicPath === "/" ? MD_HOST : `${MD_HOST}${publicPath}`
  return `markdown: [${label}](${href})`
}
