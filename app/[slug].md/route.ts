/**
 * Catch-all for explicit `/foo.md` paths that have no dedicated handler.
 * Known twins (`index.md`, `site.md`) take precedence via static routes.
 */
export function GET() {
  return new Response("# Not Found\n", {
    status: 404,
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
