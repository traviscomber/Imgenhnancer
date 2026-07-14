import Link from "next/link"
import { ArrowRight, Check, Gift, Sparkles, Zap, type LucideIcon } from "lucide-react"
import { PricingSection } from "@/components/pricing-section"

const pricingNotes = [
  "Use x2 for cleaner digital work when you want a conservative result.",
  "Use x3 for balanced restoration with more visible repair and detail recovery.",
  "Use x4 for stronger restoration when the source image is heavily degraded.",
  "Free credits are included so new users can test the workflow before paying.",
]

export default function PricingPage() {
  return (
    <main className="bg-black text-[#efe8dc]">
      <section className="relative overflow-hidden px-6 pb-16 pt-16 lg:px-16 lg:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,149,61,0.12),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(124,96,61,0.12),transparent_26%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Pricing</p>
          <h1 className="mt-6 max-w-4xl text-4xl font-light leading-tight text-[#f1e5d3] md:text-6xl">
            Credits and plans designed for careful enhancement.
          </h1>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-[#d4c7b6] md:text-base">
            clar1ty is built for image restoration, preservation and high-detail upscaling. Pricing reflects the
            amount of processing required so you can match the preset to the image instead of paying for a one-size-fits-all
            bundle.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <NoteCard Icon={Gift} title="Free trial" copy="Start with 10 credits and test the workflow without a credit card." />
            <NoteCard Icon={Sparkles} title="x2 Enhance" copy="Best for clean digital images and lighter touch-ups." />
            <NoteCard Icon={Check} title="x3 Restore" copy="Balanced option for portraits, archives and mixed condition images." />
            <NoteCard Icon={Zap} title="x4 Pro Restore" copy="Stronger treatment for damaged or low-quality source images." />
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/enhance"
              className="inline-flex items-center gap-2 rounded-none bg-[#c9953d] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#d7a957]"
            >
              Upscale
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-none border border-[#6f5d49] bg-[#17120f] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#efe8dc] transition hover:bg-[#221913]"
            >
              Talk to support
            </Link>
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] border border-white/8 bg-white/[0.03] p-8 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">How to choose</p>
            <h2 className="mt-5 text-3xl font-light text-[#f1e5d3]">Match the plan to the source image.</h2>
            <p className="mt-5 text-sm leading-7 text-[#d4c7b6]">
              The cleaner the source, the lighter the preset you should use. The more damaged or compressed the image, the more
              likely you will want the stronger restore modes.
            </p>
          </div>
          <div className="grid gap-4">
            {pricingNotes.map((note) => (
              <div key={note} className="rounded-2xl border border-white/8 bg-black/30 px-5 py-4 text-sm leading-7 text-[#ddd2c2]">
                {note}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function NoteCard({
  Icon,
  title,
  copy,
}: {
  Icon: LucideIcon
  title: string
  copy: string
}) {
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <Icon className="h-5 w-5 text-[#c9953d]" />
      <h2 className="mt-4 text-lg font-semibold text-[#f1e5d3]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">{copy}</p>
    </article>
  )
}
