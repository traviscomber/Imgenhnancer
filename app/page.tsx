"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight, Building2, Camera, CheckCircle2, Church, Globe, Shield, Sparkles, Upload, Zap } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClarityLogo } from "@/components/clarity-logo"
import { ImageComparisonHybrid } from "@/components/image-comparison-hybrid"
import { trackCTAClick, trackExampleView } from "@/lib/analytics"
import { logout } from "@/lib/auth"

const comparisonCards = [
  {
    title: "Restore family archives",
    beforeImage: "/images/wedding-before.png",
    afterImage: "/images/wedding-after.png",
    beforeLabel: "Original",
    afterLabel: "Restored",
  },
  {
    title: "Preserve cultural detail",
    beforeImage: "/images/javanese-wedding-faded.png",
    afterImage: "/images/javanese-wedding-restored.png",
    beforeLabel: "Faded",
    afterLabel: "Recovered",
  },
  {
    title: "Recover soft focus",
    beforeImage: "/images/vintage-wedding-blur.png",
    afterImage: "/images/vintage-wedding-clear.jpg",
    beforeLabel: "Blurred",
    afterLabel: "Clear",
  },
]

const enhancementCards = [
  {
    eyebrow: "01",
    title: "Photo restoration",
    copy: "Lift age, dust, and damage while keeping original texture and character intact.",
    image: "/images/abstract-art-enhanced.png",
  },
  {
    eyebrow: "02",
    title: "Face refinement",
    copy: "Bring back definition in portraits without turning people into something artificial.",
    image: "/images/thai-family-restored.png",
  },
  {
    eyebrow: "03",
    title: "Document cleanup",
    copy: "Recover old scans and prints with cleaner edges, deeper contrast, and less noise.",
    image: "/images/wedding-set1-after.png",
  },
  {
    eyebrow: "04",
    title: "Print-ready finish",
    copy: "Prepare images for archives, exhibitions, and keepsakes with a polished final look.",
    image: "/images/real-estate-after.png",
  },
]

const useCaseCards = [
  {
    icon: Camera,
    title: "Family memories",
    copy: "Restore old prints and keep the original mood.",
  },
  {
    icon: Church,
    title: "Cultural archives",
    copy: "Preserve regional identity and ceremonial detail.",
  },
  {
    icon: Building2,
    title: "Commercial work",
    copy: "Improve presentation without losing realism.",
  },
  {
    icon: Globe,
    title: "Community stories",
    copy: "Create images that feel grounded and respectful.",
  },
  {
    icon: Shield,
    title: "Private workflow",
    copy: "Keep uploads controlled and your work protected.",
  },
  {
    icon: Sparkles,
    title: "Fast delivery",
    copy: "Move from upload to output with a simple flow.",
  },
]

const qualityPoints = [
  "Face preservation",
  "Natural tones",
  "Context-aware enhancement",
  "Less hallucination",
  "Sharper textures",
  "Archive-friendly output",
]

