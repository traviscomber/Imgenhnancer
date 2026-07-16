import Link from "next/link"
import { ArrowRight, Shield, Sparkles, Users, Wand2 } from "lucide-react"

const pillars = [
  {
    title: "Preserve identity",
    copy: "Clar1ty is tuned to keep the visual cues that make portraits, heritage objects and cultural scenes recognizable.",
    Icon: Shield,
  },
  {
    title: "Improve detail",
    copy: "The product aims for clarity, usable resolution and better print readiness without flattening the original image.",
    Icon: Sparkles,
  },
  {
    title: "Serve real workflows",
    copy: "The experience is built for individuals, creators, studios, archives and institutions that need practical enhancement.",
    Icon: Users,
  },
]

export default function AboutPage() {
  return (
    <main className="bg-black text-[#efe8dc]">
      <section className="relative overflow-hidden px-6 pb-20 pt-16 lg:px-16 lg:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(201,149,61,0.12),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(124,96,61,0.12),transparent_24%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">About clar1ty</p>
          <h1 className="mt-6 max-w-4xl text-4xl font-light leading-tight text-[#f1e5d3] md:text-6xl">
            Image enhancement that respects the source.
          </h1>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-[#d4c7b6] md:text-base">
            clar1ty is a preservation-first image enhancement project focused on Southeast Asian portraits, archives,
            creative work and cultural detail. The goal is simple: make images cleaner and sharper without losing the
            character, identity and context that matter.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/enhance"
              className="inline-flex items-center gap-2 rounded-none bg-[#c9953d] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#d7a957]"
            >
              Upscale
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-none border border-[#6f5d49] bg-[#17120f] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#efe8dc] transition hover:bg-[#221913]"
            >
              Pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {pillars.map(({ title, copy, Icon }) => (
            <article key={title} className="rounded-3xl border border-white/8 bg-white/[0.03] p-7">
              <Icon className="h-6 w-6 text-[#c9953d]" />
              <h2 className="mt-5 text-2xl font-light text-[#f1e5d3]">{title}</h2>
              <p className="mt-4 text-sm leading-7 text-[#d4c7b6]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-white/8 bg-white/[0.03] p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">What it is</p>
            <h2 className="mt-5 text-3xl font-light text-[#f1e5d3]">A focused tool, not a generic upscaler.</h2>
          </div>
          <div className="grid gap-4 text-sm leading-7 text-[#d4c7b6]">
            <p>
              The project started from the need to enhance portraits and heritage imagery without the plastic look or
              identity drift that often comes with generic AI tools.
            </p>
            <p>
              clar1ty is built around careful preset selection, privacy-aware handling and outputs that feel usable for
              production, archives, prints and social publishing.
            </p>
            <p>
              The product and branding lean into a warm, editorial aesthetic because the platform is intended for
              meaningful images, not disposable content.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Who uses clar1ty</p>
            <h2 className="mt-4 text-3xl font-light text-[#f1e5d3]">Built for specific workflows.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCase
              title="Photographers"
              copy="Client images, softer portraits, cleaner delivery. Professional enhancement that respects the original."
            />
            <UseCase
              title="Designers"
              copy="References, scanned visuals, campaign materials. Enhance sources while keeping authentic character."
            />
            <UseCase
              title="Brands"
              copy="Product imagery, founder portraits, editorial assets. Improve visual assets for modern marketing."
            />
            <UseCase
              title="Families"
              copy="Old memories with care. When face, clothing and mood matter, not just sharpness."
            />
            <UseCase
              title="Archives & Historians"
              copy="Preservation plus context. Clarity and authenticity for research and exhibition."
            />
            <UseCase
              title="Print Shops & Studios"
              copy="Clearer print files, client delivery, restoration workflows. Production-ready enhancement."
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/8 bg-black/40 p-8 lg:p-10">
          <div className="flex items-center gap-3 text-[#c9953d]">
            <Wand2 className="h-5 w-5" />
            <span className="text-xs uppercase tracking-[0.35em]">Our standard</span>
          </div>
          <p className="mt-6 max-w-4xl text-2xl font-light leading-relaxed text-[#f1e5d3] md:text-4xl">
            The image should still feel like itself.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d4c7b6]">
            The project exists to help images stay legible, culturally specific and visually strong as they move from old source material to modern use. Enhancement means clarity and detail, not transformation.
          </p>
        </div>
      </section>
    </main>
  )
}

function UseCase({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
      <h3 className="font-semibold text-[#f1e5d3]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">{copy}</p>
    </div>
  )
}
