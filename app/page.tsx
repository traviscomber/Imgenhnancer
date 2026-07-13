"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Lock, Sparkles, Shield, UserRound, Zap } from "lucide-react"
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

const audienceCards: InfoCard[] = [
  {
    title: "Cultural archives",
    copy: "Digitize, enhance and preserve historical collections while keeping textures and visual authenticity intact.",
    image: "/images/landing/comparisons/archive-after.png",
    alt: "Restored archival photo",
  },
  {
    title: "Photo restoration services",
    copy: "Deliver cleaner, sharper results for clients with a workflow built for damaged and low-resolution images.",
    image: "/images/landing/comparisons/archive-before.png",
    alt: "Damaged archive photo",
  },
  {
    title: "Creators & digital artists",
    copy: "Upscale references, artwork and concepts while keeping details clear, controlled and ready to use.",
    image: "/images/landing/comparisons/digital-after.jpg",
    alt: "Enhanced digital artwork",
  },
  {
    title: "Museums & heritage projects",
    copy: "Prepare images for exhibitions, publications and storytelling with archive-quality care.",
    image: "/images/landing/comparisons/heritage-after.jpg",
    alt: "Heritage restoration result",
  },
  {
    title: "Print shops & studios",
    copy: "Improve image detail, contrast and clarity before printing, framing or client delivery.",
    image: "/images/landing/comparisons/faces-after.jpg",
    alt: "Polished restored portrait",
  },
  {
    title: "Brands & businesses",
    copy: "Enhance product photos, founder portraits and campaign visuals with a refined visual finish.",
    image: "/images/landing/comparisons/hero-after-new.png",
    alt: "Enhanced portrait for brand use",
  },
]

const whyCards = [
  {
    title: "Special care for Asian faces",
    copy: "Clar1ty is designed around facial structure, skin texture, expression and identity - especially for Asian portraits and heritage imagery.",
    icon: UserRound,
  },
  {
    title: "Natural restoration behavior",
    copy: "Improve damaged, faded or low-resolution images while keeping the result close to the original appearance.",
    icon: Sparkles,
  },
  {
    title: "Cultural detail preservation",
    copy: "Recover architecture, traditional clothing, ornaments, patterns, fabrics and historical textures with controlled enhancement.",
    icon: Shield,
  },
  {
    title: "Simple workflow",
    copy: "Upload an image, choose a preset, select x2, x3 or x4, preview the credit cost, enhance and download.",
    icon: Zap,
  },
]

const showcaseCards: ComparisonCard[] = [
  {
    title: "Asian Portrait",
    copy: "Preserve expression, skin tone and face structure without flattening detail.",
    beforeImage: "/images/landing/comparisons/hero-before-new.png",
    afterImage: "/images/landing/comparisons/hero-after-new.png",
    beforeAlt: "Original Asian portrait",
    afterAlt: "Enhanced Asian portrait",
  },
  {
    title: "Old Family Photo",
    copy: "Recover faded memories with restrained cleanup and stable structure.",
    beforeImage: "/images/landing/comparisons/faces-before.jpg",
    afterImage: "/images/landing/comparisons/faces-after.jpg",
    beforeAlt: "Old family photo",
    afterAlt: "Restored family photo",
  },
  {
    title: "Architecture Detail",
    copy: "Keep structure, lines and textures crisp for heritage and documentation work.",
    beforeImage: "/images/landing/comparisons/archive-before.png",
    afterImage: "/images/landing/comparisons/archive-after.png",
    beforeAlt: "Low-quality architecture detail",
    afterAlt: "Restored architecture detail",
  },
  {
    title: "Creative Artwork",
    copy: "Upscale creative visuals without losing the look that made them work.",
    beforeImage: "/images/landing/comparisons/digital-before.jpg",
    afterImage: "/images/landing/comparisons/digital-after.jpg",
    beforeAlt: "Low resolution artwork",
    afterAlt: "Upscaled creative artwork",
  },
  {
    title: "Product / Brand",
    copy: "Improve founder portraits and product visuals for campaigns and presentations.",
    beforeImage: "/images/landing/comparisons/heritage-before.jpg",
    afterImage: "/images/landing/comparisons/heritage-after.jpg",
    beforeAlt: "Original product or brand image",
    afterAlt: "Enhanced product or brand image",
  },
]

