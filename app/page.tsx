"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Archive,
  ArrowRight,
  Brush,
  Castle,
  Download,
  FileImage,
  Gem,
  Landmark,
  Leaf,
  Palette,
  Scale,
  Shield,
  Sparkles,
  Store,
  Upload,
  UserRound,
  Wand2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"
import { trackCTAClick } from "@/lib/analytics"
import { logout } from "@/lib/auth"

const enhancementCards = [
  {
    icon: Archive,
    title: "ARCHIVE SCAN",
    copy: "Clean scans, reduce scratches, and improve faded printed photos.",
    image: "/images/wedding-set1-after.png",
    before: "/images/wedding-set1-before.png",
  },
  {
    icon: UserRound,
    title: "ASEAN PORTRAIT PRESERVE",
    copy: "Enhance portraits while preserving facial identity and natural skin tones.",
    image: "/images/thai-family-restored.png",
    before: "/images/thai-family-faded.png",
  },
  {
    icon: Landmark,
    title: "HERITAGE RESTORE",
    copy: "Clar1ty art restores clarity without erasing who people are.",
    image: "/images/real-estate-after.png",
    before: "/images/real-estate-before.png",
  },
  {
    icon: Wand2,
    title: "DIGITAL ART UPSCALE",
    copy: "Upscale digital art, illustrations, and concepts without losing style. Print Ready.",
    image: "/images/abstract-art-enhanced.png",
    before: "/images/abstract-art-low.png",
  },
]

const steps = [
  {
    icon: Upload,
    title: "Upload your image",
    copy: "Start with a heritage photo, portrait, archive scan, low-resolution file, or digital artwork.",
  },
  {
    icon: Sparkles,
    title: "Choose your preset",
    copy: "Select the enhancement mode that matches your image. Clar1ty applies the right treatment automatically.",
  },
  {
    icon: Download,
    title: "Download your result",
    copy: "Receive a cleaner, sharper, higher-resolution image ready for digital use, print, or archive.",
  },
]

const qualityItems = [
  {
    icon: UserRound,
    title: "Face Preservation",
    copy: "Protects facial structure and expressions.",
  },
  {
    icon: Leaf,
    title: "Natural tones",
    copy: "Keeps skin tones and colors true.",
  },
  {
    icon: FileImage,
    title: "Real detail",
    copy: "Brings out textures, edges, and fine detail.",
  },
  {
    icon: Castle,
    title: "Cultural respect",
    copy: "Enhances without altering cultural elements.",
  },
  {
    icon: Scale,
    title: "Balanced results",
    copy: "No over-processing. Just the right touch.",
  },
  {
    icon: Gem,
    title: "High resolution",
    copy: "Sharper images for modern use and printing.",
  },
]

const useCases = [
  {
    icon: Palette,
    title: "Cultural archives",
    copy: "Restore and preserve historical photographs and documents.",
  },
  {
    icon: Brush,
    title: "Photo restoration services",
    copy: "Deliver higher-quality results faster with AI-powered enhancement.",
  },
  {
    icon: Landmark,
    title: "Creators & digital artists",
    copy: "Enhance references, concepts, and artwork with more detail and clarity.",
  },
  {
    icon: Castle,
    title: "Museums & heritage projects",
    copy: "Prepare images for exhibitions, publications, and educational materials.",
  },
  {
    icon: FileImage,
    title: "Print shops & studios",
    copy: "Produce print-ready files with clean detail and balanced contrast.",
  },
  {
    icon: Store,
    title: "Brands & businesses",
    copy: "Improve visual assets for marketing, storytelling, and brand heritage.",
  },
]

const portraitStrip = [
  "/images/javanese-wedding-restored.png",
  "/images/wedding-after.png",
  "/images/thai-family-restored.png",
  "/images/vintage-wedding-clear.jpg",
  "/images/abstract-art-enhanced.png",
]

