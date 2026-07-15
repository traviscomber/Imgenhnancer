"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { CREDIT_COSTS } from "@/lib/credits"
import { Button } from "@/components/ui/button"
import { Check, Wand2, Sparkles, Zap, ArrowRight } from "lucide-react"

export function PricingSection() {
  return (
    <section id="pricing" className="relative bg-black px-6 py-28 text-[#efe8dc]">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="max-w-xl">
            <h2 className="max-w-xl text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">
              Simple credits.
              <br />
              <span className="text-[#d7a957]">Serious restoration.</span>
            </h2>
            <p className="mt-6 max-w-xs text-sm font-semibold leading-snug text-[#f1e5d3]">
              Register now to get free credits!
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild className="h-12 rounded-none bg-[#c9953d] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-black hover:bg-[#d7a957]">
                <Link href="/sign-in">Try Free</Link>
              </Button>
              <Button asChild className="h-12 rounded-none border border-[#6f5d49] bg-[#17120f] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#f0e2cf] hover:bg-[#221913]">
                <Link href="/pricing" className="inline-flex items-center gap-2">
                  View pricing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.03] px-6 py-5 text-sm leading-7 text-[#ddd2c2]">
              Two x2 passes usually stay closer to the original appearance and preserve a more natural look. A single x4 pass applies a stronger enhancement in one step and may introduce more AI-generated detail, while still remaining visually close to the original image.
            </div>
          </div>

          <div className="min-w-0 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <PricingModeCard icon={<Wand2 className="h-7 w-7 text-[#d7a957]" strokeWidth={1.5} />} title="x2 Enhance" credits={CREDIT_COSTS.ENHANCE_2X} copy="Light enhancement" />
              <PricingModeCard icon={<Sparkles className="h-7 w-7 text-[#d7a957]" strokeWidth={1.5} />} title="x3 Restore" credits={CREDIT_COSTS.ENHANCE_3X} copy="Balanced restoration" />
              <PricingModeCard icon={<Zap className="h-7 w-7 text-[#d7a957]" strokeWidth={1.5} fill="#d7a957" />} title="x4 Pro Restore" credits={CREDIT_COSTS.ENHANCE_4X} copy="Stronger AI enhancement" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <PlanCard title="Starter" price="$9 / month" description="For personal photo enhancement." benefits={["240 credits", "10 MB max upload"]} />
              <PlanCard title="Creator" price="$19 / month" description="For creators, small brands and regular restoration work." benefits={["600 credits", "15 MB max upload"]} badge="Most Popular" />
              <PlanCard title="Studio" price="$39 / month" description="For professional restoration and high-volume image work." benefits={["1,500 credits", "30 MB max upload"]} />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat label="All credits" value="6 / 8 / 10" />
              <MiniStat label="Free credits" value="10" />
              <MiniStat label="Max upload" value="30MB" />
              <MiniStat label="Private" value="Always" />
            </div>
          </div>
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
    <article className={`relative rounded-2xl p-5 ${badge ? "border border-[#c9953d]/50 bg-[#1a160f]" : "bg-white/[0.03]"}`}>
      {badge ? (
        <div className="mb-3 inline-block rounded-sm bg-[#c9953d] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-black">
          {badge}
        </div>
      ) : null}
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5">
        {title === "Starter" && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#c9953d" strokeWidth="1.5" aria-hidden="true">
            <circle cx="7" cy="4" r="2.5" /><path d="M2 13c0-2.76 2.24-5 5-5s5 2.24 5 5" />
          </svg>
        )}
        {title === "Creator" && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#c9953d" strokeWidth="1.5" aria-hidden="true">
            <path d="M7 1l1.8 3.6L13 5.5l-3 2.9.7 4.1L7 10.4l-3.7 2.1.7-4.1L1 5.5l4.2-.9z" />
          </svg>
        )}
        {title === "Studio" && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#c9953d" strokeWidth="1.5" aria-hidden="true">
            <rect x="1" y="1" width="12" height="12" rx="1.5" /><path d="M4 4h6M4 7h6M4 10h4" />
          </svg>
        )}
      </div>
      <h3 className="mt-3 text-lg font-light text-[#f1e5d3]">{title}</h3>
      <p className="mt-2 text-2xl font-light text-[#f2d18a]">{price}</p>
      <div className="my-3 h-px bg-white/8" />
      <ul className="space-y-2 text-[11px] text-[#d4c7b6]">
        {benefits.map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#c9953d]" strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}
