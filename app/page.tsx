"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"
import { trackCTAClick } from "@/lib/analytics"
import { logout } from "@/lib/auth"

const referenceSections = [
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
      <header className="absolute left-0 right-0 top-0 z-30">
        <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" aria-label="clar1ty home">
            <ClarityLogo className="h-10 w-auto drop-shadow-[0_0_10px_rgba(211,155,62,0.45)]" width={130} height={40} />
          </Link>
          <div className="hidden items-center gap-10 text-[11px] font-medium text-[#e8dfd0] md:flex">
            <a href="#features" className="hover:text-[#d7a957]">
              Features
            </a>
            <a href="#use-cases" className="hover:text-[#d7a957]">
              Use Cases
            </a>
            <a href="#how-it-works" className="hover:text-[#d7a957]">
              How It Works
            </a>
            <Link href="/pricing" className="hover:text-[#d7a957]">
              Pricing
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative min-h-[720px] overflow-hidden bg-black">
          <HeroComparison />

          <div className="relative z-10 mx-auto flex min-h-[720px] max-w-6xl items-center px-6 pt-20">
            <div className="max-w-[470px]">
              <h1 className="text-5xl font-light leading-[1.12] tracking-[0.01em] text-white md:text-6xl">
                Restore
                <br />
                Southeast Asia&apos;s
                <br />
                <span className="text-[#c9953d]">visual identity</span>
              </h1>
              <p className="mt-12 max-w-[390px] text-[13px] leading-7 text-[#d2c7b7]">
                Enhance heritage photos, portraits, cultural archives, low-resolution images, and digital art with AI
                designed to preserve ASEAN faces, tones, and visual character.
              </p>
              <p className="mt-6 text-[13px] text-[#b98a44]">Upload. Enhance. Preserve identity.</p>
              <Button
                onClick={() => openEnhancer("hero")}
                className="mt-16 h-11 rounded-none bg-[#8b7d6a] px-10 text-[12px] font-medium text-white hover:bg-[#a28f76]"
              >
                Upload image
              </Button>
            </div>
          </div>
        </section>

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
        <Image src={section.src} alt={section.alt} fill sizes="100vw" className="object-contain object-top" />
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

function HeroComparison() {
  return (
    <div className="absolute inset-y-0 right-0 w-full lg:w-[68%]">
      <LandingComparison
        beforeImage="/images/thai-family-faded.png"
        afterImage="/images/thai-family-restored.png"
        beforeAlt="Original Southeast Asian portrait"
        afterAlt="Upscaled Southeast Asian portrait"
        className="h-full w-full"
        imageClassName="object-cover object-center opacity-90"
        overlayClassName="bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.86)_18%,rgba(0,0,0,0.18)_56%,rgba(0,0,0,0.35)_100%)]"
        initialPosition={56}
      />
    </div>
  )
}

function LandingComparison({
  beforeImage,
  afterImage,
  beforeAlt = "Original image",
  afterAlt = "Upscaled image",
  className = "",
  imageClassName = "object-cover object-center",
  overlayClassName = "",
  initialPosition = 50,
}: {
  beforeImage: string
  afterImage: string
  beforeAlt?: string
  afterAlt?: string
  className?: string
  imageClassName?: string
  overlayClassName?: string
  initialPosition?: number
}) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(88, Math.max(18, next)))
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
      className={`relative cursor-ew-resize select-none overflow-hidden bg-black ${className}`}
      style={{ touchAction: "none" }}
      onPointerDown={(event) => {
        setIsDragging(true)
        updatePosition(event.clientX)
      }}
    >
      <Image src={afterImage} alt={afterAlt} fill priority className={imageClassName} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={beforeImage} alt={beforeAlt} fill priority className={imageClassName} />
      </div>
      {overlayClassName ? <div className={`absolute inset-0 ${overlayClassName}`} /> : null}
      <div className="absolute inset-y-0 z-20" style={{ left: `${position}%` }}>
        <div className="h-full w-px bg-white/75" />
        <button
          type="button"
          aria-label="Drag to compare original and upscaled image"
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/90 px-2 py-1 text-[10px] font-semibold text-black shadow-[0_0_20px_rgba(0,0,0,0.45)]"
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setIsDragging(true)
            updatePosition(event.clientX)
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setPosition((current) => Math.max(18, current - 3))
            if (event.key === "ArrowRight") setPosition((current) => Math.min(88, current + 3))
          }}
        >
          <span aria-hidden="true">&lt;&gt;</span>
        </button>
      </div>
    </div>
  )
}
