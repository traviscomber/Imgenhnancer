"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"
import { trackCTAClick } from "@/lib/analytics"
import { logout } from "@/lib/auth"

type CompareImage = {
  beforeImage: string
  afterImage: string
  beforeAlt: string
  afterAlt: string
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
}

const referenceSections: ReferenceSectionConfig[] = [
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

const enhancementComparisons = [
  {
    icon: "/images/landing/icons-grid-square.jpg",
    iconPosition: "0% 0%",
    title: "ARCHIVE SCAN",
    copy: "Clean scans, reduce scratches, and improve faded printed photos.",
    beforeImage: "/images/landing/comparisons/archive-before.png",
    afterImage: "/images/landing/comparisons/archive-after.png",
    beforeAlt: "Old damaged archive scan",
    afterAlt: "Upscaled archive scan",
  },
  {
    icon: "/images/landing/icons-grid-square.jpg",
    iconPosition: "60% 33.33%",
    title: "ASEAN PORTRAIT PRESERVE",
    copy: "Enhance portraits while preserving facial identity and natural skin tones.",
    beforeImage: "/images/landing/comparisons/hero-before.jpg",
    afterImage: "/images/landing/comparisons/hero-after.jpg",
    beforeAlt: "Old faded ASEAN portrait",
    afterAlt: "Upscaled ASEAN portrait",
  },
  {
    icon: "/images/landing/icons-grid-square.jpg",
    iconPosition: "80% 66.67%",
    title: "HERITAGE RESTORE",
    copy: "Clar1ty.art restores clarity without erasing who people are.",
    beforeImage: "/images/landing/comparisons/heritage-before.jpg",
    afterImage: "/images/landing/comparisons/heritage-after.jpg",
    beforeAlt: "Low clarity heritage image",
    afterAlt: "Upscaled heritage image",
  },
  {
    icon: "/images/landing/icons-grid-square.jpg",
    iconPosition: "80% 0%",
    title: "DIGITAL ART UPSCALE",
    copy: "Upscale digital art, illustrations, and concepts without losing style. Print Ready",
    beforeImage: "/images/landing/comparisons/digital-before.jpg",
    afterImage: "/images/landing/comparisons/digital-after.jpg",
    beforeAlt: "Low resolution digital art",
    afterAlt: "Upscaled digital art",
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
        <HeroSection onCta={() => openEnhancer("hero")} />
        <ReferenceSection section={getSection("upload")} onCta={openEnhancer} />
        <ReferenceSection section={getSection("features")} onCta={openEnhancer} />
        <EnhancementSection />
        <ReferenceSection section={getSection("how-it-works")} onCta={openEnhancer} />
        <ReferenceSection section={getSection("quality")} onCta={openEnhancer} />
        <FacesSection />
        <ReferenceSection section={getSection("use-cases")} onCta={openEnhancer} />
        <ReferenceSection section={getSection("privacy")} onCta={openEnhancer} />
        <ReferenceSection section={getSection("cta")} onCta={openEnhancer} />
      </main>
    </div>
  )
}

function getSection(id: string) {
  const section = referenceSections.find((item) => item.id === id)
  if (!section) throw new Error(`Missing landing section: ${id}`)
  return section
}

function HeroSection({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative overflow-hidden bg-black">
      <div className="mx-auto grid min-h-[720px] max-w-[1600px] items-center px-6 py-20 lg:grid-cols-[0.42fr_0.58fr] lg:px-24">
        <div className="relative z-10">
          <ClarityLogo className="mb-24 h-9 w-auto drop-shadow-[0_0_10px_rgba(211,155,62,0.45)]" width={130} height={40} />
          <h1 className="text-5xl font-light leading-[1.13] tracking-[0.01em] text-white md:text-6xl">
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
          <Button onClick={onCta} className="mt-16 h-11 rounded-none bg-[#8b7d6a] px-10 text-[12px] font-medium text-white hover:bg-[#a28f76]">
            Upload image
          </Button>
        </div>
        <LiveComparison
          beforeImage="/images/landing/comparisons/hero-before.jpg"
          afterImage="/images/landing/comparisons/hero-after.jpg"
          beforeAlt="Old damaged ASEAN portrait"
          afterAlt="Upscaled ASEAN portrait"
          className="h-[560px]"
          priority
        />
      </div>
    </section>
  )
}

function EnhancementSection() {
  return (
    <section id="enhancement" className="bg-black px-6 py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <h2 className="text-4xl font-light uppercase tracking-[0.08em] text-[#d7c4a7]">CHOOSE THE RIGHT ENHANCEMENT</h2>
          <p className="mt-12 text-[12px] text-[#8f8678]">Presets for every image type</p>
          <p className="mt-2 text-[13px] text-[#e6ded2]">Different images need different care. Our presets are tuned for specific image types and results.</p>
        </div>
        <div className="mt-20 grid gap-12 lg:grid-cols-2">
          {enhancementComparisons.map((item) => (
            <article key={item.title} className="grid min-h-[310px] grid-cols-[0.42fr_0.58fr] bg-[#111111]">
              <div className="p-9">
                <IconCrop src={item.icon} position={item.iconPosition} className="h-16 w-16 border border-[#ad7d2e]" />
                <h3 className="mt-14 text-[13px] font-medium uppercase tracking-[0.06em] text-[#b9822c]">{item.title}</h3>
                <p className="mt-10 text-[15px] leading-7 text-[#e1d9ce]">{item.copy}</p>
              </div>
              <LiveComparison {...item} className="h-full min-h-[310px]" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FacesSection() {
  return (
    <section id="faces" className="bg-black px-0 py-28">
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.69fr_0.31fr]">
        <div className="grid gap-6 md:grid-cols-2">
          <LiveComparison
            beforeImage="/images/landing/comparisons/child-before.jpg"
            afterImage="/images/landing/comparisons/child-after.jpg"
            beforeAlt="Old damaged child portrait"
            afterAlt="Upscaled child portrait"
            className="h-[300px]"
          />
          <LiveComparison
            beforeImage="/images/landing/comparisons/elder-before.jpg"
            afterImage="/images/landing/comparisons/elder-after.jpg"
            beforeAlt="Old damaged heritage portrait"
            afterAlt="Upscaled heritage portrait"
            className="h-[300px]"
          />
        </div>
        <div className="flex flex-col justify-center px-6">
          <h2 className="text-4xl font-light leading-tight text-[#c9a057]">
            Beautiful results,
            <br />
            built for ASEAN
            <br />
            faces
          </h2>
          <p className="mt-14 text-[13px] font-semibold text-white">See the difference!</p>
          <p className="mt-8 max-w-[310px] text-[15px] leading-7 text-[#d8d0c4]">
            From heritage portraits to cultural landmarks and digital art, Clar1ty brings out the best while preserving what matters most.
          </p>
        </div>
      </div>
    </section>
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
      </div>
    </section>
  )
}

function IconCrop({ src, position, className = "" }: { src: string; position: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block bg-black bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundPosition: position,
        backgroundSize: "600% 400%",
      }}
    />
  )
}

function LiveComparison({
  beforeImage,
  afterImage,
  beforeAlt,
  afterAlt,
  className = "",
  priority = false,
}: CompareImage & { className?: string; priority?: boolean }) {
  const [position, setPosition] = useState(50)
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
      className={`relative cursor-ew-resize select-none overflow-hidden bg-black ${className}`}
      style={{ touchAction: "none" }}
      onPointerDown={(event) => {
        setIsDragging(true)
        updatePosition(event.clientX)
      }}
    >
      <Image src={afterImage} alt={afterAlt} fill sizes="(min-width: 1024px) 45vw, 100vw" priority={priority} className="object-cover object-center" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={beforeImage} alt={beforeAlt} fill sizes="(min-width: 1024px) 45vw, 100vw" priority={priority} className="object-cover object-center" />
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
