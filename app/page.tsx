"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, ImagePlus, Lock, Shield, Sparkles, Upload, UserRound, Zap } from "lucide-react"
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
    copy: "Start with a portrait, scan or creative asset. Clar1ty handles low resolution and damaged files with care.",
    icon: Upload,
  },
  {
    title: "Choose your preset",
    copy: "Pick the treatment that fits the image: general enhancement, restoration, portrait detail or cultural detail.",
    icon: ImagePlus,
  },
  {
    title: "Download your result",
    copy: "Preview the credit cost, process the image and export the enhanced version when it is ready.",
    icon: Zap,
  },
]

const oneClickCards: InfoCard[] = [
  {
    title: "Asian portrait",
    copy: "Keep expression, face structure and skin tone intact.",
    image: "/images/landing/comparisons/hero-after-new.png",
    alt: "Enhanced portrait",
  },
  {
    title: "Old family photo",
    copy: "Recover memories from faded and damaged images.",
    image: "/images/landing/comparisons/faces-after.jpg",
    alt: "Restored family photo",
  },
  {
    title: "Heritage detail",
    copy: "Preserve architecture, ornaments and local texture.",
    image: "/images/landing/comparisons/heritage-after.jpg",
    alt: "Heritage restoration",
  },
  {
    title: "Brand portrait",
    copy: "Sharpen founder photos and campaign visuals.",
    image: "/images/landing/comparisons/portrait-after-alt.jpg",
    alt: "Brand portrait enhancement",
  },
  {
    title: "Creative artwork",
    copy: "Upscale references without losing the look that matters.",
    image: "/images/landing/comparisons/digital-after.jpg",
    alt: "Creative artwork enhancement",
  },
  {
    title: "Archival scan",
    copy: "Clean up scans for documentation and publication.",
    image: "/images/landing/comparisons/archive-after.png",
    alt: "Archival scan enhancement",
  },
]

const qualityItems = [
  {
    title: "Face preservation",
    copy: "Keep structure, expression and identity stable.",
    icon: UserRound,
  },
  {
    title: "Natural tones",
    copy: "Avoid overcooked smoothing and plastic skin.",
    icon: Sparkles,
  },
  {
    title: "Cultural respect",
    copy: "Preserve clothing, ornaments and architecture.",
    icon: Shield,
  },
  {
    title: "Balanced results",
    copy: "Improve clarity without drifting too far from source.",
    icon: Lock,
  },
  {
    title: "High resolution",
    copy: "Recover usable detail for print and presentation.",
    icon: Zap,
  },
  {
    title: "Fast workflow",
    copy: "Simple upload, preset choice and download flow.",
    icon: Upload,
  },
]

const useCaseCards: InfoCard[] = [
  {
    title: "Photographers",
    copy: "Restore portraits, prep client deliveries and clean up old photo collections.",
    image: "/images/landing/comparisons/faces-after.jpg",
    alt: "Photography use case",
  },
  {
    title: "Designers",
    copy: "Enhance references, scans and concept art while keeping texture and intent.",
    image: "/images/landing/comparisons/digital-after.jpg",
    alt: "Design use case",
  },
  {
    title: "Brands",
    copy: "Improve founder portraits, product visuals and campaign assets.",
    image: "/images/landing/comparisons/portrait-after-alt.jpg",
    alt: "Brand use case",
  },
  {
    title: "Families",
    copy: "Bring old memories, wedding photos and heirlooms back into focus.",
    image: "/images/landing/comparisons/archive-after.png",
    alt: "Family use case",
  },
  {
    title: "Archives",
    copy: "Prepare historical material and cultural collections for long-term use.",
    image: "/images/landing/comparisons/archive-before.png",
    alt: "Archive use case",
  },
  {
    title: "Print shops",
    copy: "Create cleaner source files for printing, framing and publishing.",
    image: "/images/landing/comparisons/hero-after-new.png",
    alt: "Print shop use case",
  },
]

