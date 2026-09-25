# tino.software

Personal site. Next.js (App Router) + shadcn, with figures drawn by
[mdxcn](https://mdxcn.dev) and type set in [Geist Pixel](https://vercel.com/font).

## Stack

- **Framework:** Next.js 16, Tailwind v4, shadcn (`components.json`)
- **Figures:** mdxcn, vendored under `registry/default` (the `@mdxcn` registry is set up in `components.json`)
- **Type:** Geist Pixel (all five variants) for headlines, Geist Mono for body, via the `geist` package
- **Data:** GitHub REST API, revalidated hourly (`lib/github.ts`)

## Development

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## GitHub stats

`lib/github.ts` pulls profile, repos, and recent public events for `gravitinos`.
Contribution counts come from the GitHub GraphQL API when `GITHUB_TOKEN` is set,
otherwise from the public `github-contributions-api.jogruber.de` proxy. A token
also lifts the 60 req/h unauthenticated rate limit.

The "last commit" timer uses the newest push event. With a token belonging to
`gravitinos` (classic token with `repo` scope), private pushes such as
tino.build count too; only the timestamp is shown, never the repo name.
Without a token it only sees public pushes.
If GitHub is unreachable, the stats block is hidden.

## Markdown view

Every page renders an HTML and a raw-markdown version; the `[ html / md ]`
switch (or `m`, or `?view=md`) flips `data-view` on `<html>`. An inline script
applies the saved choice before first paint. The home page markdown is also
served at `/index.md`. Figures in markdown use the mdxcn ASCII renderers from
`registry/default/graph-knap`.

## mdxcn

Add or update components:

```bash
bunx shadcn@latest add @mdxcn/graph-table
```

## Effect v3 (local reference)

```bash
bun run clone:effect
```

Source lands in `reference/effect-v3/` (gitignored).