const finalPrints = [
  "/images/javanese-wedding-restored.png",
  "/images/real-estate-after.png",
  "/images/wedding-after.png",
  "/images/abstract-art-enhanced.png",
  "/images/vintage-wedding-clear.jpg",
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
            <ClarityLogo className="h-10 w-auto" width={130} height={40} />
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

        <section className="bg-[#817463]">
          <div className="mx-auto grid min-h-[700px] max-w-[1600px] lg:grid-cols-[0.78fr_1.22fr]">
            <div className="flex bg-[#928879] px-6 py-16 lg:px-28">
              <div className="mx-auto flex w-full max-w-[360px] flex-col">
                <h2 className="text-left text-5xl font-light tracking-[0.02em] text-[#e8dfd1]">Upload image</h2>
                <p className="mt-16 text-center text-[13px] leading-6 text-[#f0eadf]">
                  Natural skin tones. Real facial structure.
                  <br />
                  Local visual character. Cultural detail.
                </p>

                <button
                  type="button"
                  onClick={() => openEnhancer("upload_section")}
                  className="mt-12 flex h-64 w-full flex-col items-center justify-center border border-dashed border-[#b7ab99] bg-[#9d9384] text-center transition hover:bg-[#a69b8a]"
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eee9df] text-[#a77833]">
                    <Upload className="h-9 w-9" />
                  </span>
                  <span className="mt-7 text-[13px] font-semibold text-white">Drop or select your image here</span>
                  <span className="mt-2 text-[12px] text-[#f3eee5]">Browse PNG, JPG, WebP</span>
                  <span className="mt-7 text-[12px] text-[#f3eee5]">Up to 10 MB</span>
                </button>

                <Button
                  onClick={() => openEnhancer("upload_section")}
                  className="mt-10 h-11 w-full rounded-none bg-[#241b13] text-[12px] text-white hover:bg-[#34271d]"
                >
                  Upscale Image
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center px-6 py-16">
              <div className="flex min-h-[420px] w-full max-w-[520px] flex-col items-center justify-center text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#efe3cf] text-[#efe3cf]">
                  <Upload className="h-10 w-10" />
                </span>
                <h3 className="mt-10 text-[15px] font-semibold text-white">No images upscaled yet</h3>
                <p className="mt-8 text-[13px] text-[#eee5d8]">Upload an image to upscale it</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-black px-6 py-24">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-4xl font-light leading-tight tracking-[0.08em] text-[#ddd4c8] md:text-5xl">
              Generic AI-tools upscale pixels.
              <br />
              Clar1ty preserves context.
            </h2>
            <div className="mx-auto mt-12 h-9 w-40 border-y border-[#32291f]" />
            <p className="mx-auto mt-10 max-w-3xl text-[13px] leading-6 text-[#d8d0c4]">
              ASEAN images carry faces, skin tones, textiles, architecture, ornaments, symbols, and visual identity.
              Generic upscalers often alter faces, attire and design. Clar1ty is built to preserve what matters.
            </p>

            <div className="mt-16 grid gap-7 lg:grid-cols-3">
              {[
                {
                  title: "ORIGINAL ARCHIVE",
                  subtitle: "Low-quality source",
                  image: "/images/thai-family-faded.png",
                  points: ["Faded & noisy", "Low detail", "Hard to read"],
                },
                {
                  title: "GENERIC UPSCALER",
                  subtitle: "Changes what matters",
                  image: "/images/thai-family-restored.png",
                  points: ["Altered faces", "Changed details", "Lost authenticity"],
                },
                {
                  title: "CLAR1TY ENHANCED",
                  subtitle: "Identity-preserved result",
                  image: "/images/thai-family-restored.png",
                  points: ["True to original", "Cultural details kept", "Clear & authentic"],
                },
              ].map((card) => (
                <article key={card.title} className="text-left">
                  <div className="relative h-[260px] overflow-hidden border border-[#2b241d] bg-[#11100f]">
                    <Image src={card.image} alt={card.title} fill className="object-cover object-center" />
                  </div>
                  <div className="border border-[#231d17] bg-[#080706] p-5">
                    <h3 className="text-[13px] font-medium tracking-[0.08em] text-[#d2a450]">{card.title}</h3>
                    <p className="mt-1 text-[12px] text-[#b5aa9a]">{card.subtitle}</p>
                    <div className="mt-5 flex flex-wrap gap-3 text-[11px] text-[#d9d0c2]">
                      {card.points.map((point) => (
                        <span key={point} className="flex items-center gap-2">
                          <CheckDot />
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <Button
              onClick={() => openEnhancer("context_section")}
              className="mt-24 h-12 rounded-none bg-[#8b7d6a] px-20 text-[12px] font-semibold uppercase text-white hover:bg-[#a28f76]"
            >
              TRY CLAR1TY ON YOUR IMAGE
            </Button>
            <p className="mt-5 text-[12px] text-[#8f8678]">Secure, private, and encrypted</p>
          </div>
        </section>

        <section className="bg-black px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-center text-4xl font-light uppercase tracking-[0.06em] text-[#c9b493]">
                CHOOSE THE RIGHT ENHANCEMENT
              </h2>
              <p className="mt-14 text-[12px] font-semibold text-[#f0eadf]">Presets for every image type</p>
              <p className="mt-2 text-[12px] text-[#d8d0c4]">
                Different images need different care. Our presets are tuned for specific image types and results.
              </p>
            </div>

            <div className="mt-20 grid gap-10 lg:grid-cols-2">
              {enhancementCards.map((card) => (
                <article key={card.title} className="grid min-h-[280px] grid-cols-[0.44fr_0.56fr] bg-[#111111]">
                  <div className="p-8">
                    <span className="flex h-16 w-16 items-center justify-center border border-[#9c762d] text-[#c99b3f]">
                      <card.icon className="h-9 w-9" />
                    </span>
                    <h3 className="mt-14 text-[13px] font-medium uppercase tracking-[0.06em] text-[#b9822c]">
                      {card.title}
                    </h3>
                    <p className="mt-10 text-[14px] leading-7 text-[#e1d9ce]">{card.copy}</p>
                  </div>
                  <LandingComparison
                    beforeImage={card.before}
                    afterImage={card.image}
                    className="h-full"
                    imageClassName="object-cover object-center"
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-[#151515] px-6 py-24">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-center text-4xl font-light uppercase tracking-[0.08em] text-[#c9b493]">
              SIMPLE. FAST. EFFECTIVE.
            </h2>
            <p className="mt-14 text-[12px] font-semibold text-white">How it works</p>
            <p className="mt-2 text-[12px] text-[#d8d0c4]">Three easy steps to restore and enhance your images.</p>

            <div className="mt-20 grid gap-12 lg:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step.title} className="relative rounded-xl bg-black px-12 py-16 shadow-[0_0_28px_rgba(0,0,0,0.6)]">
                  {index < steps.length - 1 && (
                    <ArrowRight className="absolute -right-8 top-1/2 hidden h-5 w-5 text-[#c79b4b] lg:block" />
                  )}
                  <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-md border border-[#c79b4b] text-[#c79b4b]">
                    <step.icon className="h-12 w-12" />
                  </span>
                  <h3 className="mt-10 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-5 text-[13px] leading-6 text-[#d8d0c4]">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#33271d] px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-center text-4xl font-light uppercase tracking-[0.08em] text-[#d2c6b6]">
                BETTER QUALITY. SAME IDENTITY
              </h2>
              <p className="mt-14 text-[12px] font-semibold text-white">How it works</p>
              <p className="mt-2 text-[12px] text-[#d8d0c4]">Three easy steps to restore and enhance your images.</p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-2">
              {qualityItems.map((item) => (
                <article key={item.title} className="flex items-center gap-8 rounded-lg bg-[#837763] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
                  <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-black text-[#c79b4b]">
                    <item.icon className="h-12 w-12" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-5 text-[13px] leading-6 text-[#f1eadf]">{item.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid bg-black lg:grid-cols-[0.72fr_0.28fr]">
          <div className="grid grid-cols-2">
            <LandingComparison
              beforeImage="/images/vintage-wedding-blur.png"
              afterImage="/images/vintage-wedding-clear.jpg"
              className="h-[360px]"
              imageClassName="object-cover object-center"
            />
            <LandingComparison
              beforeImage="/images/javanese-wedding-faded.png"
              afterImage="/images/javanese-wedding-restored.png"
              className="h-[360px]"
              imageClassName="object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-center px-12 py-14">
            <h2 className="text-4xl font-light leading-tight text-[#c9a057]">
              Beautiful results,
              <br />
              built for ASEAN
              <br />
              faces
            </h2>
            <p className="mt-16 text-[12px] font-semibold text-white">See the difference!</p>
            <p className="mt-8 max-w-[300px] text-[13px] leading-7 text-[#d8d0c4]">
              From heritage portraits to cultural landmarks and digital art, Clar1ty brings out the best while
              preserving what matters most.
            </p>
          </div>
        </section>

        <section id="use-cases" className="bg-black px-6 py-24">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-center text-4xl font-light uppercase tracking-[0.06em] text-[#c9b493]">
              FOR PEOPLE, PROJECTS, AND PURPOSE
            </h2>
            <p className="mt-16 text-[12px] font-semibold text-white">Who uses Clar1ty?</p>
            <p className="mx-auto mt-4 max-w-[520px] text-[13px] leading-6 text-[#d8d0c4]">
              Trusted by individuals, professionals, and institutions across Southeast Asia and beyond.
              <br />
              <br />
              Improve visual assets for marketing, storytelling, and brand heritage.
            </p>

            <div className="mt-20 grid gap-14 lg:grid-cols-3">
              {useCases.map((card) => (
                <article key={card.title} className="grid min-h-[220px] grid-cols-[0.48fr_0.52fr] items-center rounded-xl border border-[#34302a] bg-black p-8 text-left shadow-[0_0_28px_rgba(214,188,117,0.28)]">
                  <span className="flex h-28 w-28 items-center justify-center rounded-md border border-[#b88a32] text-[#c79b4b]">
                    <card.icon className="h-16 w-16" />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-semibold leading-5 text-white">{card.title}</h3>
                    <p className="mt-8 text-[13px] leading-6 text-[#d8d0c4]">{card.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[0.7fr_0.3fr]">
            <ClarityLogo className="h-36 w-auto" width={620} height={150} />
            <div>
              <h2 className="text-4xl font-light leading-tight text-[#c9a057]">
                Secure, private,
                <br />
                and simple
              </h2>
              <p className="mt-16 text-[13px] leading-7 text-[#d8d0c4]">
                All images are encrypted and processed safely.
                <br />
                No unnecessary storage.
                <br />
                We save nothing you do not ask us to.
                <br />
                Your images stay yours
              </p>
              <p className="mt-10 text-[13px] font-semibold text-white">You own your images. Always.</p>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-6xl grid-cols-2 gap-2 md:grid-cols-5">
            {portraitStrip.map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-[420px] overflow-hidden bg-[#11100f]">
                <Image src={image} alt={`ASEAN portrait ${index + 1}`} fill className="object-cover object-center" />
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden bg-black px-6 py-20">
          <div className="absolute inset-0 opacity-25">
            <Image src="/images/real-estate-after.png" alt="" fill className="object-cover object-center" />
          </div>
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold text-white">Secure, private, and simple</h2>
              <div className="mt-8 space-y-6">
                {[
                  ["Secure processing", "Your images are encrypted and processed safely."],
                  ["No unnecessary storage", "We save nothing you don't ask us to."],
                  ["Your images stay yours", "You own your images. Always."],
                ].map(([title, copy]) => (
                  <div key={title} className="flex gap-5">
                    <Shield className="mt-1 h-8 w-8 shrink-0 text-[#c79b4b]" />
                    <div>
                      <p className="text-[15px] font-semibold text-white">{title}</p>
                      <p className="mt-1 text-[13px] text-[#d8d0c4]">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[410px] rounded-xl border border-[#6f5d49] bg-[#121212]/90 p-10 text-center">
              <h2 className="text-3xl font-light leading-tight text-white">
                Start enhancing
                <br />
                your images today
              </h2>
              <Button
                onClick={() => openEnhancer("bottom_cta")}
                className="mt-10 h-14 w-full rounded-md bg-[#d4933a] text-base font-semibold text-white hover:bg-[#e0a552]"
              >
                Upload your image
              </Button>
              <p className="mt-8 text-[13px] text-[#d8d0c4]">No credit card required.</p>
            </div>
          </div>
        </section>

        <section className="bg-black py-32">
          <div className="relative h-[560px] overflow-hidden">
            <Image src="/images/abstract-art-enhanced.png" alt="Printed Southeast Asian artwork collage" fill className="object-cover object-center opacity-70" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#000_0%,rgba(0,0,0,0.04)_32%,rgba(0,0,0,0.08)_70%,#000_100%)]" />
            <div className="absolute inset-x-0 top-12 mx-auto grid max-w-5xl grid-cols-5 items-center gap-4 px-6">
              {finalPrints.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`relative h-80 overflow-hidden border-[10px] border-[#e9ddc8] bg-[#d4c6ad] shadow-2xl ${
                    index % 2 === 0 ? "-rotate-6" : "rotate-5"
                  }`}
                >
                  <Image src={image} alt={`Printed result ${index + 1}`} fill className="object-cover object-center" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function CheckDot() {
  return <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#8a6a36] text-[9px] text-[#c79b4b]">+</span>
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
      <Image
        src={afterImage}
        alt={afterAlt}
        fill
        priority
        className={imageClassName}
      />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image
          src={beforeImage}
          alt={beforeAlt}
          fill
          priority
          className={imageClassName}
        />
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
