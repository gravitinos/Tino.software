# Geist Pixel — Coming Soon

Bun-powered landing page inspired by [Introducing Geist Pixel](https://vercel.com/blog/introducing-geist-pixel), with a **Vote for frontend** poll. Built with [Vite](https://vite.dev/) + [Nitro](https://nitro.build/) for deployment on [Vercel](https://vercel.com/).

## Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Frontend:** Vite (HTML + TypeScript)
- **Server:** Nitro API routes + SSR outlet
- **Hosting:** Vercel (Bun functions via `vercel.json` + Nitro Vercel preset)
- **Typography:** [Geist Pixel](https://vercel.com/font) (local `geist` package)

## Effect v3 (local reference)

Clone [Effect-TS/effect](https://github.com/Effect-TS/effect) at the latest v3 release tag for local browsing:

```bash
bun run clone:effect
```

Source lands in `reference/effect-v3/` (gitignored). Override the tag with `EFFECT_V3_TAG=effect@3.21.0 bun run clone:effect`.

## Development

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/votes` | Current vote totals |
| `POST` | `/api/vote` | Body: `{ "choice": "React" }` — one of React, Vue, Svelte, Solid, Preact, HTML |

## Deploy on Vercel

1. Import this repository on Vercel.
2. Build command: `bun run build`
3. Install command: `bun install`
4. Output is handled by Nitro’s Vercel integration (zero extra config).

Votes persist via Nitro storage (`data` driver) on the deployment filesystem where supported.
