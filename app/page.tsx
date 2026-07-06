"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { trackCTAClick } from "@/lib/analytics"
import { logout } from "@/lib/auth"

const referenceSections = [
  {
    id: "hero",
    src: "/images/landing/landing-full-reference.jpg",
    alt: "Clar1ty hero section reference",
    ratio: 768 / 452,
    objectFit: "cover",
    objectPosition: "top",
    cta: { source: "hero", className: "left-[10%] top-[75%] h-[7%] w-[20%]" },
  },
  {
    id: "upload",
    src: "/images/landing/upload-reference.jpg",
    alt: "Upload image section reference",
    ratio: 1280 / 720,
    cta: { source: "upload_section", className: "left-[10%] top-[70%] h-[6%] w-[22%]" },
  },
  {
    id: "features",
    src: "/images/landing/context-reference.jpg",
    alt: "Context preservation comparison section reference",
    ratio: 1280 / 960,
    cta: { source: "context_section", className: "left-[37%] top-[84%] h-[6%] w-[26%]" },
  },
  {
    id: "enhancement",
    src: "/images/landing/enhancement-reference.jpg",
    alt: "Choose the right enhancement section reference",
    ratio: 1280 / 960,
  },
  {
    id: "how-it-works",
    src: "/images/landing/steps-reference.jpg",
    alt: "Simple fast effective steps section reference",
    ratio: 1280 / 681,
  },
  {
    id: "quality",
    src: "/images/landing/quality-reference.jpg",
    alt: "Better quality same identity section reference",
    ratio: 1280 / 816,
  },
  {
    id: "faces",
    src: "/images/landing/faces-reference.jpg",
    alt: "Beautiful results built for ASEAN faces section reference",
    ratio: 1280 / 537,
  },
  {
    id: "use-cases",
    src: "/images/landing/use-cases-reference.jpg",
    alt: "For people projects and purpose section reference",
    ratio: 1280 / 1004,
  },
  {
    id: "privacy",
    src: "/images/landing/logo-portrait-strip.jpg",
    alt: "Clar1ty logo, privacy copy, and ASEAN portrait strip reference",
    ratio: 1280 / 1080,
  },
  {
    id: "cta",
    src: "/images/landing/cta-and-collage.jpg",
    alt: "Secure private simple CTA and final photo collage reference",
    ratio: 1098 / 1280,
    cta: { source: "bottom_cta", className: "left-[56%] top-[12%] h-[4.5%] w-[22%]" },
  },
]

export default function Home() {
  const router = useRouter()

  const openEnhancer = async (source: string) => {
    trackCTAClick(source, "Upload image")
    await logout()
    router.push("/enhance")
  }

  return (
    <div className="min-h-screen bg-black text-[#efe8dc]">
      <main>
        {referenceSections.map((section) => (
          <ReferenceSection key={section.id} section={section} onCta={openEnhancer} />
        ))}
      </main>
    </div>
  )
}

function ReferenceSection({
  section,
  onCta,
}: {
  section: (typeof referenceSections)[number]
  onCta: (source: string) => void
}) {
  return (
    <section id={section.id} className="bg-black">
      <div className="relative mx-auto w-full max-w-[1600px]" style={{ aspectRatio: String(section.ratio) }}>
        <Image
          src={section.src}
          alt={section.alt}
          fill
          sizes="100vw"
          className={section.objectFit === "cover" ? "object-cover" : "object-contain"}
          style={{ objectPosition: section.objectPosition ?? "top" }}
          priority={section.id === "hero"}
        />
        {section.cta ? (
          <button
            type="button"
            aria-label="Upload your image"
            onClick={() => onCta(section.cta.source)}
            className={`absolute z-10 ${section.cta.className}`}
          />
        ) : null}
      </div>
    </section>
  )
}
