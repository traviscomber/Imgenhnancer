"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, Lock, Shield, UserRound } from "lucide-react"
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

type IconSpec = {
  src: string
}

const iconBase = "/images/landing/icons-svg"
const iconSvg = (name: string) => `${iconBase}/${name}.svg`

const contextCards = [
  {
    title: "ORIGINAL ARCHIVE",
    subtitle: "Low-quality source",
    image: "/images/landing/comparisons/generic-original.jpg",
    points: ["Faded & noisy", "Low detail", "Hard to read"],
  },
  {
    title: "GENERIC UPSCALER",
    subtitle: "Changes what matters",
    image: "/images/landing/comparisons/generic-clar1ty.jpg",
    points: ["Altered faces", "Changed details", "Lost authenticity"],
  },
  {
    title: "CLAR1TY ENHANCED",
    subtitle: "Identity-preserved result",
    image: "/images/landing/comparisons/generic-upscaler.jpg",
    points: ["True to originals", "Cultural details kept", "Clear & authentic"],
  },
]

const enhancementComparisons = [
  {
    icon: { src: iconSvg("archive-scan") },
    title: "ARCHIVE SCAN",
    copy: "Clean scans, reduce scratches, and improve faded printed photos.",
    beforeImage: "/images/landing/comparisons/archive-before.png",
    afterImage: "/images/landing/comparisons/archive-after.png",
    beforeAlt: "Old damaged archive scan",
    afterAlt: "Upscaled archive scan",
  },
  {
    icon: { src: iconSvg("face-preserve") },
    title: "ASEAN PORTRAIT PRESERVE",
    copy: "Enhance portraits while preserving facial identity and natural skin tones.",
    beforeImage: "/images/landing/comparisons/hero-before.jpg",
    afterImage: "/images/landing/comparisons/hero-after.jpg",
    beforeAlt: "Old faded ASEAN portrait",
    afterAlt: "Upscaled ASEAN portrait",
  },
  {
    icon: { src: iconSvg("heritage-restore") },
    title: "HERITAGE RESTORE",
    copy: "Clar1ty.art restores clarity without erasing who people are.",
    beforeImage: "/images/landing/comparisons/heritage-before.jpg",
    afterImage: "/images/landing/comparisons/heritage-after.jpg",
    beforeAlt: "Low clarity heritage image",
    afterAlt: "Upscaled heritage image",
  },
  {
    icon: { src: iconSvg("digital-upscale") },
    title: "DIGITAL ART UPSCALE",
    copy: "Upscale digital art, illustrations, and concepts without losing style. Print Ready",
    beforeImage: "/images/landing/comparisons/digital-before.jpg",
    afterImage: "/images/landing/comparisons/digital-after.jpg",
    beforeAlt: "Low resolution digital art",
    afterAlt: "Upscaled digital art",
  },
]

const steps = [
  {
    icon: { src: iconSvg("upload-cloud") },
    title: "Upload your image",
    copy: "Start with a heritage photo, portrait, archive scan, low-resolution file, or digital artwork.",
  },
  {
    icon: { src: iconSvg("preset-sliders") },
    title: "Choose your preset",
    copy: "Select the enhancement mode that matches your image. Clar1ty applies the right treatment automatically.",
  },
  {
    icon: { src: iconSvg("download-tray") },
    title: "Download your result",
    copy: "Receive a cleaner, sharper, higher-resolution image ready for digital use, print, or archive.",
  },
]

const qualityItems = [
  { icon: { src: iconSvg("face-profile") }, title: "Face Preservation", copy: "Protects facial structure and expressions." },
  { icon: { src: iconSvg("natural-tones") }, title: "Natural tones", copy: "Keeps skin tones and colors true." },
  { icon: { src: iconSvg("real-detail") }, title: "Real detail", copy: "Brings out textures, edges, and fine detail." },
  { icon: { src: iconSvg("cultural-respect") }, title: "Cultural respect", copy: "Enhances without altering cultural elements." },
  { icon: { src: iconSvg("balanced-results") }, title: "Balanced results", copy: "No over-processing. Just the right touch." },
  { icon: { src: iconSvg("high-resolution") }, title: "High resolution", copy: "Sharper images for modern use and printing." },
]