const galleryImages = [
  "/images/thai-family-restored.png",
  "/images/javanese-wedding-restored.png",
  "/images/wedding-after.png",
  "/images/vintage-wedding-clear.jpg",
  "/images/abstract-art-enhanced.png",
]

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  const handleTryEnhancer = async () => {
    trackCTAClick("hero", "Try Enhancer")
    await logout()
    router.push("/enhance")
  }

  const handleGetStarted = async () => {
    trackCTAClick("bottom_cta", "Get Started Free")
    await logout()
    router.push("/enhance")
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    trackExampleView(tab, tab)
  }

  return (
    <div className="min-h-screen bg-[#050403] text-[#efe3cf]">
      <Navbar />

      <main className="pb-16">
        <section className="mx-auto max-w-7xl px-4 pt-10 pb-14 lg:px-8 lg:pt-14 lg:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-[#9a8567]">clar1ty</p>
                <h1 className="max-w-xl text-4xl font-light leading-[0.96] tracking-[-0.04em] text-[#f4ecde] sm:text-5xl lg:text-[5.2rem]">
                  Restore Southeast Asia&apos;s{" "}
                  <span className="text-[#c9a057]">visual identity</span>
                </h1>
                <p className="max-w-md text-sm leading-6 text-[#baac95] sm:text-base">
                  Generic AI tools upscale pixels. clar1ty protects faces, fabric, ceremony, and context so the
                  result still feels like the original image.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={handleTryEnhancer}
                  className="rounded-none border border-[#8a6a36] bg-[#c79b4b] px-6 text-sm font-medium text-black hover:bg-[#d6af63]"
                >
                  Upload image
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    document.getElementById("upload-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })
                    trackCTAClick("hero", "View upload")
                  }}
                  className="rounded-none border-[#6f5d49] bg-transparent px-6 text-sm font-medium text-[#dcc9ae] hover:bg-[#17120f] hover:text-[#f4ecde]"
                >
                  View the flow
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[680px]">
              <div className="absolute -inset-6 bg-[radial-gradient(circle_at_50%_35%,rgba(201,160,87,0.12),transparent_62%)] blur-2xl" />
              <div className="relative overflow-hidden border border-[#5d4b37] bg-[#0b0907] shadow-[0_0_0_1px_rgba(201,160,87,0.08)]">
                <Image
                  src="/images/thai-family-restored.png"
                  alt="Restored Southeast Asian portrait"
                  width={1200}
                  height={1500}
                  priority
                  className="h-[560px] w-full object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,4,3,0.14),rgba(5,4,3,0.04)_28%,rgba(5,4,3,0.18)_100%)]" />
                <div className="absolute inset-0 border border-white/5" />
                <div className="absolute bottom-5 left-5 max-w-[220px] border border-white/10 bg-[#0b0907]/72 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#d5bc87]">Restoration preview</p>
                  <p className="mt-2 text-xs leading-5 text-[#eadfcd]">
                    Faithful detail recovery, tuned for heritage images and intimate portraits.
                  </p>
                </div>
                <div className="absolute right-4 top-4 border border-white/10 bg-[#11100f]/80 px-3 py-2 text-right backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a057]">Context-aware</p>
                  <p className="text-sm text-[#f4ecde]">No plastic skin, no blown highlights</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="upload-panel" className="bg-[#8a7b68] px-4 py-5 text-[#efe3cf] lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="border border-[#9f8f7c]/40 bg-[#a1917e] px-6 py-7">
              <p className="text-sm uppercase tracking-[0.34em] text-[#d3c2a8]">Upload image</p>
              <p className="mt-4 max-w-xs text-sm leading-6 text-[#efe5d2]">
                Start with a single photo or a whole archive. The workflow stays simple, visible, and easy to control.
              </p>
              <Button
                onClick={handleTryEnhancer}
                className="mt-6 rounded-none border border-[#6f5d49] bg-[#18120f] px-5 text-sm text-[#efe3cf] hover:bg-[#241a15]"
              >
                Open enhancer
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border border-[#9f8f7c]/40 bg-[#968574] rounded-none">
                <CardContent className="flex min-h-[220px] flex-col items-center justify-center px-6 py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center border border-[#e5d8c5]/40 bg-[#b8a695]/30">
                    <Upload className="h-7 w-7 text-[#f4ecde]" />
                  </div>
                  <p className="mt-5 text-lg uppercase tracking-[0.22em] text-[#f4ecde]">Drag and drop</p>
                  <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#efe5d2]">
                    Upload a photo and keep the process visible from start to finish.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-[#9f8f7c]/40 bg-[#8f7c68] rounded-none">
                <CardContent className="flex min-h-[220px] flex-col items-center justify-center px-6 py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center border border-[#e5d8c5]/40 bg-[#b8a695]/30">
                    <Sparkles className="h-7 w-7 text-[#f4ecde]" />
                  </div>
                  <p className="mt-5 text-lg uppercase tracking-[0.22em] text-[#f4ecde]">Pick a preset</p>
                  <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#efe5d2]">
                    Choose the right enhancement path and let the advanced controls follow automatically.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-[#050403] px-4 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm uppercase tracking-[0.34em] text-[#8d7a60]">Generic AI-tools upscale pixels</p>
              <h2 className="mt-4 text-3xl font-light tracking-[-0.03em] text-[#f4ecde] sm:text-4xl">
                Clar1ty preserves context.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#b9aa93]">
                Built for heritage, family, and professional work where realism matters more than novelty.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {comparisonCards.map((card) => (
                <div key={card.title} className="space-y-3 border border-[#2b241d] bg-[#0e0c0a] p-3">
                  <ImageComparisonHybrid
                    beforeImage={card.beforeImage}
                    afterImage={card.afterImage}
                    beforeLabel={card.beforeLabel}
                    afterLabel={card.afterLabel}
                    className="w-full"
                  />
                  <p className="px-1 text-xs uppercase tracking-[0.22em] text-[#d0ba96]">{card.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#050403] px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.34em] text-[#8d7a60]">Choose the right enhancement</p>
              <h2 className="mt-4 text-3xl font-light tracking-[-0.03em] text-[#f4ecde] sm:text-4xl">
                Match the tool to the image.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {enhancementCards.map((card) => (
                <Card key={card.title} className="overflow-hidden rounded-none border border-[#2b241d] bg-[#11100f]">
                  <CardContent className="grid gap-0 p-0 md:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-4 p-6 md:p-7">
                      <p className="text-xs uppercase tracking-[0.34em] text-[#a3885d]">{card.eyebrow}</p>
                      <h3 className="text-2xl font-light tracking-[-0.03em] text-[#f4ecde]">{card.title}</h3>
                      <p className="max-w-sm text-sm leading-6 text-[#b9aa93]">{card.copy}</p>
                    </div>
                    <div className="relative min-h-[220px] border-t border-[#2b241d] md:border-l md:border-t-0">
                      <Image src={card.image} alt={card.title} fill className="object-cover object-center" />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,4,3,0.02),rgba(5,4,3,0.2))]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#11100f] px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.34em] text-[#8d7a60]">Simple. Fast. Effective.</p>
              <h2 className="mt-4 text-3xl font-light tracking-[-0.03em] text-[#f4ecde] sm:text-4xl">
                A clean path from upload to output.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Upload,
                  title: "Upload the image",
                  copy: "Drop in a scan, portrait, or print and keep the flow straightforward.",
                },
                {
                  icon: Zap,
                  title: "Apply the preset",
                  copy: "Choose the intended outcome and let the controls sync to that choice.",
                },
                {
                  icon: CheckCircle2,
                  title: "Download the result",
                  copy: "Export a clean, context-aware final image that still feels authentic.",
                },
              ].map((item) => (
                <Card key={item.title} className="rounded-none border border-[#2b241d] bg-[#0d0b09]">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center border border-[#6f5d49] bg-[#151210] text-[#d7b777]">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium tracking-[0.02em] text-[#f4ecde]">{item.title}</h3>
                    <p className="text-sm leading-6 text-[#b9aa93]">{item.copy}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#8a7b68] px-4 py-16 text-[#efe3cf] lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.34em] text-[#d2c2a8]">Better quality, same identity</p>
              <h2 className="mt-4 text-3xl font-light tracking-[-0.03em] text-[#f4ecde] sm:text-4xl">
                Subtle changes that keep the person intact.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {qualityPoints.map((point, index) => (
                <div key={point} className="flex items-center gap-4 border border-[#9f8f7c]/40 bg-[#a29280] px-4 py-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#eadfcd]/30 bg-[#11100f]/20 text-[#f4ecde]">
                    <span className="text-sm font-medium">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-[#f4ecde]">{point}</p>
                    <p className="mt-1 text-xs leading-5 text-[#f0e6d6]">
                      Controlled enhancement that stays close to the source.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#050403] px-4 py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden border border-[#2b241d] bg-[#0e0c0a]">
                <Image src="/images/javanese-wedding-restored.png" alt="Restored portrait" width={900} height={1200} className="h-[300px] w-full object-cover object-center" />
              </div>
              <div className="overflow-hidden border border-[#2b241d] bg-[#0e0c0a]">
                <Image src="/images/thai-family-restored.png" alt="Restored family portrait" width={900} height={1200} className="h-[300px] w-full object-cover object-center" />
              </div>
            </div>

            <div className="max-w-xl space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-[#8d7a60]">Beautiful results built for ASEAN faces</p>
              <h2 className="text-3xl font-light tracking-[-0.03em] text-[#f4ecde] sm:text-4xl">
                Respect the face. Respect the image.
              </h2>
              <p className="text-sm leading-6 text-[#b9aa93]">
                The model should improve what is damaged, not erase identity. That means careful tonal recovery,
                restrained sharpening, and no over-processing.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#050403] px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.34em] text-[#8d7a60]">For people, projects, and purpose</p>
              <h2 className="mt-4 text-3xl font-light tracking-[-0.03em] text-[#f4ecde] sm:text-4xl">
                Built for more than a single use case.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {useCaseCards.map((card) => (
                <Card key={card.title} className="rounded-none border border-[#2b241d] bg-[#0f0d0b]">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center border border-[#6f5d49] bg-[#151210] text-[#d7b777]">
                      <card.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium tracking-[0.02em] text-[#f4ecde]">{card.title}</h3>
                    <p className="text-sm leading-6 text-[#b9aa93]">{card.copy}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#050403] px-4 py-8 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 border border-[#2b241d] bg-[#0e0c0a] px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="space-y-4">
                <ClarityLogo variant="white" className="h-12 w-auto sm:h-14" />
                <p className="max-w-md text-sm leading-6 text-[#b9aa93]">
                  Secure, private, and simple. The UI stays calm while the workflow stays direct.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-[#dcc9ae] sm:grid-cols-2">
                <div className="border border-[#2b241d] bg-[#11100f] px-4 py-3">Private uploads by default</div>
                <div className="border border-[#2b241d] bg-[#11100f] px-4 py-3">Keep settings easy to reach</div>
                <div className="border border-[#2b241d] bg-[#11100f] px-4 py-3">Preset-aware advanced controls</div>
                <div className="border border-[#2b241d] bg-[#11100f] px-4 py-3">Fast path to generation</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
              {galleryImages.map((image, index) => (
                <div key={image} className="overflow-hidden border border-[#2b241d] bg-[#0e0c0a]">
                  <Image
                    src={image}
                    alt={`Gallery preview ${index + 1}`}
                    width={700}
                    height={900}
                    className="h-[260px] w-full object-cover object-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#050403] px-4 py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.34em] text-[#8d7a60]">Secure, private, and simple</p>
              <ul className="space-y-3 text-sm text-[#ccbca2]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#d7b777]" />
                  <span>Process photos without exposing the workflow to clutter.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#d7b777]" />
                  <span>Keep advanced settings visible so the next step is never hidden.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#d7b777]" />
                  <span>Use presets that automatically set the correct supporting toggles.</span>
                </li>
              </ul>
            </div>

            <div className="border border-[#2b241d] bg-[#11100f] p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-[#a3885d]">Start enhancing your images today</p>
              <p className="mt-3 text-sm leading-6 text-[#b9aa93]">
                Move into the actual enhancer without losing the polished landing experience.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleGetStarted}
                  className="rounded-none border border-[#8a6a36] bg-[#c79b4b] px-6 text-sm font-medium text-black hover:bg-[#d6af63]"
                >
                  Upload your photo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-none border-[#6f5d49] bg-transparent px-6 text-sm font-medium text-[#dcc9ae] hover:bg-[#1a1612]"
                >
                  See examples
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#050403] px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden border border-[#2b241d] bg-[#0d0b09] px-4 py-6 sm:px-6 sm:py-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "/images/thai-family-restored.png",
                  "/images/javanese-wedding-restored.png",
                  "/images/wedding-after.png",
                  "/images/vintage-wedding-clear.jpg",
                ].map((image, index) => (
                  <div
                    key={image}
                    className={`overflow-hidden border border-[#3c3024] bg-[#151210] shadow-[0_18px_35px_rgba(0,0,0,0.35)] ${
                      index % 2 === 0 ? "-rotate-3" : "rotate-2"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Printed preview ${index + 1}`}
                      width={900}
                      height={1200}
                      className="h-[320px] w-full object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="explore" className="bg-[#050403] px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <Badge className="rounded-none border border-[#2b241d] bg-[#11100f] text-[#d7b777] hover:bg-[#11100f]">
                Product view
              </Badge>
              <h2 className="mt-4 text-3xl font-light tracking-[-0.03em] text-[#f4ecde] sm:text-4xl">
                Keep the real application underneath the landing.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#b9aa93]">
                The homepage now matches the darker editorial landing style while the login, generation, examples,
                and professional pathways remain available below.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8 w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 rounded-none border border-[#2b241d] bg-[#11100f]">
                <TabsTrigger value="overview" className="rounded-none text-xs uppercase tracking-[0.22em]">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="examples" className="rounded-none text-xs uppercase tracking-[0.22em]">
                  Examples
                </TabsTrigger>
                <TabsTrigger value="professional" className="rounded-none text-xs uppercase tracking-[0.22em]">
                  Professional
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-8 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {comparisonCards.map((card) => (
                    <Card key={card.title} className="rounded-none border border-[#2b241d] bg-[#11100f]">
                      <CardContent className="space-y-3 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-[#a3885d]">{card.title}</p>
                        <ImageComparisonHybrid
                          beforeImage={card.beforeImage}
                          afterImage={card.afterImage}
                          beforeLabel={card.beforeLabel}
                          afterLabel={card.afterLabel}
                          className="w-full"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="examples" className="mt-8 grid gap-4 md:grid-cols-2">
                {enhancementCards.slice(0, 2).map((card) => (
                  <Card key={card.title} className="rounded-none border border-[#2b241d] bg-[#11100f]">
                    <CardContent className="grid gap-0 p-0 md:grid-cols-[0.95fr_1.05fr]">
                      <div className="space-y-3 p-5">
                        <p className="text-xs uppercase tracking-[0.28em] text-[#a3885d]">{card.eyebrow}</p>
                        <h3 className="text-xl font-light text-[#f4ecde]">{card.title}</h3>
                        <p className="text-sm leading-6 text-[#b9aa93]">{card.copy}</p>
                      </div>
                      <div className="relative min-h-[180px] border-t border-[#2b241d] md:border-l md:border-t-0">
                        <Image src={card.image} alt={card.title} fill className="object-cover" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="professional" className="mt-8 grid gap-4 md:grid-cols-2">
                {useCaseCards.slice(0, 4).map((card) => (
                  <Card key={card.title} className="rounded-none border border-[#2b241d] bg-[#11100f]">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex h-10 w-10 items-center justify-center border border-[#6f5d49] bg-[#151210] text-[#d7b777]">
                        <card.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-medium text-[#f4ecde]">{card.title}</h3>
                      <p className="text-sm leading-6 text-[#b9aa93]">{card.copy}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleGetStarted}
                className="rounded-none border border-[#8a6a36] bg-[#c79b4b] px-7 text-sm font-medium text-black hover:bg-[#d6af63]"
              >
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
