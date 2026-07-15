"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, Lock, Shield, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"
import { PricingSection } from "@/components/pricing-section"
import { trackCTAClick } from "@/lib/analytics"
import { isAuthenticated } from "@/lib/auth"

type ComparisonCard = {
  title: string
  copy: string
  beforeImage: string
  afterImage: string
  beforeAlt: string
  afterAlt: string
}

type InfoCard = {
  title: string
  copy: string
  image: string
  alt: string
}

type AssetCard = {
  title: string
  copy: string
  icon: string
}

type UseCaseCard = {
  title: string
  copy: string
  image: string
  alt: string
}

const contextCards: ComparisonCard[] = [
  {
    title: "Cultural archive",
    copy: "Restore texture and legibility without flattening the source image.",
    beforeImage: "/images/landing/comparisons/archive-before.png",
    afterImage: "/images/landing/comparisons/archive-after.png",
    beforeAlt: "Original archive image",
    afterAlt: "Restored archive image",
  },
  {
    title: "Family portrait",
    copy: "Recover faces, clothing and grain while keeping the moment intact.",
    beforeImage: "/images/landing/comparisons/faces-before.jpg",
    afterImage: "/images/landing/comparisons/faces-after.jpg",
    beforeAlt: "Original family portrait",
    afterAlt: "Restored family portrait",
  },
  {
    title: "Creative reference",
    copy: "Upscale artwork and references without losing their visual character.",
    beforeImage: "/images/landing/comparisons/digital-before.jpg",
    afterImage: "/images/landing/comparisons/digital-after.jpg",
    beforeAlt: "Original creative reference",
    afterAlt: "Upscaled creative reference",
  },
]

const stepCards = [
  {
    title: "Upload your image",
    copy: "Start with a heritage photo, portrait, archive scan, low-resolution file, or digital artwork.",
    icon: "/images/landing/icons-clean/upload-cloud.png",
  },
  {
    title: "Choose your preset",
    copy: "Select the enhancement mode that matches your image. Clar1ty applies the right treatment automatically.",
    icon: "/images/landing/icons-clean/preset-sliders.png",
  },
  {
    title: "Download your result",
    copy: "Receive a cleaner, sharper, higher-resolution image ready for digital use, print, or archive.",
    icon: "/images/landing/icons-clean/download-tray.png",
  },
]

const oneClickCards: (InfoCard & { icon: string })[] = [
  {
    title: "Clean Enhance",
    copy: "Improve clarity, contrast and overall image quality. Best for digital photos, product visuals, brand assets, social content and general image cleanup.",
    image: "/images/landing/comparisons/digital-after.jpg",
    alt: "Clean enhancement example",
    icon: "/images/landing/icons-clean/digital-upscale.png",
  },
  {
    title: "Old Photo Restore",
    copy: "Restore old, faded, scratched or damaged photographs. Best for family archives, vintage portraits, scanned prints and memory preservation.",
    image: "/images/landing/comparisons/faces-after.jpg",
    alt: "Old photo restoration example",
    icon: "/images/landing/icons-clean/photo-restoration.png",
  },
  {
    title: "Face Detail",
    copy: "Enhance facial features while keeping a natural appearance. Best for portraits, wedding photos, fashion, beauty, family images and Asian faces.",
    image: "/images/landing/comparisons/hero-after-new.png",
    alt: "Face detail enhancement example",
    icon: "/images/landing/icons-clean/face-profile.png",
  },
  {
    title: "Cultural Detail",
    copy: "Preserve architecture, traditional ornaments and cultural textures. Best for heritage buildings, jewelry, artifacts, traditional costumes and historical visuals.",
    image: "/images/landing/comparisons/heritage-after.jpg",
    alt: "Cultural detail enhancement example",
    icon: "/images/landing/icons-clean/heritage-restore.png",
  },
]

