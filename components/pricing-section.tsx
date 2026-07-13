"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { CREDIT_COSTS } from "@/lib/credits"
import { Button } from "@/components/ui/button"
import { Check, Wand2, Sparkles, Zap, Gift, ArrowRight } from "lucide-react"

export function PricingSection() {
  return (
    <section id="pricing" className="relative bg-black px-6 py-28 text-[#efe8dc]">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Simple credits.</p>
            <h2 className="mt-6 max-w-xl text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">Serious restoration.</h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#c9a882]">
              Choose the enhancement level that fits the image and see the exact cost before processing.
            </p>
            <div className="mt-10 space-y-3 text-sm text-[#bca98d]">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-[#d7a957]" strokeWidth={1.5} />
                <span>Start with 10 free credits. No credit card required.</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-[#c9953d]" strokeWidth={3} />
                <span>Secure and private processing</span>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="grid grid-cols-3 gap-3">
              <PricingModeCard icon={<Wand2 className="h-7 w-7 text-[#d7a957]" strokeWidth={1.5} />} title="x2 Enhance" credits={CREDIT_COSTS.ENHANCE_2X} copy="Best for clean digital work." />
              <PricingModeCard icon={<Sparkles className="h-7 w-7 text-[#d7a957]" strokeWidth={1.5} />} title="x3 Restore" credits={CREDIT_COSTS.ENHANCE_3X} copy="Balanced restoration." />
              <PricingModeCard icon={<Zap className="h-7 w-7 text-[#d7a957]" strokeWidth={1.5} fill="#d7a957" />} title="x4 Pro Restore" credits={CREDIT_COSTS.ENHANCE_4X} copy="Stronger enhancement." />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-4 text-sm leading-7 text-[#ddd2c2]">
          Two x2 passes usually stay closer to the original appearance and preserve a more natural look. A single x4 pass applies a stronger enhancement in one step and may introduce more AI-generated detail, while still remaining visually close to the original image.
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat label="All credits" value="6 / 8 / 10" />
          <MiniStat label="Free credits" value="10" />
          <MiniStat label="Max upload" value="30MB" />
          <MiniStat label="Private" value="Always" />
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <PlanCard title="Starter" price="$9 / month" description="For personal photo enhancement." benefits={["240 credits", "10 MB max upload"]} />
          <PlanCard title="Creator" price="$19 / month" description="For creators, small brands and regular restoration work." benefits={["600 credits", "15 MB max upload"]} badge="Most Popular" />
          <PlanCard title="Studio" price="$39 / month" description="For professional restoration and high-volume image work." benefits={["1,500 credits", "30 MB max upload"]} />
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild className="h-12 rounded-none bg-[#c9953d] px-10 text-sm font-semibold uppercase tracking-[0.1em] text-black hover:bg-[#d7a957]">
            <Link href="/sign-in">Try Free</Link>
          </Button>
          <Button asChild className="h-12 rounded-none border border-[#6f5d49] bg-[#17120f] px-10 text-sm font-semibold uppercase tracking-[0.1em] text-[#e9dcc7] hover:bg-[#221913]">
            <Link href="/#pricing" className="inline-flex items-center gap-2">
              View all pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function PricingModeCard({
  icon,
  title,
  credits,
  copy,
}: {
  icon: ReactNode
  title: string
  credits: number
  copy: string
}) {
  return (
    <article className="rounded-2xl bg-white/[0.03] p-4 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17120f]">{icon}</div>
      <h3 className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9953d]">{title}</h3>
      <p className="mt-3 text-4xl font-light text-[#f2d18a]">{credits}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8f8678]">Credits</p>
      <p className="mt-2 text-[11px] leading-5 text-[#bca98d]">{copy}</p>
    </article>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0f0e0c] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f8678]">{label}</p>
      <p className="mt-2 text-lg font-light text-[#f1e5d3]">{value}</p>
    </div>
  )
}

function PlanCard({
  title,
  price,
  description,
  benefits,
  badge,
}: {
  title: string
  price: string
  description: string
  benefits: string[]
  badge?: string
}) {
  return (
    <article className="relative rounded-2xl bg-white/[0.03] p-7">
      {badge ? <div className="absolute right-6 top-6 rounded-full bg-[#c9953d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black">{badge}</div> : null}
      <p className="text-xs uppercase tracking-[0.2em] text-[#c9953d]">Plan</p>
      <h3 className="mt-4 text-2xl font-light text-[#f1e5d3]">{title}</h3>
      <p className="mt-3 text-3xl font-light text-[#f2d18a]">{price}</p>
      <p className="mt-4 text-sm leading-7 text-[#c9b89a]">{description}</p>
      <ul className="mt-6 space-y-3 text-sm text-[#ddd2c2]">
        {benefits.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#c9953d]" strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
