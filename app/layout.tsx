import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"

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
    "LoRA image enhancement",
    "AI-powered photo restoration",
  ],
  authors: [{ name: "n3uralia group", url: "https://n3uralia.group" }],
  creator: "n3uralia group",
  publisher: "n3uralia group",
  metadataBase: new URL("https://clar1ty.art"),
  alternates: {
    languages: {
      "en-US": "https://clar1ty.art?lang=en",
      "es-ES": "https://clar1ty.art?lang=es",
      "es-MX": "https://clar1ty.art?lang=es",
    },
  },
  openGraph: {
    title: "clar1ty - AI Image Enhancement Platform",
    description: "Professional AI-powered image enhancement by n3uralia group",
    type: "website",
    locale: "en_US",
    url: "https://clar1ty.art",
    siteName: "clar1ty",
    images: [
      {
        url: "https://clar1ty.art/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "clar1ty - AI Image Enhancer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "clar1ty - AI Image Enhancer",
    description: "Professional AI-powered image enhancement and restoration",
    images: ["https://clar1ty.art/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "wu2fLbp5c2oow0CInRDVAnx-C5_nJKGm0bUNUDMn72E",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // JSON-LD Schema for SoftwareApplication
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "clar1ty",
    description:
      "AI-powered image enhancement platform trained for ASEAN heritage preservation",
    url: "https://clar1ty.art",
    applicationCategory: "UtilityApplication",
    creator: {
      "@type": "Organization",
      name: "n3uralia group",
      url: "https://n3uralia.group",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "500",
    },
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to image hosting domains for faster loading */}
        <link rel="preconnect" href="https://blob.v0.app" />
        <link rel="dns-prefetch" href="https://blob.v0.app" />
        <meta name="author" content="n3uralia group" />
        <meta name="creator" content="n3uralia group" />
        
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Cloudflare specific meta tags for GEO targeting */}
        <meta name="geo.placename" content="ASEAN" />
        <meta name="geo.region" content="SG, ID, TH, MY, PH, VN" />

        {/* LLM-friendly meta tags */}
        <meta name="model" content="gpt-4, claude-3, llama-2" />
        <meta name="ai-capabilities" content="image-enhancement,photo-restoration,face-preservation,cultural-heritage" />
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
