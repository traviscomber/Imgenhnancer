"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { CREDIT_COSTS } from "@/lib/credits"
import { Button } from "@/components/ui/button"
import { Check, Wand2, Sparkles, Zap, Gift, ArrowRight } from "lucide-react"

export function PricingSection() {
  return (
    <section id="pricing" className="relative bg-black px-6 py-28 text-[#efe8dc]">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Simple credits. Full control.</p>
          <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">
            Transparent pricing for serious image enhancement.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#c9a882]">
            Use credits every time you enhance an image. You always see the exact cost before processing.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <PricingModeCard icon={<Wand2 className="h-9 w-9 text-[#d7a957]" strokeWidth={1.5} />} title="x2 Enhance" credits={CREDIT_COSTS.ENHANCE_2X} copy="Light enhancement" />
          <PricingModeCard icon={<Sparkles className="h-9 w-9 text-[#d7a957]" strokeWidth={1.5} />} title="x3 Restore" credits={CREDIT_COSTS.ENHANCE_3X} copy="Balanced restoration" />
          <PricingModeCard icon={<Zap className="h-9 w-9 text-[#d7a957]" strokeWidth={1.5} fill="#d7a957" />} title="x4 Pro Restore" credits={CREDIT_COSTS.ENHANCE_4X} copy="Stronger AI enhancement" />
        </div>

        <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-5 text-sm leading-7 text-[#ddd2c2]">
          Two x2 passes usually stay closer to the original appearance and preserve a more natural look. A single x4 pass applies a stronger enhancement in one step and may introduce more AI-generated detail, while still remaining visually close to the original image.
        </div>

        <div className="mt-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#d7a957]">
            <Gift className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-sm font-light">Start with 10 free credits. No credit card required.</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-[#bca98d] md:flex">
            Secure and private processing
            <Check className="h-4 w-4 text-[#c9953d]" strokeWidth={3} />
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <PlanCard title="Starter" price="$9 / month" description="For personal photo enhancement." benefits={["240 credits", "10 MB max upload"]} />
          <PlanCard title="Creator" price="$19 / month" description="For creators, small brands and regular restoration work." benefits={["600 credits", "15 MB max upload"]} badge="Most Popular" />
          <PlanCard title="Studio" price="$39 / month" description="For professional restoration and high-volume image work." benefits={["1,500 credits", "30 MB max upload"]} />
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild className="h-12 rounded-none bg-[#c9953d] px-10 text-sm font-semibold uppercase tracking-[0.1em] text-black hover:bg-[#d7a957]">
            <Link href="/sign-in">Try Free</Link>
          </Button>
          <Button asChild className="h-12 rounded-none border border-[#6f5d49] bg-[#17120f] px-10 text-sm font-semibold uppercase tracking-[0.1em] text-[#e9dcc7] hover:bg-[#221913]">
            <Link href="/pricing" className="inline-flex items-center gap-2">
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
    <article className="rounded-2xl bg-white/[0.03] p-8 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#17120f]">{icon}</div>
      <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9953d]">{title}</h3>
      <p className="mt-5 text-5xl font-light text-[#f2d18a]">{credits}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8f8678]">Credits</p>
      <p className="mt-4 text-xs text-[#bca98d]">{copy}</p>
    </article>
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
    <article className="relative rounded-2xl bg-white/[0.03] p-8">
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
