"use client"

import Link from "next/link"
import { CREDIT_COSTS } from "@/lib/credits"
import { Button } from "@/components/ui/button"
import { Check, Wand2, Sparkles, Zap, Gift } from "lucide-react"

export function PricingSection() {
  return (
    <section id="pricing" className="relative bg-black px-6 py-32 text-[#efe8dc]">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d] mb-6">Transparent Pricing</p>
          <h2 className="text-6xl font-light tracking-tight text-[#d7a957] md:text-7xl mb-6">
            Simple Credits.
            <br />
            Serious Restoration.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-[#c9a882]">
            Enhance images in x2, x3, or x4 quality with transparent credit-based pricing.
          </p>
        </div>

        {/* Credit Tiers - 3 Column */}
        <div className="mb-20 grid gap-6 md:grid-cols-3">
          {/* x2 Enhance */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[#c9953d]/60 bg-[#1a1614]">
              <Wand2 className="h-10 w-10 text-[#d7a957]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9953d]">
              x2 Enhance
            </h3>
            <p className="text-5xl font-light text-[#d7a957]">{CREDIT_COSTS.ENHANCE_2X}</p>
            <p className="text-xs uppercase tracking-[0.15em] text-[#8f8678]">Credits</p>
            <p className="text-xs text-[#8f8678]">Clean digital enhancement</p>
          </div>

          {/* x3 Restore */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[#c9953d]/60 bg-[#1a1614]">
              <Sparkles className="h-10 w-10 text-[#d7a957]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9953d]">
              x3 Restore
            </h3>
            <p className="text-5xl font-light text-[#d7a957]">{CREDIT_COSTS.ENHANCE_3X}</p>
            <p className="text-xs uppercase tracking-[0.15em] text-[#8f8678]">Credits</p>
            <p className="text-xs text-[#8f8678]">High-detail restoration</p>
          </div>

          {/* x4 Pro Restore */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[#c9953d]/60 bg-[#1a1614]">
              <Zap className="h-10 w-10 text-[#d7a957]" strokeWidth={1.5} fill="#d7a957" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9953d]">
              x4 Pro Restore
            </h3>
            <p className="text-5xl font-light text-[#d7a957]">{CREDIT_COSTS.ENHANCE_4X}</p>
            <p className="text-xs uppercase tracking-[0.15em] text-[#8f8678]">Credits</p>
            <p className="text-xs text-[#8f8678]">Print and archive quality</p>
          </div>
        </div>

        {/* Free Trial Banner */}
        <div className="mb-16 flex items-center justify-center gap-2 text-[#d7a957]">
          <Gift className="h-5 w-5" strokeWidth={1.5} />
          <span className="text-sm font-light">Start with 10 free credits.</span>
        </div>

        {/* CTA Buttons */}
        <div className="mb-12 flex flex-col gap-4 sm:flex-row justify-center sm:gap-6">
          <Button asChild className="h-12 bg-[#c9953d] text-black hover:bg-[#d7a957] rounded-sm font-semibold uppercase tracking-[0.1em] text-sm px-12">
            <Link href="/enhance">Try Free</Link>
          </Button>
          <Button asChild className="h-12 border border-[#8b7d6a] bg-[#3d3a36] text-[#d8d0c4] hover:bg-[#4d4a46] rounded-sm font-semibold uppercase tracking-[0.1em] text-sm px-12">
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>

        {/* Trust Message */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#8f8678]">
          <Check className="h-4 w-4 text-[#c9953d]" strokeWidth={3} />
          <span>No hidden formulas. You always see the credit cost before processing.</span>
        </div>
      </div>
    </section>
  )
}
