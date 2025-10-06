import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "clar1ty - AI Image Enhancer by n3uralia group",
  description:
    "Transform your images with AI-powered enhancement and restoration. Professional-grade image upscaling optimized for ASEAN heritage. Built by n3uralia group.",
  keywords: [
    "AI image enhancement",
    "photo restoration",
    "image upscaling",
    "face preservation",
    "ASEAN photography",
    "n3uralia",
    "cultural heritage restoration",
  ],
  authors: [{ name: "n3uralia group", url: "https://n3uralia.group" }],
  creator: "n3uralia group",
  publisher: "n3uralia group",
  openGraph: {
    title: "clar1ty - AI Image Enhancement Platform",
    description: "Professional AI-powered image enhancement by n3uralia group",
    type: "website",
    locale: "en_US",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to image hosting domains for faster loading */}
        <link rel="preconnect" href="https://blob.v0.app" />
        <link rel="dns-prefetch" href="https://blob.v0.app" />
        <meta name="author" content="n3uralia group" />
        <meta name="creator" content="n3uralia group" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