const useCases = [
  {
    icon: { src: iconSvg("cultural-archives") },
    title: "Cultural archives",
    copy: "Restore and preserve historical photographs and documents.",
  },
  {
    icon: { src: iconSvg("photo-restoration") },
    title: "Photo restoration services",
    copy: "Deliver higher-quality results faster with AI-powered enhancement.",
  },
  {
    icon: { src: iconSvg("creators-digital-artists") },
    title: "Creators & digital artists",
    copy: "Enhance references, concepts, and artwork with more detail and clarity.",
  },
  {
    icon: { src: iconSvg("museum-projects") },
    title: "Museums & heritage projects",
    copy: "Prepare images for exhibitions, publications, and educational materials.",
  },
  {
    icon: { src: iconSvg("print-shops") },
    title: "Print shops & studios",
    copy: "Produce print-ready files with clean detail and balanced contrast.",
  },
  {
    icon: { src: iconSvg("brands-businesses") },
    title: "Brands & businesses",
    copy: "Improve visual assets for marketing, storytelling, and brand heritage.",
  },
]

const portraitStrip = [
  "/images/landing/comparisons/hero-after.jpg",
  "/images/landing/comparisons/portrait-after-alt.jpg",
  "/images/landing/comparisons/child-after.jpg",
  "/images/landing/comparisons/elder-after.jpg",
  "/images/landing/comparisons/hero-after.jpg",
]

const finalPrints = [
  "/images/landing/comparisons/child-after.jpg",
  "/images/landing/comparisons/heritage-after.jpg",
  "/images/landing/comparisons/archive-after.png",
  "/images/landing/comparisons/digital-after.jpg",
  "/images/landing/comparisons/hero-after.jpg",
]

const securityItems = [
  { title: "Secure processing", copy: "Your images are encrypted and processed safely.", Icon: Shield },
  { title: "No unnecessary storage", copy: "We save nothing you don't ask us to.", Icon: Lock },
  { title: "Your images stay yours", copy: "You own your images. Always.", Icon: UserRound },
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
      <HeroSection onCta={() => openEnhancer("hero")} />
      <UploadSection onCta={() => openEnhancer("upload_section")} />
      <ContextSection onCta={() => openEnhancer("context_section")} />
      <EnhancementSection />
      <StepsSection />
      <QualitySection />
      <FacesSection />
      <UseCasesSection />
      <PrivacyStrip />
      <CtaSection onCta={() => openEnhancer("bottom_cta")} />
      <FinalCollage />
    </div>
  )
}

function HeroSection({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative min-h-[720px] overflow-hidden bg-black">
      <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-black/35 px-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:px-24">
        <Link href="/" aria-label="clar1ty home">
          <ClarityLogo className="h-9 w-auto drop-shadow-[0_0_10px_rgba(211,155,62,0.45)]" width={130} height={40} />
        </Link>
        <div className="hidden items-center gap-8 text-[11px] font-medium text-[#e8dfd0] md:flex">
          <a href="#features" className="hover:text-[#d7a957]">Features</a>
          <a href="#use-cases" className="hover:text-[#d7a957]">Use Cases</a>
          <a href="#how-it-works" className="hover:text-[#d7a957]">How It Works</a>
          <Link href="/pricing" className="hover:text-[#d7a957]">Pricing</Link>
          <Link href="/support" className="hover:text-[#d7a957]">Support</Link>
          <Link href="/enhance" className="rounded-full border border-[#c9953d]/40 px-4 py-2 text-[#f0d59c] hover:border-[#c9953d] hover:text-white">
            Login
          </Link>
        </div>
      </nav>

      <div className="absolute inset-y-0 right-0 w-full lg:w-[58vw]">
        <LiveComparison
          beforeImage="/images/landing/comparisons/hero-before-new.png"
          afterImage="/images/landing/comparisons/hero-after-new.png"
          beforeAlt="Original ASEAN portrait"
          afterAlt="Enhanced ASEAN portrait"
          className="h-full"
          sizes="(min-width: 1024px) 58vw, 100vw"
          priority
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[1600px] items-center px-6 pt-28 lg:px-24">
        <div className="max-w-[520px] py-20">
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
      </div>
    </section>
  )
}

