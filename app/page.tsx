import Link from "next/link"
import Image from "next/image"
import type { ComponentType } from "react"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  Clock3,
  Download,
  ImageIcon,
  Lock,
  Sparkles,
  Shield,
  Upload,
  Wand2,
  Zap,
  Users,
  Church,
} from "lucide-react"
import { ImageComparisonHybrid } from "@/components/image-comparison-hybrid"

const comparisonPills = ["Before / After", "Drag to compare", "Touch enabled"]

const enhancementCards = [
  {
    title: "Archive Scan",
    description: "Restore faded scans and preserve fine detail without flattening texture.",
    image: "/images/wedding-before.png",
    accent: "/images/wedding-after.png",
    icon: Upload,
  },
  {
    title: "ASEAN Portrait Preserve",
    description: "Improve clarity while keeping skin tone, expression, and identity intact.",
    image: "/images/javanese-wedding-faded.png",
    accent: "/images/javanese-wedding-restored.png",
    icon: Camera,
  },
  {
    title: "Heritage Restore",
    description: "Bring back aged photographs with restrained tonal repair and color recovery.",
    image: "/images/vintage-wedding-blur.png",
    accent: "/images/vintage-wedding-clear.jpg",
    icon: Church,
  },
  {
    title: "Digital Art Upscale",
    description: "Prepare sharp, printable work for posters, covers, and digital publishing.",
    image: "/images/real-estate-before.png",
    accent: "/images/real-estate-after.png",
    icon: ImageIcon,
  },
]

const whoUsesCards = [
  {
    title: "Photographers",
    description: "Deliver polished portraits and archive-ready visuals with less manual cleanup.",
    icon: Camera,
  },
  {
    title: "Families",
    description: "Save treasured pictures and restore old albums for sharing and printing.",
    icon: Users,
  },
  {
    title: "Museums",
    description: "Repair historic materials with a workflow designed around preservation.",
    icon: Building2,
  },
  {
    title: "Publishers",
    description: "Enhance covers, editorial visuals, and heritage content for modern formats.",
    icon: ImageIcon,
  },
  {
    title: "Archives",
    description: "Digitize and improve old prints while keeping the original story visible.",
    icon: Lock,
  },
  {
    title: "Studios",
    description: "Use one consistent enhancement flow across client work and production needs.",
    icon: Sparkles,
  },
]

const featureList = [
  "Face-preserving enhancement",
  "Warm gold, low-noise finish",
  "Private workflow by design",
  "Print-friendly output",
  "Fast upload to result flow",
  "Touch-friendly comparison",
]

function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: "center" | "left"
}) {
  const alignment = align === "left" ? "items-start text-left" : "items-center text-center"

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow ? (
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#c8a46a]/70">{eyebrow}</p>
      ) : null}
      <h2 className="max-w-3xl text-2xl font-medium tracking-[0.08em] text-[#f3ecdf] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-[#b8a58b] md:text-[15px]">{description}</p>
      ) : null}
    </div>
  )
}

