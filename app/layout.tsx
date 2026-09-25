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

import { cn } from "@/lib/utils"

import "./globals.css"

export const metadata: Metadata = {
  title: "tino.software",
  description:
    "Tino's corner of the internet. GitHub activity, projects, and (soon) a resume, drawn with mdxcn.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
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
      <body className="min-h-dvh font-mono">{children}</body>
    </html>
  )
}