const collageImages = [
  { src: "/images/landing/comparisons/hero-after-new.png", alt: "Enhanced portrait" },
  { src: "/images/landing/comparisons/faces-after.jpg", alt: "Restored portrait" },
  { src: "/images/landing/comparisons/child-after.jpg", alt: "Enhanced child portrait" },
  { src: "/images/landing/comparisons/elder-after.jpg", alt: "Restored elder portrait" },
  { src: "/images/landing/comparisons/heritage-after.jpg", alt: "Heritage enhancement" },
]

export default function Home() {
  const router = useRouter()

  const openStudio = async (source: string) => {
    trackCTAClick(source, "Try clar1ty free")
    const authenticated = await isAuthenticated()
    router.push(authenticated ? "/app/studio" : "/sign-in")
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

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-black/55 px-6 py-4 backdrop-blur-xl lg:px-16">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <Link href="/" aria-label="clar1ty home">
            <ClarityLogo className="h-8 w-auto" width={130} height={40} />
          </Link>
          <div className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.18em] text-[#d9ccb6] md:flex">
            <a href="#use-cases" className="transition hover:text-[#d7a957]">
              Use Cases
            </a>
            <a href="#presets" className="transition hover:text-[#d7a957]">
              Presets
            </a>
            <Link href="/pricing" className="transition hover:text-[#d7a957]">
              Pricing
            </Link>
            <Link href="/examples" className="transition hover:text-[#d7a957]">
              Examples
            </Link>
            <Link href="/faq" className="transition hover:text-[#d7a957]">
              FAQ
            </Link>
            <Link href="/sign-in" className="transition hover:text-[#d7a957]">
              Sign in
            </Link>
            <Button onClick={onTryFree} className="h-10 rounded-none bg-[#c9953d] px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black hover:bg-[#d7a957]">
              Try free
            </Button>
          </div>
        </div>
      </nav>

      <div className="relative mx-auto grid min-h-[820px] max-w-7xl gap-14 px-6 pb-16 pt-28 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-16 lg:pt-32">
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
              Try clar1ty free
            </Button>
            <Button asChild className="h-12 rounded-none border border-[#6f5d49] bg-[#17120f] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#f0e2cf] hover:bg-[#221913]">
              <Link href="/pricing">View pricing</Link>
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
          <div className="mt-6 rounded-sm bg-[#d4c7b0] p-4 text-black shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
            <div className="flex items-center justify-between border-b border-black/10 pb-3 text-[10px] uppercase tracking-[0.22em] text-black/60">
              <span>Upload workspace</span>
              <span>Preview</span>
            </div>
            <div className="mt-4 rounded-sm border border-dashed border-black/25 bg-[#bcae95] px-5 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black/20 bg-[#efe6d6]">
                <Upload className="h-7 w-7 text-[#7d6b56]" strokeWidth={1.7} />
              </div>
              <p className="mt-4 text-sm text-black/85">Drop a photo or scan here</p>
              <p className="mt-2 text-xs leading-6 text-black/55">JPEG, PNG and supported scans</p>
            </div>
            <Button className="mt-4 h-11 w-full rounded-none bg-[#efe8dc] text-[11px] font-semibold uppercase tracking-[0.14em] text-black hover:bg-white">
              Choose file
            </Button>
          </div>
        </div>

        <div className="flex min-h-[360px] items-center justify-center px-6 py-10 lg:px-12 lg:py-12">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black/25">
              <ClarityLogo className="h-12 w-auto" width={120} height={48} />
            </div>
            <p className="mt-5 text-sm uppercase tracking-[0.24em] text-[#efe0c1]">clar1ty upload studio</p>
            <p className="mt-4 text-sm leading-7 text-[#efe8dc]/80">
              Upload a portrait or heritage image, preview the enhancement cost and move into a focused workflow designed to preserve context.
            </p>
            <Button onClick={onTryFree} className="mt-8 h-12 rounded-none bg-[#efe8dc] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-black hover:bg-white">
              Start with 10 free credits
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
            The flow stays intentionally simple so the result feels controlled, not generic.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stepCards.map(({ title, copy, icon: Icon }, index) => (
            <div key={title} className="relative">
              <article className="h-full rounded-2xl bg-black/70 p-8 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#4a3e31] bg-[#17120f]">
                  <Icon className="h-8 w-8 text-[#d7a957]" strokeWidth={1.6} />
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
            Every preset is tuned for a specific kind of image so the output stays useful instead of over-processed.
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
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f8678]">Preset</p>
                  <h3 className="mt-3 text-lg font-medium text-[#f6ebdd]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#d1c3b1]">{card.copy}</p>
                </div>
              </div>
              <div className={`relative min-h-[220px] ${index % 2 === 1 ? "md:order-1" : ""}`}>
                <Image src={card.image} alt={card.alt} fill sizes="(min-width: 768px) 40vw, 92vw" className="object-cover object-center" />
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
    <section className="relative overflow-hidden bg-[#090705] px-6 py-24 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_30%,rgba(201,149,61,0.12),transparent_22%),radial-gradient(circle_at_92%_36%,rgba(201,149,61,0.1),transparent_22%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-[0.01em] text-[#f1e5d3] md:text-5xl">Better quality. Same identity.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#d4c7b6]">
            Clar1ty improves the image while holding onto the cues that make it feel like the original.
          </p>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/6 bg-black/60 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
          <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-64 bg-[url('/images/landing/comparisons/faces-after.jpg')] bg-cover bg-center opacity-35 blur-[1px] lg:block" />
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-64 bg-[url('/images/landing/comparisons/heritage-after.jpg')] bg-cover bg-center opacity-30 blur-[1px] lg:block" />
          <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {qualityItems.map(({ title, copy, icon: Icon }) => (
              <article key={title} className="flex items-start gap-4 rounded-2xl bg-white/[0.05] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#4a3e31] bg-[#17120f]">
                  <Icon className="h-6 w-6 text-[#d7a957]" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#d7a957]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">{copy}</p>
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
    <section id="use-cases" className="bg-black px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-light tracking-[0.01em] text-[#f1e5d3] md:text-5xl">For people, projects, and purpose.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#d4c7b6]">
            Clar1ty is useful wherever an image needs to feel cleaner, more present and still recognizable.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {useCaseCards.map((card) => (
            <article key={card.title} className="card-gold-accent overflow-hidden rounded-2xl">
              <div className="relative h-44">
                <Image src={card.image} alt={card.alt} fill sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 90vw" className="object-cover object-center" />
              </div>
              <div className="p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#d7a957]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#d7ccba]">{card.copy}</p>
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
    <section className="bg-black px-6 py-16 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem]">
          <div className="grid grid-cols-2 gap-0 md:grid-cols-5">
            {collageImages.map((image) => (
              <div key={image.alt} className="relative min-h-[220px]">
                <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 20vw, 50vw" className="object-cover object-center" />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10" />
          <div className="absolute inset-x-0 bottom-3 flex justify-center">
            <ClarityLogo className="h-14 w-auto opacity-95 md:h-20" width={220} height={72} />
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCTA({ onTryFree }: { onTryFree: () => void }) {
  const securityItems = [
    { title: "Secure processing", copy: "Your images are encrypted and processed safely.", Icon: Shield },
    { title: "No unnecessary storage", copy: "We save nothing you don't ask us to.", Icon: Lock },
    { title: "Your images stay yours", copy: "You own your images. Always.", Icon: UserRound },
  ]

  return (
    <section className="bg-black px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 rounded-3xl bg-white/[0.03] p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
          <div className="space-y-5">
            {securityItems.map(({ title, copy, Icon }) => (
              <div key={title} className="flex gap-4 rounded-2xl bg-black/30 p-4">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-[#d7a957]" />
                <div>
                  <p className="text-sm font-semibold text-[#f6ebdd]">{title}</p>
                  <p className="mt-1 text-sm leading-7 text-[#d1c3b1]">{copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/8 bg-[#1a1612] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Restore more detail. Keep full control.</p>
            <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">Start enhancing your images today.</h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#d4c7b6]">
              Preserve the details that matter and keep the workflow simple.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button onClick={onTryFree} className="h-12 rounded-none bg-[#c9953d] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-black hover:bg-[#d7a957]">
                Try clar1ty free
              </Button>
              <Button asChild className="h-12 rounded-none border border-[#6f5d49] bg-[#17120f] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#f0e2cf] hover:bg-[#221913]">
                <Link href="/pricing">View pricing</Link>
              </Button>
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