const qualityItems: AssetCard[] = [
  {
    title: "Face preservation",
    copy: "Protects facial structure and expressions.",
    icon: "/images/landing/icons-clean/face-preserve.png",
  },
  {
    title: "Natural tones",
    copy: "Keeps skin tones and colors true.",
    icon: "/images/landing/icons-clean/natural-tones.png",
  },
  {
    title: "Real detail",
    copy: "Brings out textures, edges, and fine detail.",
    icon: "/images/landing/icons-clean/real-detail.png",
  },
  {
    title: "Cultural respect",
    copy: "Enhances without altering cultural elements.",
    icon: "/images/landing/icons-clean/cultural-respect.png",
  },
  {
    title: "Balanced results",
    copy: "No over-processing. Just the right touch.",
    icon: "/images/landing/icons-clean/balanced-results.png",
  },
  {
    title: "High resolution",
    copy: "Sharper images for modern use and printing.",
    icon: "/images/landing/icons-clean/high-resolution.png",
  },
]

const useCaseCards: UseCaseCard[] = [
  {
    title: "Cultural archives",
    copy: "Restore and preserve historical photographs and documents.",
    image: "/images/landing/use-cases-crops/cultural-archives.jpg",
    alt: "Cultural archives workspace",
  },
  {
    title: "Photo restoration services",
    copy: "Deliver higher-quality results faster with AI-powered enhancement.",
    image: "/images/landing/use-cases-crops/photo-restoration.jpg",
    alt: "Photo restoration workspace",
  },
  {
    title: "Creators & digital artists",
    copy: "Enhance references, concepts, and artwork with more detail and clarity.",
    image: "/images/landing/use-cases-crops/creators-digital-artists.jpg",
    alt: "Creators and digital artists workspace",
  },
  {
    title: "Museums & heritage projects",
    copy: "Prepare images for exhibitions, publications, and educational materials.",
    image: "/images/landing/use-cases-crops/museums-heritage-projects.jpg",
    alt: "Museums and heritage workspace",
  },
  {
    title: "Print shops & studios",
    copy: "Produce print-ready files with clean detail and balanced contrast.",
    image: "/images/landing/use-cases-crops/print-shops-studios.jpg",
    alt: "Print shops and studios workspace",
  },
  {
    title: "Brands & businesses",
    copy: "Improve visual assets for marketing, storytelling, and brand heritage.",
    image: "/images/landing/use-cases-crops/brands-businesses.jpg",
    alt: "Brands and businesses workspace",
  },
]

const collageImage = "/images/landing/closing-portraits.jpg"

export default function Home() {
  const router = useRouter()

  const openStudio = async (source: string) => {
    trackCTAClick(source, "Try clar1ty free")
    const authenticated = await isAuthenticated()
    router.push(authenticated ? "/enhance" : "/sign-in")
  }

  return (
    <div className="min-h-screen bg-black text-[#efe8dc]">
      <Hero onTryFree={() => openStudio("hero")} />
      <UploadSection onTryFree={() => openStudio("upload")} />
      <ContextSection />
      <StepsSection />
      <OneClickSection />
      <QualitySection />
      <UseCasesSection />
      <PricingPreview />
      <CollageSection />
      <FinalCTA onTryFree={() => openStudio("final_cta")} />
    </div>
  )
}

