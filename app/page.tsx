"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { trackCTAClick } from "@/lib/analytics"
import { logout } from "@/lib/auth"

type ComparisonHotspot = {
  beforeImage: string
  afterImage: string
  beforeAlt: string
  afterAlt: string
  className: string
  initialPosition?: number
}

type ReferenceSectionConfig = {
  id: string
  src: string
  alt: string
  ratio: number
  objectFit?: "contain" | "cover"
  objectPosition?: string
  cta?: {
    source: string
    className: string
  }
  comparisons?: ComparisonHotspot[]
}

const referenceSections: ReferenceSectionConfig[] = [
  {
    id: "hero",
    src: "/images/landing/landing-full-reference.jpg",
    alt: "Clar1ty hero section reference",
    ratio: 768 / 452,
    objectFit: "cover",
    objectPosition: "top",
    cta: { source: "hero", className: "left-[10%] top-[75%] h-[7%] w-[20%]" },
    comparisons: [
      {
        beforeImage: "/images/thai-family-faded.png",
        afterImage: "/images/thai-family-restored.png",
        beforeAlt: "Original ASEAN portrait",
        afterAlt: "Upscaled ASEAN portrait",
        className: "left-[43%] top-[11%] h-[78%] w-[47%]",
        initialPosition: 50,
      },
    ],
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
    comparisons: [
      {
        beforeImage: "/images/wedding-set1-before.png",
        afterImage: "/images/wedding-set1-after.png",
        beforeAlt: "Original archive scan",
        afterAlt: "Enhanced archive scan",
        className: "left-[24.9%] top-[23.4%] h-[31.8%] w-[25.5%]",
      },
      {
        beforeImage: "/images/thai-family-faded.png",
        afterImage: "/images/thai-family-restored.png",
        beforeAlt: "Original ASEAN portrait",
        afterAlt: "Enhanced ASEAN portrait",
        className: "left-[72.1%] top-[23.4%] h-[31.8%] w-[24.2%]",
      },
      {
        beforeImage: "/images/real-estate-before.png",
        afterImage: "/images/real-estate-after.png",
        beforeAlt: "Original heritage image",
        afterAlt: "Enhanced heritage image",
        className: "left-[26.2%] top-[60.5%] h-[32.0%] w-[24.3%]",
      },
      {
        beforeImage: "/images/abstract-art-low.png",
        afterImage: "/images/abstract-art-enhanced.png",
        beforeAlt: "Original digital art",
        afterAlt: "Enhanced digital art",
        className: "left-[72.4%] top-[60.5%] h-[32.0%] w-[23.8%]",
      },
    ],
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
    comparisons: [
      {
        beforeImage: "/images/vintage-wedding-blur.png",
        afterImage: "/images/vintage-wedding-clear.jpg",
        beforeAlt: "Original child portrait",
        afterAlt: "Enhanced child portrait",
        className: "left-[0%] top-[26.3%] h-[56.1%] w-[33.8%]",
      },
      {
        beforeImage: "/images/javanese-wedding-faded.png",
        afterImage: "/images/javanese-wedding-restored.png",
        beforeAlt: "Original elder portrait",
        afterAlt: "Enhanced elder portrait",
        className: "left-[35.2%] top-[26.3%] h-[56.1%] w-[33.8%]",
      },
    ],
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
  section: ReferenceSectionConfig
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
        {section.comparisons?.map((comparison, index) => (
          <LandingComparison key={`${section.id}-${index}`} {...comparison} />
        ))}
      </div>
    </section>
  )
}

function LandingComparison({
  beforeImage,
  afterImage,
  beforeAlt,
  afterAlt,
  className,
  initialPosition = 50,
}: ComparisonHotspot) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(92, Math.max(8, next)))
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (event: PointerEvent) => updatePosition(event.clientX)
    const handleUp = () => setIsDragging(false)

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)

    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [isDragging, updatePosition])

  return (
    <div
      ref={containerRef}
      className={`absolute z-20 cursor-ew-resize select-none overflow-hidden bg-black ${className}`}
      style={{ touchAction: "none" }}
      onPointerDown={(event) => {
        setIsDragging(true)
        updatePosition(event.clientX)
      }}
    >
      <Image src={afterImage} alt={afterAlt} fill sizes="40vw" className="object-cover object-center" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={beforeImage} alt={beforeAlt} fill sizes="40vw" className="object-cover object-center" />
      </div>
      <div className="absolute inset-y-0 z-20" style={{ left: `${position}%` }}>
        <div className="h-full w-px bg-white/80" />
        <button
          type="button"
          aria-label="Drag to compare original and upscaled image"
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/95 px-2 py-1 text-[10px] font-semibold text-black shadow-[0_0_16px_rgba(0,0,0,0.5)]"
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setIsDragging(true)
            updatePosition(event.clientX)
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setPosition((current) => Math.max(8, current - 3))
            if (event.key === "ArrowRight") setPosition((current) => Math.min(92, current + 3))
          }}
        >
          <span aria-hidden="true">&lt;&gt;</span>
        </button>
      </div>
    </div>
  )
}