function MiniFeature({ title, description, icon: Icon }: { title: string; description: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="border border-white/10 bg-[#11100f] p-6">
      <Icon className="h-6 w-6 text-[#d3b16f]" />
      <h3 className="mt-5 text-sm font-medium tracking-[0.18em] text-[#f2eadc]">{title}</h3>
      <p className="mt-3 text-xs leading-6 text-[#a9977d]">{description}</p>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="bg-[#050403] text-[#f1e7d8]">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-[1250px] items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="group flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-[0.5em] text-[#d4b06c]">CL</span>
            <span className="text-xl font-medium tracking-[0.35em] text-[#d9c39d]">
              cl<span className="text-[#d4b06c]">ARITY</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 text-[10px] uppercase tracking-[0.35em] text-[#8f806b] md:flex">
            <a href="#upload" className="transition-colors hover:text-[#d6bb7b]">
              Upload
            </a>
            <a href="#presets" className="transition-colors hover:text-[#d6bb7b]">
              Presets
            </a>
            <a href="#secure" className="transition-colors hover:text-[#d6bb7b]">
              Secure
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1250px] grid-cols-1 gap-10 px-5 pb-14 pt-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:px-8 md:pt-16 lg:gap-16 lg:pt-20">
        <div className="max-w-xl space-y-7">
          <p className="text-[10px] uppercase tracking-[0.55em] text-[#a98b54]">Restore Southeast Asia&apos;s visual identity</p>
          <h1 className="max-w-lg text-[2.25rem] font-medium leading-[1.02] tracking-[0.02em] text-[#f3ecdf] md:text-[4.2rem]">
            Restore Southeast Asia&apos;s{" "}
            <span className="block text-[#cfab69]">visual identity</span>
          </h1>
          <p className="max-w-md text-sm leading-7 text-[#b6a287] md:text-[15px]">
            Generic AI tools sharpen pixels. Clar1ty preserves context, expression, and warmth while improving the clarity of portraits, archives, and heritage visuals.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/enhance"
              className="inline-flex items-center gap-2 border border-[#9b7c47] bg-[#b78c46] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.3em] text-black transition-colors hover:bg-[#c89a4f]"
            >
              Start enhancing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#upload"
              className="inline-flex items-center gap-2 border border-white/10 bg-transparent px-5 py-3 text-[11px] font-medium uppercase tracking-[0.3em] text-[#d6c2a0] transition-colors hover:border-[#cfab69]/40 hover:text-[#e5cd96]"
            >
              View layout
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-[radial-gradient(circle_at_50%_50%,rgba(200,164,106,0.1),transparent_55%)]" />
          <ImageComparisonHybrid
            beforeImage="/images/javanese-wedding-faded.png"
            afterImage="/images/javanese-wedding-restored.png"
            beforeLabel="Before"
            afterLabel="After"
            beforeAlt="Faded portrait before enhancement"
            afterAlt="Restored portrait after enhancement"
            className="relative"
          />
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.32em] text-[#9b8668]">
            {comparisonPills.map((pill) => (
              <span key={pill} className="border border-white/8 bg-black/40 px-3 py-2">
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="upload" className="border-y border-black/40 bg-[#8b7b68] text-[#221913]">
        <div className="mx-auto grid max-w-[1250px] grid-cols-1 md:grid-cols-[0.43fr_0.57fr]">
          <div className="border-b border-black/15 p-6 md:border-b-0 md:border-r md:p-8 lg:p-10">
            <p className="text-[10px] uppercase tracking-[0.5em] text-[#f2ebdd]/70">Upload image</p>
            <h2 className="mt-4 max-w-xs text-3xl font-medium tracking-[0.04em] text-[#f4ede0] md:text-[3rem]">
              Upload image
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#efe2cf]">
              Drop a photograph, scan, or portrait to start a private restoration workflow built for clarity and restraint.
            </p>

            <div className="mt-8 border border-black/10 bg-[#a2927f] p-4">
              <div className="border border-black/10 bg-[#d7cab8] p-5 text-center">
                <Upload className="mx-auto h-10 w-10 text-[#7a5b2c]" />
                <p className="mt-4 text-[11px] uppercase tracking-[0.35em] text-[#60462a]">Upload or drag file</p>
                <p className="mt-3 text-xs leading-6 text-[#6d5640]">
                  PNG, JPG, WebP. Built to keep your files and context private.
                </p>
              </div>
              <button className="mt-4 w-full border border-black/20 bg-[#3d3024] px-4 py-3 text-[11px] uppercase tracking-[0.32em] text-[#ead9c0]">
                Start upload
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            <div className="border-b border-black/15 p-6 md:border-b-0 md:border-r md:p-8 lg:p-10">
              <div className="border border-black/10 bg-[#d7cab8] p-6 text-center">
                <Sparkles className="mx-auto h-9 w-9 text-[#8a672f]" />
                <h3 className="mt-4 text-[11px] uppercase tracking-[0.38em] text-[#4d3824]">Low effort</h3>
                <p className="mt-3 text-xs leading-6 text-[#6c5946]">
                  Upload once, choose a preset, and preview a grounded enhancement path.
                </p>
              </div>
            </div>
            <div className="p-6 md:p-8 lg:p-10">
              <div className="border border-black/10 bg-[#c5b19a] p-6 text-center">
                <Shield className="mx-auto h-9 w-9 text-[#775527]" />
                <h3 className="mt-4 text-[11px] uppercase tracking-[0.38em] text-[#4d3824]">Private by design</h3>
                <p className="mt-3 text-xs leading-6 text-[#6c5946]">
                  The flow is built to feel quiet, secure, and straightforward from start to finish.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1250px] px-5 py-20 md:px-8">
        <SectionTitle
          title="Generic AI-tools upscale pixels. Clar1ty preserves context."
          description="The site is designed around proof, restraint, and a clear before / after story."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { before: "/images/wedding-before.png", after: "/images/wedding-after.png", label: "Family photo restoration" },
            { before: "/images/vintage-wedding-blur.png", after: "/images/vintage-wedding-clear.jpg", label: "Vintage clarity repair" },
            { before: "/images/real-estate-before.png", after: "/images/real-estate-after.png", label: "Content-ready upscaling" },
          ].map((item) => (
            <div key={item.label} className="space-y-3">
              <ImageComparisonHybrid beforeImage={item.before} afterImage={item.after} className="" />
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-[#9d8a6f]">
                <span>{item.label}</span>
                <span>Proof</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/8 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 text-sm text-[#b7a489]">
              <BadgeCheck className="h-4 w-4 text-[#c8a46a]" />
              Context-aware enhancement
            </div>
            <div className="flex items-center gap-3 text-sm text-[#b7a489]">
              <BadgeCheck className="h-4 w-4 text-[#c8a46a]" />
              Heritage-first workflow
            </div>
            <div className="flex items-center gap-3 text-sm text-[#b7a489]">
              <BadgeCheck className="h-4 w-4 text-[#c8a46a]" />
              Low-friction preview and export
            </div>
          </div>
        </div>
      </section>

      <section id="presets" className="border-y border-white/5 bg-[#080707]">
        <div className="mx-auto max-w-[1250px] px-5 py-20 md:px-8">
          <SectionTitle
            eyebrow="Choose the right enhancement"
            title="Four clear public presets"
            description="The landing surfaces the simplified public preset structure while keeping the experience easy to scan."
          />

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {enhancementCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="grid grid-cols-1 gap-0 overflow-hidden border border-white/8 bg-[#0e0c0b] lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-6 p-6 md:p-8">
                    <div className="flex h-12 w-12 items-center justify-center border border-[#d0b06d]/30 bg-black/40 text-[#d0b06d]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-medium tracking-[0.06em] text-[#f0e7d8]">{card.title}</h3>
                      <p className="max-w-sm text-sm leading-7 text-[#a9987d]">{card.description}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#9e8a68]">
                      <Clock3 className="h-4 w-4 text-[#d0b06d]" />
                      Fast. Simple. Effective.
                    </div>
                  </div>
                  <div className="border-t border-white/8 lg:border-l lg:border-t-0">
                    <ImageComparisonHybrid
                      beforeImage={card.image}
                      afterImage={card.accent}
                      beforeLabel="Before"
                      afterLabel="After"
                      beforeAlt={`${card.title} before image`}
                      afterAlt={`${card.title} after image`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1250px] px-5 py-20 md:px-8">
        <SectionTitle
          eyebrow="Simple. Fast. Effective."
          title="Simple. Fast. Effective."
          description="The page should explain the workflow with minimal friction and no decorative clutter."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <MiniFeature
            icon={Upload}
            title="Upload your photo"
            description="Drop a file and keep the interaction focused on one clear next step."
          />
          <MiniFeature
            icon={Wand2}
            title="Choose your preset"
            description="Let the preset define the enhancement path without exposing technical complexity."
          />
          <MiniFeature
            icon={Download}
            title="Download your result"
            description="Finish with a crisp output that is ready for sharing, saving, or printing."
          />
        </div>
      </section>

      <section className="bg-[#8b7b68] text-[#221913]">
        <div className="mx-auto max-w-[1250px] px-5 py-20 md:px-8">
          <SectionTitle
            eyebrow="Better quality, same identity"
            title="Better quality, same identity"
            description="The reference uses a warm, restrained beige block to signal care, preservation, and control."
            align="left"
          />

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {featureList.map((text, index) => {
              const icons = [Sparkles, Shield, Camera, Church, Zap, CheckCircle2]
              const Icon = icons[index]
              return (
                <div key={text} className="border border-black/10 bg-[#ad9d89] p-4 md:p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center border border-black/15 bg-[#efe0ca] text-[#8b632e]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium tracking-[0.16em] text-[#20160e]">{text}</h3>
                      <p className="mt-1 text-xs leading-5 text-[#46382c]">Consistency, clarity, and restrained premium finish.</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1250px] grid-cols-1 gap-8 px-5 py-20 md:grid-cols-[1.05fr_0.95fr] md:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          <ImageComparisonHybrid
            beforeImage="/images/thai-family-faded.png"
            afterImage="/images/thai-family-restored.png"
            className="h-full"
            beforeLabel="Before"
            afterLabel="After"
            beforeAlt="Thai family portrait before enhancement"
            afterAlt="Thai family portrait after enhancement"
          />
          <ImageComparisonHybrid
            beforeImage="/images/wedding-set1-before.png"
            afterImage="/images/wedding-set1-after.png"
            className="h-full"
            beforeLabel="Before"
            afterLabel="After"
            beforeAlt="Wedding portrait before enhancement"
            afterAlt="Wedding portrait after enhancement"
          />
        </div>
        <div className="flex flex-col justify-center space-y-5">
          <SectionTitle
            eyebrow="Beautiful results built for ASEAN faces"
            title="Identity stays recognizable. Detail comes forward."
            description="The proof section should feel calm and credible, with a short explanation rather than a long sales pitch."
            align="left"
          />
          <div className="space-y-4 border-l border-[#c8a46a]/30 pl-5">
            <p className="text-sm leading-7 text-[#b5a387]">
              Clar1ty is built for portraits, family history, and heritage images where context matters as much as sharpness.
            </p>
            <p className="text-sm leading-7 text-[#b5a387]">
              The goal is not to over-process. It is to restore the visual identity that made the image worth saving.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#070605]">
        <div className="mx-auto max-w-[1250px] px-5 py-20 md:px-8">
          <SectionTitle
            eyebrow="For people, projects, and purpose"
            title="For people, projects, and purpose"
            description="A six-card grid keeps the section compact while still showing the breadth of the use case."
          />

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {whoUsesCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="border border-white/10 bg-[#0e0c0b] p-5 shadow-[0_0_0_1px_rgba(208,176,109,0.08)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center border border-[#d0b06d]/30 text-[#d0b06d]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium tracking-[0.16em] text-[#efe7da]">{card.title}</h3>
                      <p className="text-xs leading-6 text-[#a69679]">{card.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1250px] px-5 py-20 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <div className="text-[11px] uppercase tracking-[0.52em] text-[#d0b06d]">clarity</div>
            <div className="text-5xl font-medium tracking-[0.18em] text-[#d6b15e] md:text-7xl">
              cl<span className="text-[#e9c56f]">AR</span>ITY
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <p className="text-[10px] uppercase tracking-[0.45em] text-[#a78a59]">Secure, private, and simple</p>
            <p className="text-sm leading-7 text-[#b8a58b]">
              The site uses a quiet visual language, a limited gold accent, and a direct path to enhancement.
            </p>
            <ul className="space-y-3 text-sm text-[#d7c6ae]">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 bg-[#c8a46a]" />
                Simple upload and preview flow
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 bg-[#c8a46a]" />
                Compare results without leaving the page
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 bg-[#c8a46a]" />
                Private by default, with no visual clutter
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            "/images/clarity-white.png",
            "/images/clarity-black.png",
            "/images/wedding-after.png",
            "/images/javanese-wedding-restored.png",
            "/images/vintage-wedding-clear.jpg",
          ].map((src, index) => (
            <div key={src} className={`relative h-40 overflow-hidden border border-white/8 bg-black ${index % 2 ? "rotate-1" : "-rotate-1"}`}>
              <Image src={src} alt="Portrait strip image" fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section id="secure" className="border-t border-white/5 bg-[#0b0908]">
        <div className="mx-auto max-w-[1250px] px-5 py-16 md:px-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border border-white/10 bg-[#120f0d] p-6 md:p-8">
              <h2 className="text-xl font-medium tracking-[0.12em] text-[#f0e8da]">Secure, private, and simple</h2>
              <div className="mt-6 space-y-4 text-sm text-[#b9a78a]">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-4 w-4 text-[#d0b06d]" />
                  <p>Safe handling of files and a focused experience with no noisy interface layers.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-4 w-4 text-[#d0b06d]" />
                  <p>Designed to keep the workflow private, direct, and easy to trust.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-[#d0b06d]" />
                  <p>Quick upload, quick preview, quick decision making.</p>
                </div>
              </div>
            </div>

            <div className="border border-[#c8a46a]/20 bg-[#171412] p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#c8a46a]">Start enhancing your images today</p>
              <p className="mt-4 text-sm leading-7 text-[#b9a78a]">
                The landing ends with a simple action card so the next step stays obvious.
              </p>
              <Link
                href="/enhance"
                className="mt-6 inline-flex items-center gap-2 border border-[#b98c43] bg-[#d0a04e] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.3em] text-black transition-colors hover:bg-[#dbaf61]"
              >
                Upload your file
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 text-xs tracking-[0.22em] text-[#8e7b64]">No redesign. Just restoration.</p>
            </div>
          </div>

          <div className="mt-10 overflow-hidden border border-white/8">
            <div className="grid grid-cols-2 gap-0 md:grid-cols-5">
              {[
                "/images/wedding-set1-after.png",
                "/images/javanese-wedding-restored.png",
                "/images/real-estate-after.png",
                "/images/thai-family-restored.png",
                "/images/vintage-wedding-clear.jpg",
              ].map((src, index) => (
                <div key={src} className={`relative h-44 md:h-64 ${index % 2 ? "-rotate-3" : "rotate-2"}`}>
                  <Image src={src} alt="Collage print" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