function Hero({ onTryFree }: { onTryFree: () => void }) {
  return (
    <section className="relative overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(201,149,61,0.12),transparent_28%),radial-gradient(circle_at_84%_12%,rgba(124,96,61,0.12),transparent_28%)]" />

      <div className="relative mx-auto grid min-h-[820px] max-w-7xl gap-14 px-6 pb-16 pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-16 lg:pt-20">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">AI image enhancement for portraits, creators and heritage restoration</p>
          <h1 className="mt-6 text-5xl font-light leading-[1.04] tracking-[0.01em] text-white md:text-7xl">
            Restore
            <br />
            Southeast Asia&apos;s
            <br />
            <span className="text-[#d7a957]">visual identity</span>
          </h1>
          <p className="mt-8 max-w-xl text-sm leading-7 text-[#d6cabc] md:text-base">
            Clar1ty enhances portraits, restores old photos and improves creative assets while preserving the details, textures and context that make them meaningful.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button onClick={onTryFree} className="h-12 rounded-none bg-[#c9953d] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-black hover:bg-[#d7a957]">
              Upload image
            </Button>
            <Button asChild className="h-12 rounded-none border border-[#6f5d49] bg-[#17120f] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#f0e2cf] hover:bg-[#221913]">
              <Link href="/sign-in">Login</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-[#a8977c]">10 free credits. No credit card required. Secure and private processing.</p>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-8 hidden h-36 w-36 rounded-full bg-[#c9953d]/10 blur-3xl lg:block" />
          <div className="absolute -right-8 bottom-6 hidden h-44 w-44 rounded-full bg-[#7b5d36]/20 blur-3xl lg:block" />
          <LiveComparison
            beforeImage="/images/landing/comparisons/hero-before-new.png"
            afterImage="/images/landing/comparisons/hero-after-new.png"
            beforeAlt="Original ASEAN portrait"
            afterAlt="Enhanced ASEAN portrait"
            className="h-[520px] rounded-2xl"
            sizes="(min-width: 1024px) 52vw, 100vw"
            priority
          />
        </div>
      </div>
    </section>
  )
}

function UploadSection({ onTryFree }: { onTryFree: () => void }) {
  return (
    <section className="bg-[#7b6b56] px-6 py-0 text-[#efe8dc] lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-[0.44fr_0.56fr]">
        <div className="border-b border-black/10 bg-[#a29377] px-6 py-10 lg:border-b-0 lg:border-r lg:px-8 lg:py-12">
          <p className="text-3xl font-light tracking-[0.01em] text-[#e7dece] md:text-4xl">Upload image</p>
          <p className="mt-8 max-w-sm text-sm leading-7 text-[#efe8dc]/80">
            Natural skin tones. Real facial structure. Local visual character. Cultural detail.
          </p>
          <div className="mt-6 rounded-sm bg-[#d4c7b0] p-4 text-black shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <div className="flex items-center justify-between border-b border-black/10 pb-3 text-[10px] uppercase tracking-[0.22em] text-black/60">
              <span>Upload workspace</span>
              <span>Preview</span>
            </div>
            <div className="mt-4 rounded-sm border border-dashed border-black/25 bg-[#bcae95] px-5 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black/20 bg-[#efe6d6]">
                <Image src="/images/landing/icons-clean/upload-cloud.png" alt="" width={56} height={56} aria-hidden="true" className="h-7 w-7 object-contain" />
              </div>
              <p className="mt-4 text-sm text-black/85">Drop a photo or scan here</p>
              <p className="mt-2 text-xs leading-6 text-black/55">JPEG, PNG and supported scans</p>
            </div>
            <Button onClick={onTryFree} className="mt-4 h-11 w-full rounded-none bg-[#efe8dc] text-[11px] font-semibold uppercase tracking-[0.14em] text-black hover:bg-white">
              Upscale Image
            </Button>
          </div>
        </div>

        <div className="flex min-h-[360px] items-center justify-center px-6 py-10 lg:px-12 lg:py-12">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black/25">
              <ClarityLogo className="h-12 w-auto" width={120} height={48} />
            </div>
            <p className="mt-5 text-sm font-semibold text-[#efe0c1]">No images upscaled yet</p>
            <p className="mt-4 text-sm leading-7 text-[#efe8dc]/80">Upload an image to upscale it</p>
            <Button onClick={onTryFree} className="mt-8 h-12 rounded-none bg-[#efe8dc] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-black hover:bg-white">
              Upload image
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContextSection() {
  return (
    <section className="bg-black px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Generic AI-tools upscale pixels.</p>
          <h2 className="text-3xl font-light tracking-[0.01em] text-[#f1e5d3] md:text-5xl">Clar1ty preserves context.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#d4c7b6]">
            The model is tuned to improve detail without deleting the cues that identify a person, a place or a cultural object.
          </p>
        </div>
        <div className="mt-12 grid gap-5 xl:grid-cols-3">
          {contextCards.map((card) => (
            <article key={card.title} className="rounded-2xl bg-white/[0.03] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <LiveComparison
                beforeImage={card.beforeImage}
                afterImage={card.afterImage}
                beforeAlt={card.beforeAlt}
                afterAlt={card.afterAlt}
                className="h-72 rounded-xl"
              />
              <div className="px-1 pb-2 pt-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d7a957]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">{card.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function StepsSection() {
  return (
    <section className="bg-[#11100e] px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-[0.01em] text-[#f1e5d3] md:text-5xl">Simple. Fast. Effective.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#d4c7b6]">
            How it works
            <span className="block">Three easy steps to restore and enhance your images.</span>
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stepCards.map(({ title, copy, icon }, index) => (
            <div key={title} className="relative">
              <article className="h-full rounded-2xl bg-black/70 p-8 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-[#8a6a40]/60 bg-black/75 p-4 shadow-[0_0_22px_rgba(201,149,61,0.14)]">
                  <Image src={icon} alt="" width={96} height={96} aria-hidden="true" className="h-16 w-16 object-contain" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-[#f6ebdd]">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#d1c3b1]">{copy}</p>
              </article>
              {index < stepCards.length - 1 ? (
                <ArrowRight className="absolute right-[-1rem] top-1/2 hidden h-6 w-6 -translate-y-1/2 text-[#6f5d49] md:block" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function OneClickSection() {
  return (
    <section id="presets" className="bg-black px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-[0.01em] text-[#f1e5d3] md:text-5xl">One click. The right enhancement.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#d4c7b6]">
            Different images need different care. Our presets are tuned for specific image types and results.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {oneClickCards.map((card, index) => (
            <article
              key={card.title}
              className={`grid gap-0 overflow-hidden rounded-2xl bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.03)] ${index % 2 === 1 ? "md:grid-cols-[0.95fr_1.05fr]" : "md:grid-cols-[1.05fr_0.95fr]"}`}
            >
              <div className={`flex items-center p-5 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                <div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#8a6a40]/60 bg-black/75 p-3 shadow-[0_0_22px_rgba(201,149,61,0.12)]">
                    <Image src={card.icon} alt="" width={72} height={72} aria-hidden="true" className="h-12 w-12 object-contain" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-[#f6ebdd]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#d1c3b1]">{card.copy}</p>
                </div>
              </div>
              <div className={`relative min-h-[220px] ${index % 2 === 1 ? "md:order-1" : ""}`}>
                <LiveComparison
                  beforeImage={
                    card.title === "Clean Enhance"
                      ? "/images/landing/comparisons/generic-original.jpg"
                      : card.title === "Old Photo Restore"
                        ? "/images/landing/comparisons/faces-before.jpg"
                        : card.title === "Face Detail"
                          ? "/images/landing/comparisons/hero-before-new.png"
                          : "/images/landing/comparisons/heritage-before.jpg"
                  }
                  afterImage={card.image}
                  beforeAlt={`${card.title} before image`}
                  afterAlt={card.alt}
                  className="h-[220px] rounded-none md:h-full"
                  sizes="(min-width: 768px) 40vw, 92vw"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function QualitySection() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-24 lg:px-16">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/landing/quality-reference.jpg"
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
          className="object-cover object-center opacity-45 blur-[1px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_30%,rgba(201,149,61,0.16),transparent_22%),radial-gradient(circle_at_92%_36%,rgba(201,149,61,0.14),transparent_22%),linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.68)_58%,rgba(0,0,0,0.9)_100%)]" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-[0.01em] text-[#f1e5d3] md:text-5xl">Better quality. Same identity.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#d4c7b6]">How it works</p>
          <p className="mx-auto text-sm leading-7 text-[#d4c7b6]">Three easy steps to restore and enhance your images.</p>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {qualityItems.map(({ title, copy, icon }) => (
              <article key={title} className="flex items-center gap-5 rounded-2xl border border-white/8 bg-black/35 px-5 py-4 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0b0a08] p-2">
                  <Image src={icon} alt="" width={64} height={64} aria-hidden="true" className="h-12 w-12 object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f7ede0]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#f2e7d9]/90">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function UseCasesSection() {
  return (
    <section id="use-cases" className="relative overflow-hidden bg-black px-6 py-24 lg:px-16">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/landing/use-cases-bg.jpeg"
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
          className="object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.72)_22%,rgba(0,0,0,0.88)_100%)]" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-[0.01em] text-[#f1e5d3] md:text-5xl">
            For people, projects, and purpose.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#d4c7b6]">
            Improve visual assets for marketing, storytelling, and brand heritage. For individuals, professionals, and institutions across Southeast Asia and beyond.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {useCaseCards.map((card) => (
            <article
              key={card.title}
              className="relative overflow-hidden rounded-[1.8rem] border border-white/8 bg-[#0b0a08]/90 shadow-[0_24px_70px_rgba(0,0,0,0.72)]"
              style={{ minHeight: 330 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.65fr", minHeight: 330 }}>
                <div className="relative overflow-hidden" style={{ height: 330 }}>
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 768px) 44vw, 100vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.12)_62%,rgba(0,0,0,0.3)_100%)]" />
                </div>
                <div
                  className="relative flex items-center bg-[linear-gradient(90deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.82)_34%,rgba(0,0,0,0.96)_100%)] px-6 py-8 sm:px-7"
                  style={{ minHeight: 330 }}
                >
                  <div>
                    <h3 className="max-w-44 text-xl font-semibold leading-tight text-[#f5ece0]">{card.title}</h3>
                    <p className="mt-6 max-w-44 text-sm leading-7 text-[#f2e7d9]">{card.copy}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingPreview() {
  return (
    <section className="bg-black">
      <PricingSection />
    </section>
  )
}

function CollageSection() {
  return (
    <section className="bg-black px-6 pt-10 lg:px-16 lg:pt-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-visible">
          <Image
            src={collageImage}
            alt="Clar1ty portrait strip"
            width={1680}
            height={960}
            sizes="100vw"
            className="h-auto w-full object-contain"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-[-4.75rem] flex justify-center">
            <Image
              src="/images/landing/clar1ty-logo.png"
              alt=""
              width={540}
              height={220}
              aria-hidden="true"
              className="h-28 w-auto opacity-95 drop-shadow-[0_0_26px_rgba(201,149,61,0.28)] md:h-32"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCTA({ onTryFree }: { onTryFree: () => void }) {
  const securityItems = [
    { title: "Secure processing", copy: "All images are encrypted and processed safely.", Icon: Shield },
    { title: "No unnecessary storage", copy: "We save nothing you do not ask us to.", Icon: Lock },
    { title: "Your images stay yours", copy: "You own your images. Always.", Icon: UserRound },
  ]

  return (
    <section className="bg-black px-6 pb-24 pt-32 lg:px-16 lg:pb-28 lg:pt-36">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 rounded-3xl bg-white/[0.03] p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Secure, private, and simple</p>
            {securityItems.map(({ title, copy, Icon }) => (
              <div key={title} className="flex gap-4 rounded-2xl bg-black/28 p-4">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-[#d7a957]" />
                <div>
                  <p className="text-sm font-semibold text-[#f6ebdd]">{title}</p>
                  <p className="mt-1 text-sm leading-7 text-[#d1c3b1]">{copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center rounded-3xl border border-white/8 bg-[#1a1612] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <div className="max-w-lg text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Restore more detail. Keep full control.</p>
              <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">Start enhancing your images today.</h2>
              <p className="mt-6 text-sm leading-7 text-[#d4c7b6]">
              Preserve the details that matter and keep the workflow simple.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button onClick={onTryFree} className="h-12 rounded-none bg-[#c9953d] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-black hover:bg-[#d7a957]">
                  Upload your image
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LiveComparison({
  beforeImage,
  afterImage,
  beforeAlt,
  afterAlt,
  className = "",
  sizes = "(min-width: 1024px) 45vw, 100vw",
  priority = false,
}: ComparisonCard & { className?: string; sizes?: string; priority?: boolean }) {
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
      <Image src={afterImage} alt={afterAlt} fill sizes={sizes} priority={priority} className="object-cover object-center" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src={beforeImage} alt={beforeAlt} fill sizes={sizes} priority={priority} className="object-cover object-center" />
      </div>
      <div className="absolute inset-y-0 z-20" style={{ left: `${position}%` }}>
        <div className="h-full w-px bg-white/75" />
        <button
          type="button"
          aria-label="Drag to compare original and upscaled image"
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/95 px-2 py-1 text-[10px] font-semibold text-black shadow-[0_0_16px_rgba(0,0,0,0.5)]"
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
