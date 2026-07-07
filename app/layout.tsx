import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"
import { OrganizationSchema } from "@/components/schemas/organization-schema"
import { SoftwareAppSchema } from "@/components/schemas/software-app-schema"

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" })

export const metadata: Metadata = {
  title: "clar1ty.art — Keep Your Stories Alive & Vibrant",
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
    "heritage photo restoration",
    "family photo restoration",
  ],
  authors: [{ name: "n3uralia group", url: "https://n3uralia.com" }],
  creator: "n3uralia group",
  publisher: "n3uralia group",
  metadataBase: new URL("https://www.clar1ty.art"),
  canonical: "https://www.clar1ty.art/",
  alternates: {
    canonical: "https://www.clar1ty.art/",
    languages: {
      "en-US": "https://www.clar1ty.art/?lang=en",
      "es-ES": "https://www.clar1ty.art/?lang=es",
      "es-MX": "https://www.clar1ty.art/?lang=es",
    },
  },
  openGraph: {
    title: "clar1ty.art — Keep Your Stories Alive & Vibrant",
    description: "Professional AI-powered image enhancement and restoration for ASEAN heritage",
    type: "website",
    locale: "en_US",
    url: "https://www.clar1ty.art/",
    siteName: "clar1ty",
    images: [
      {
        url: "https://www.clar1ty.art/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "clar1ty - AI Image Enhancer for ASEAN Heritage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "clar1ty.art — Keep Your Stories Alive & Vibrant",
    description: "Professional AI-powered image enhancement and restoration",
    creator: "@n3uralia",
    images: ["https://www.clar1ty.art/og-image.jpg"],
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
  referrer: "strict-origin-when-cross-origin",
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical Resource Preloads - Load essential assets early */}
        <link rel="preload" href="/images/landing/hero-bg-woman.jpg" as="image" />
        <link rel="preload" href="/images/landing/icons-clean/face-profile.png" as="image" />
        
        {/* Preconnect to external APIs for faster handshake */}
        <link rel="preconnect" href="https://replicate.delivery" />
        <link rel="preconnect" href="https://fal.media" />
        <link rel="preconnect" href="https://blob.v0.app" />
        <link rel="dns-prefetch" href="https://blob.v0.app" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        
        {/* Meta tags */}
        <meta name="author" content="n3uralia group" />
        <meta name="creator" content="n3uralia group" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <meta name="theme-color" content="#1a1a1a" />
        
        {/* Cloudflare specific meta tags for GEO targeting and performance */}
        <meta name="geo.placename" content="ASEAN" />
        <meta name="geo.region" content="SG, ID, TH, MY, PH, VN" />
        <meta name="cloudflare-priority" content="high" />
        
        {/* Search Engine Optimization */}
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />
        <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
        
        {/* Brand & Social Links for Cloudflare SEO */}
        <meta property="og:site_name" content="clar1ty" />
        <meta property="og:type" content="website" />
        
        {/* Canonical link for Cloudflare */}
        <link rel="canonical" href="https://www.clar1ty.art/" />
        
        {/* hreflang tags for multilingual SEO */}
        <link rel="alternate" hrefLang="en" href="https://www.clar1ty.art/?lang=en" />
        <link rel="alternate" hrefLang="es" href="https://www.clar1ty.art/?lang=es" />
        <link rel="alternate" hrefLang="x-default" href="https://www.clar1ty.art/" />
        
        {/* LLM-friendly meta tags */}
        <meta name="model" content="gpt-4, claude-3, llama-2" />
        <meta name="ai-capabilities" content="image-enhancement,photo-restoration,face-preservation,cultural-heritage" />
      </head>
      <body className={montserrat.className}>
        {/* JSON-LD Structured Data for SEO */}
        <OrganizationSchema />
        <SoftwareAppSchema />
        
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
