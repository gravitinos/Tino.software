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
  title: "tino.software",
  description:
    "Tino. Software. github.com/gravitinos",
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
        <ViewSwitch className="fixed top-4 right-4 z-50 sm:top-6 sm:right-8" />
        {children}
      </body>
    </html>
  )
}