function UploadSection({ onCta }: { onCta: () => void }) {
  return (
    <section className="bg-[#7d715f]">
      <div className="mx-auto grid min-h-[720px] max-w-[1600px] lg:grid-cols-[0.39fr_0.61fr]">
        <div className="bg-[#8c8374] px-8 py-16 lg:px-28">
          <h2 className="text-5xl font-light tracking-[0.04em] text-[#e9e0d4]">Upload image</h2>
          <p className="mt-16 text-center text-[13px] leading-6 text-white">
            Natural skin tones. Real facial structure.
            <br />
            Local visual character. Cultural detail.
          </p>
          <button
            type="button"
            onClick={onCta}
            className="mx-auto mt-12 flex h-72 w-full max-w-[330px] flex-col items-center justify-center border border-dashed border-[#5f5446] bg-[#968d7e] text-center transition hover:bg-[#a09788]"
          >
            <IconCrop icon={{ src: iconSvg("upload-cloud") }} className="h-20 w-20" />
            <span className="mt-7 text-[13px] font-semibold text-white">Drop or select your image here</span>
            <span className="mt-2 text-[12px] text-[#f3eee5]">Browse PNG, JPG, WebP</span>
            <span className="mt-7 text-[12px] text-[#f3eee5]">Up to 10 MB</span>
          </button>
          <Button onClick={onCta} className="mx-auto mt-10 flex h-12 w-full max-w-[330px] rounded-none bg-[#241b13] text-[12px] text-white hover:bg-[#34271d]">
            Upscale Image
          </Button>
        </div>
        <div className="flex items-center justify-center px-8 py-16">
          <div className="text-center">
            <IconCrop icon={{ src: iconSvg("upload-cloud") }} className="mx-auto h-20 w-20" />
            <h3 className="mt-10 text-[15px] font-semibold text-white">No images upscaled yet</h3>
            <p className="mt-8 text-[13px] text-[#eee5d8]">Upload an image to upscale it</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContextSection({ onCta }: { onCta: () => void }) {
  return (
    <section id="features" className="bg-black px-6 py-24">
      <div className="mx-auto max-w-[1280px] text-center">
        <h2 className="text-4xl font-light leading-tight tracking-[0.08em] text-[#e6ded2] md:text-5xl">
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
          {contextCards.map((card) => (
            <article key={card.title} className="text-left">
              <div className="relative h-[260px] overflow-hidden border border-[#2b241d] bg-[#11100f]">
                <Image src={card.image} alt={card.title} fill sizes="33vw" className="object-cover object-center" />
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
        <Button onClick={onCta} className="mt-24 h-12 rounded-none bg-[#8b7d6a] px-20 text-[12px] font-semibold uppercase text-white hover:bg-[#a28f76]">
          TRY CLAR1TY ON YOUR IMAGE
        </Button>
        <p className="mt-5 text-[12px] text-[#8f8678]">Secure, private, and encrypted</p>
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
            <article key={item.title} className="grid min-h-[310px] grid-cols-1 bg-[#111111] md:grid-cols-[0.42fr_0.58fr]">
              <div className="p-9">
                <IconCrop icon={item.icon} className="h-16 w-16" />
                <h3 className="mt-14 text-[13px] font-medium uppercase tracking-[0.06em] text-[#b9822c]">{item.title}</h3>
                <p className="mt-10 text-[15px] leading-7 text-[#e1d9ce]">{item.copy}</p>
              </div>
              <LiveComparison {...item} className="h-[310px] md:h-full" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function StepsSection() {
  return (
    <section id="how-it-works" className="bg-[#151515] px-6 py-24">
      <div className="mx-auto max-w-[1280px] text-center">
        <h2 className="text-4xl font-light uppercase tracking-[0.08em] text-[#d7c4a7]">SIMPLE. FAST. EFFECTIVE.</h2>
        <p className="mt-14 text-[12px] font-semibold text-white">How it works</p>
        <p className="mt-2 text-[12px] text-[#d8d0c4]">Three easy steps to restore and enhance your images.</p>
        <div className="mt-20 grid gap-14 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="relative rounded-xl bg-black px-12 py-16 shadow-[0_0_28px_rgba(0,0,0,0.6)]">
              {index < steps.length - 1 ? <ArrowRight className="absolute -right-9 top-1/2 hidden h-6 w-6 text-[#b9822c] lg:block" /> : null}
              <IconCrop icon={step.icon} className="mx-auto h-24 w-24" />
              <h3 className="mt-10 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-5 text-[13px] leading-6 text-[#d8d0c4]">{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function QualitySection() {
  return (
    <section className="bg-[#33271d] px-6 py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <h2 className="text-4xl font-light uppercase tracking-[0.08em] text-[#d2c6b6]">BETTER QUALITY. SAME IDENTITY</h2>
          <p className="mt-14 text-[12px] font-semibold text-white">How it works</p>
          <p className="mt-2 text-[12px] text-[#d8d0c4]">Three easy steps to restore and enhance your images.</p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {qualityItems.map((item) => (
            <article key={item.title} className="flex items-center gap-8 rounded-lg bg-[#837763] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
              <IconCrop icon={item.icon} className="h-24 w-24 shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-5 text-[13px] leading-6 text-[#f1eadf]">{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FacesSection() {
  return (
    <section id="faces" className="bg-black px-6 py-28">
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

function UseCasesSection() {
  return (
    <section id="use-cases" className="bg-black px-6 py-24">
      <div className="mx-auto max-w-[1280px] text-center">
        <h2 className="text-4xl font-light uppercase tracking-[0.08em] text-[#c9b493]">FOR PEOPLE, PROJECTS, AND PURPOSE</h2>
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
              <IconCrop icon={card.icon} className="h-28 w-36" />
              <div>
                <h3 className="text-[14px] font-semibold leading-5 text-white">{card.title}</h3>
                <p className="mt-8 text-[13px] leading-6 text-[#d8d0c4]">{card.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PrivacyStrip() {
  return (
    <section className="bg-black px-6 py-20">
      <div className="mx-auto grid max-w-[1280px] items-center gap-16 lg:grid-cols-[0.7fr_0.3fr]">
        <ClarityLogo className="h-36 w-auto drop-shadow-[0_0_18px_rgba(211,155,62,0.55)]" width={620} height={150} />
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
      <div className="mx-auto mt-20 grid max-w-[1280px] grid-cols-2 gap-2 md:grid-cols-5">
        {portraitStrip.map((image, index) => (
          <div key={`${image}-${index}`} className="relative h-[420px] overflow-hidden bg-[#11100f]">
            <Image src={image} alt={`ASEAN portrait ${index + 1}`} fill sizes="20vw" className="object-cover object-center" />
          </div>
        ))}
      </div>
    </section>
  )
}

function CtaSection({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-20">
      <div className="absolute inset-0 opacity-25">
        <Image src="/images/landing/comparisons/heritage-after.jpg" alt="" fill sizes="100vw" className="object-cover object-center" />
      </div>
      <div className="relative mx-auto grid max-w-[960px] items-center gap-14 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold text-white">Secure, private, and simple</h2>
          <div className="mt-8 space-y-6">
            {securityItems.map(({ title, copy, Icon }) => (
              <div key={title} className="flex gap-5">
                <Icon className="mt-1 h-8 w-8 shrink-0 text-[#c79b4b]" />
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
          <Button onClick={onCta} className="mt-10 h-14 w-full rounded-md bg-[#d4933a] text-base font-semibold text-white hover:bg-[#e0a552]">
            Upload your image
          </Button>
          <p className="mt-8 text-[13px] text-[#d8d0c4]">No credit card required.</p>
        </div>
      </div>
    </section>
  )
}

function FinalCollage() {
  return (
    <section className="bg-black py-32">
      <div className="relative mx-auto h-[560px] max-w-[1280px] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(214,188,117,0.12),transparent_55%)]" />
        <div className="absolute inset-x-0 top-14 mx-auto grid max-w-5xl grid-cols-2 items-center gap-4 px-6 md:grid-cols-5">
          {finalPrints.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`relative h-80 overflow-hidden border-[10px] border-[#e9ddc8] bg-[#d4c6ad] shadow-2xl ${
                index % 2 === 0 ? "-rotate-6" : "rotate-5"
              }`}
            >
              <Image src={image} alt={`Printed result ${index + 1}`} fill sizes="20vw" className="object-cover object-center" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function IconCrop({ icon, className = "" }: { icon: IconSpec; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative block overflow-hidden ${className}`}
    >
      <img src={icon.src} alt="" className="h-full w-full object-contain" loading="lazy" decoding="async" />
    </span>
  )
}

function CheckDot() {
  return <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#8a6a36] text-[9px] text-[#c79b4b]">+</span>
}

function LiveComparison({
  beforeImage,
  afterImage,
  beforeAlt,
  afterAlt,
  className = "",
  sizes = "(min-width: 1024px) 45vw, 100vw",
  priority = false,
}: CompareImage & { className?: string; sizes?: string; priority?: boolean }) {
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
