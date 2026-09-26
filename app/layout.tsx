import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
  GeistPixelTriangle,
} from "geist/font/pixel"
import { GeistSans } from "geist/font/sans"

import { ViewScript } from "@/components/view-mode"
import { ViewSwitch } from "@/components/view-switch"
import { cn } from "@/lib/utils"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://tino.software"),
  title: "tino.software",
  description:
    "Tino. Software. github.com/gravitinos",
  openGraph: { siteName: "tino.software", type: "website" },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark antialiased",
        GeistSans.variable,
        GeistMono.variable,
        GeistPixelSquare.variable,
        GeistPixelGrid.variable,
        GeistPixelCircle.variable,
        GeistPixelTriangle.variable,
        GeistPixelLine.variable
      )}
    >
      <head>
        <ViewScript />
      </head>
      <body className="min-h-dvh font-mono">
        <header className="fixed top-4 right-4 z-50 sm:top-6 sm:right-8">
          <ViewSwitch />
        </header>
        {children}
      </body>
    </html>
  )
}