const presetCards: InfoCard[] = [
  {
    title: "Clean Enhance",
    copy: "Improve clarity, contrast and overall image quality for digital photos, product visuals and brand assets.",
    image: "/images/landing/comparisons/hero-after-new.png",
    alt: "Clean enhancement example",
  },
  {
    title: "Old Photo Restore",
    copy: "Restore faded, scratched or damaged photographs with careful, natural cleanup.",
    image: "/images/landing/comparisons/faces-after.jpg",
    alt: "Old photo restoration example",
  },
  {
    title: "Face Detail",
    copy: "Enhance facial features while keeping a natural appearance for portraits and wedding photos.",
    image: "/images/landing/comparisons/hero-after.jpg",
    alt: "Face detail enhancement example",
  },
  {
    title: "Cultural Detail",
    copy: "Preserve architecture, clothing, ornaments and cultural textures during enhancement.",
    image: "/images/landing/comparisons/heritage-after.jpg",
    alt: "Cultural detail enhancement example",
  },
]

const useCaseCards: InfoCard[] = [
  {
    title: "For photographers",
    copy: "Restore soft portraits, prepare client images for delivery and improve older photo collections with a faster workflow.",
    image: "/images/landing/comparisons/faces-after.jpg",
    alt: "Photography use case",
  },
  {
    title: "For designers",
    copy: "Enhance visual references, scanned artwork, moodboards and creative assets without losing texture or character.",
    image: "/images/landing/comparisons/digital-after.jpg",
    alt: "Design use case",
  },
  {
    title: "For brands",
    copy: "Improve campaign images, product visuals and founder portraits for better storytelling.",
    image: "/images/landing/comparisons/heritage-after.jpg",
    alt: "Brand use case",
  },
  {
    title: "For families",
    copy: "Bring old family photos, wedding portraits and personal memories back to life with natural restoration.",
    image: "/images/landing/comparisons/archive-after.png",
    alt: "Family use case",
  },
  {
    title: "For archives",
    copy: "Preserve historical images, cultural collections and documentation with careful detail recovery.",
    image: "/images/landing/comparisons/archive-before.png",
    alt: "Archive use case",
  },
  {
    title: "For print shops",
    copy: "Prepare clearer, richer images for printing, framing and professional presentation.",
    image: "/images/landing/comparisons/hero-after-new.png",
    alt: "Print shop use case",
  },
]

const faqQuestions = [
  "Is clar1ty only for old photos?",
  "Is clar1ty good for Asian faces?",
  "What is Cultural Detail?",
  "What is the difference between x2 and x4?",
  "Which preset should I choose?",
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
      <AudienceSection onTryFree={() => openStudio("audience")} />
      <WhySection />
      <ShowcaseSection />
      <PresetSection />
      <PricingPreview />
      <UseCasesSection />
      <FAQSection />
      <FinalCTA onTryFree={() => openStudio("final_cta")} />
    </div>
  )
}

