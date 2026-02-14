import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Image Enhancement - Professional Upscaling Tool | clar1ty",
  description:
    "Enhance your images with AI-powered upscaling. Supports 2x-4x upscaling with facial preservation and restoration. Perfect for photos, art, and heritage images.",
  keywords: [
    "image upscaling",
    "AI enhancement",
    "photo restoration",
    "image quality improvement",
    "upscale 4x",
    "face enhancement",
    "professional image editor",
  ],
  openGraph: {
    title: "AI Image Enhancement - clar1ty",
    description: "Transform your images with professional AI upscaling",
    type: "website",
    url: "https://www.clar1ty.art/enhance",
  },
}

export default function EnhanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
