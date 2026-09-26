import { fence } from "@/registry/default/graph-knap/frame"
import {
  asciiSpec,
  asciiTerminal,
  asciiTree,
} from "@/registry/default/graph-knap/graphs"

import { GITHUB_URL } from "@/lib/github"

/** Content of /site, shared by the HTML page and its markdown twin. */

export const stack = [
  {
    label: "framework",
    body: "Next.js 16 (App Router), React 19, Tailwind v4. Pages prerender as Server Components; GitHub data revalidates hourly, the last-commit time every 5 minutes.",
  },
  {
    label: "figures",
    body: "mdxcn, forked under registry/default. Frames, charts and tables render on the server; their enter animations are CSS.",
  },
  {
    label: "components",
    body: "registry/tino: our own pieces on the mdxcn frame. Interactive parts use Base UI for focus, keyboard and ARIA.",
  },
  {
    label: "type",
    body: "Geist Pixel, all five variants, for headlines. Click the big word to cycle them. Geist Mono for everything else.",
  },
  {
    label: "data",
    body: "GitHub REST API for profile, repos and pushes. The contribution calendar comes from GraphQL, or a public proxy without a token.",
  },
] as const

export const registry = [
  {
    label: "registry",
    children: [
      { label: "default", meta: "mdxcn fork" },
      { label: "tino", meta: "ours" },
    ],
  },
]

/** What ships JavaScript. Everything else is HTML and CSS. */
export const clientParts = [
  { label: "view switch", value: "html / md toggle" },
  { label: "pixel word", value: "cycles the font" },
  { label: "timer", value: "last commit, ticks" },
  { label: "reveal", value: "starts figure animations" },
  { label: "tabs", value: "Base UI" },
]

export const views = [
  { label: "toggle", value: "[ html / md ], top right" },
  { label: "key", value: "m" },
  { label: "query", value: "?view=md" },
  { label: "raw", value: "/index.md, /site.md" },
  { label: "curl", value: "curl tino.software" },
]

export const commands = ["$ bun install", "$ bun run dev", "$ bun run build"]

/** Hard-wraps prose; the markdown view is a `<pre>` and does not wrap. */
function wrap(text: string, width = 72) {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(" ")) {
    if (line && line.length + word.length + 1 > width) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  return [...lines, line].join("\n")
}

export function siteMarkdown() {
  const parts = [
    "# site",
    "How tino.software is built. [back](/)",
    "## Stack",
    ...stack.map((tab) => `### ${tab.label}\n\n${wrap(tab.body)}`),
    "## Source",
    fence(asciiTree({ title: "Registry", nodes: registry })),
    fence(asciiTerminal({ title: "Local", lines: commands })),
    fence(asciiSpec({ title: "Client JS", rows: clientParts })),
    "## Views",
    "Every page renders as HTML and as markdown.",
    fence(asciiSpec({ title: "Markdown", rows: views })),
    "---",
    `tino.software · [github](${GITHUB_URL})`,
  ]

  return parts.join("\n\n") + "\n"
}
