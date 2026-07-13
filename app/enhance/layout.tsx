import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "clar1ty Studio - AI Image Enhancement Workspace",
  description:
    "Upload, enhance and compare images with clar1ty Studio. Built for portraits, creative visuals, product images and heritage restoration.",
  keywords: [
    "AI image enhancement",
    "image upscaling",
    "photo restoration",
    "portrait enhancer",
    "creative image enhancer",
    "heritage restoration",
  ],
  openGraph: {
    title: "clar1ty Studio - AI Image Enhancement Workspace",
    description: "Upload, enhance and compare images with clar1ty Studio.",
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