function Hero({ onTryFree }: { onTryFree: () => void }) {
  return (
    <section className="relative overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(201,149,61,0.14),transparent_32%),radial-gradient(circle_at_86%_14%,rgba(122,91,50,0.12),transparent_30%)]" />

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-black/45 px-6 py-4 backdrop-blur-xl lg:px-16">
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

      <div className="relative mx-auto grid min-h-[860px] max-w-7xl gap-12 px-6 pb-20 pt-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-16 lg:pt-32">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">AI image enhancement for portraits, creators and heritage restoration</p>
          <h1 className="mt-6 text-5xl font-light leading-[1.06] tracking-[0.01em] text-white md:text-7xl">
            Enhance.
            <br />
            Restore.
            <br />
            <span className="text-[#d7a957]">Preserve what matters.</span>
          </h1>
          <p className="mt-8 max-w-xl text-sm leading-7 text-[#d6cabc] md:text-base">
            Enhance portraits, restore old photos, upscale creative assets and improve images for professional use - with special care for Asian faces and cultural detail.
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
          <div className="absolute -right-6 bottom-10 hidden h-44 w-44 rounded-full bg-[#7b5d36]/20 blur-3xl lg:block" />
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

function AudienceSection({ onTryFree }: { onTryFree: () => void }) {
  return (
    <section className="bg-black px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Built for every image that deserves more detail</p>
            <h2 className="text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">clar1ty is not only for old photographs.</h2>
            <p className="max-w-lg text-sm leading-7 text-[#d4c7b6]">
              It is made for portraits, creative work, brand visuals, product images, cultural references, family memories and professional restoration workflows.
            </p>
            <Button onClick={onTryFree} className="h-11 rounded-none bg-[#c9953d] px-7 text-[12px] font-semibold uppercase tracking-[0.12em] text-black hover:bg-[#d7a957]">
              Try clar1ty free
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {audienceCards.map((card) => (
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
      </div>
    </section>
  )
}

function WhySection() {
  return (
    <section className="bg-[#090705] px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">More than enhancement. True preservation.</p>
          <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">clar1ty combines modern AI enhancement with careful restoration.</h2>
          <p className="mt-6 text-sm leading-7 text-[#d4c7b6]">
            Images become clearer without losing their original character.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {whyCards.map(({ title, copy, icon: Icon }) => (
            <article key={title} className="rounded-2xl bg-white/[0.03] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17120f]">
                <Icon className="h-6 w-6 text-[#d7a957]" strokeWidth={1.7} />
              </div>
              <h3 className="mt-5 text-lg font-medium text-[#f6ebdd]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#d1c3b1]">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ShowcaseSection() {
  return (
    <section id="examples" className="bg-black px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">From faded to unforgettable</p>
          <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">See how clar1ty restores clarity, detail and emotional presence.</h2>
          <p className="mt-6 text-sm leading-7 text-[#d4c7b6]">
            Portraits, old family photographs, architecture, creative artwork and brand visuals all benefit from the same careful treatment.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {showcaseCards.map((card) => (
            <article key={card.title} className="rounded-2xl bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d7a957]">{card.title}</h3>
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#9f8d72]">Before / After</span>
              </div>
              <LiveComparison
                beforeImage={card.beforeImage}
                afterImage={card.afterImage}
                beforeAlt={card.beforeAlt}
                afterAlt={card.afterAlt}
                className="h-72 rounded-xl"
              />
              <p className="mt-4 text-sm leading-7 text-[#d4c7b6]">{card.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PresetSection() {
  return (
    <section id="presets" className="bg-[#090705] px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">One click. The right enhancement.</p>
          <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">Choose from four focused presets designed for different types of images.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {presetCards.map((card) => (
            <article key={card.title} className="rounded-2xl bg-white/[0.03] p-5">
              <div className="relative h-48 overflow-hidden rounded-xl">
                <Image src={card.image} alt={card.alt} fill sizes="(min-width: 768px) 45vw, 92vw" className="object-cover object-center" />
              </div>
              <div className="p-2 pt-5">
                <h3 className="text-lg font-medium text-[#f6ebdd]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#d1c3b1]">{card.copy}</p>
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

function UseCasesSection() {
  return (
    <section id="use-cases" className="bg-black px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl text-center mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">One tool for many meaningful uses</p>
          <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">For photographers, designers, brands, families, archives and print shops.</h2>
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

function FAQSection() {
  const answers = {
    "Is clar1ty only for old photos?":
      "No. clar1ty works with modern digital photos, portraits, product images, creative assets, artwork, scans and old photographs. Heritage restoration is part of the product, not the only use case.",
    "Is clar1ty good for Asian faces?":
      "Yes. clar1ty is designed with special care for Asian portraits, facial detail, skin texture, traditional clothing and cultural visual elements.",
    "What is Cultural Detail?":
      "Cultural Detail helps preserve architecture, traditional clothing, ornaments, patterns, fabrics and cultural textures during enhancement.",
    "What is the difference between x2 and x4?":
      "x2 is more conservative and usually stays closer to the original appearance. x4 applies stronger one-step enhancement and may introduce more AI-generated detail.",
    "Which preset should I choose?":
      "Use Clean Enhance for general work, Old Photo Restore for damaged photos, Face Detail for portraits and Cultural Detail for heritage or culturally specific images.",
  } as const

  return (
    <section id="faq" className="bg-[#090705] px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Common questions</p>
          <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">Questions people ask before they start.</h2>
        </div>
        <div className="mt-12 grid gap-4">
          {faqQuestions.map((question) => (
            <details key={question} className="rounded-2xl bg-white/[0.03] p-6">
              <summary className="cursor-pointer list-none text-base font-medium text-[#f6ebdd]">{question}</summary>
              <p className="mt-4 text-sm leading-7 text-[#d1c3b1]">{answers[question]}</p>
            </details>
          ))}
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
        <div className="grid gap-12 rounded-3xl bg-white/[0.03] p-8 lg:grid-cols-[0.95fr_0.85fr] lg:p-12">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Restore more detail. Keep full control.</p>
            <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">
              Start with 10 free credits. Enhance portraits, restore memories and improve creative visuals.
            </h2>
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
