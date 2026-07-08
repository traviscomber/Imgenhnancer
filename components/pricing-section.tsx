"use client"

import Link from "next/link"
import { SUBSCRIPTION_TIERS, calculateEnhancementsPerMonth, CREDIT_COSTS } from "@/lib/credits"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"

export function PricingSection() {
  const topTiers = SUBSCRIPTION_TIERS.slice(0, 3)

  return (
    <section id="pricing" className="relative min-h-screen bg-black px-6 py-24 text-[#efe8dc]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Flexible Pricing</p>
          <h2 className="mt-6 text-5xl font-light tracking-[0.04em] text-white md:text-6xl">Simple, Transparent Pricing</h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#d8d0c4]">
            Choose a monthly plan for consistent access or pay-as-you-go for flexibility. No hidden fees, credits consumed only when processing images.
          </p>
        </div>

        {/* Pricing Tiers - Top 3 Featured */}
        <div className="mb-20 grid gap-6 lg:grid-cols-3">
          {topTiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border bg-[#080706] p-8 shadow-[0_0_32px_rgba(214,188,117,0.12)] transition-all ${
                tier.id === "creator" ? "border-[#c9953d] ring-2 ring-[#c9953d]/50" : "border-white/10"
              } hover:border-[#d7a957]`}
            >
              {tier.id === "creator" && (
                <span className="absolute right-5 top-5 rounded-full bg-[#c9953d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
              <p className="mt-2 text-xs text-[#b9ad9a]">{tier.description}</p>

              <div className="mt-6">
                {tier.price === 0 ? (
                  <span className="text-4xl font-light text-white">Free</span>
                ) : (
                  <>
                    <span className="text-4xl font-light text-white">${tier.price}</span>
                    <span className="ml-2 text-sm text-[#b9ad9a]">/month</span>
                  </>
                )}
              </div>

              <div className="mt-6 space-y-2 border-t border-white/10 pt-6">
                <div>
                  <p className="text-2xl font-light text-[#d7a957]">{tier.monthlyCredits.toLocaleString()}</p>
                  <p className="text-xs text-[#8f8678]">credits per month</p>
                </div>
                <p className="text-sm text-[#d8d0c4]">
                  ≈ {calculateEnhancementsPerMonth(tier.monthlyCredits)} 4x enhancements
                </p>
                <p className="text-xs text-[#8f8678]">Up to {tier.maxFileSize}MB file size</p>
              </div>

              <div className="my-6 flex-1 border-t border-white/10"></div>

              <ul className="mb-6 space-y-2 text-xs text-[#d8d0c4]">
                {tier.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c9953d]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className={`w-full rounded-none h-10 ${
                tier.id === "creator"
                  ? "bg-[#c9953d] text-black hover:bg-[#e0b365]"
                  : "border border-[#d7a957] bg-transparent text-[#d7a957] hover:bg-[#d7a957]/10"
              }`}>
                <Link href="/enhance">Get Started</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Enhancement Costs */}
        <div className="mb-20 rounded-2xl border border-white/10 bg-white/[0.04] p-8">
          <h3 className="text-xl font-light text-white mb-8">How Credits Are Used</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-5xl font-light text-[#c9953d]">{CREDIT_COSTS.ENHANCE_2X}</div>
              <p className="mt-2 text-sm font-medium text-white">2x Upscale</p>
              <p className="mt-1 text-xs text-[#b9ad9a]">Standard enhancement quality</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-light text-[#c9953d]">{CREDIT_COSTS.ENHANCE_3X}</div>
              <p className="mt-2 text-sm font-medium text-white">3x Upscale</p>
              <p className="mt-1 text-xs text-[#b9ad9a]">Higher quality and detail</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-light text-[#c9953d]">{CREDIT_COSTS.ENHANCE_4X}</div>
              <p className="mt-2 text-sm font-medium text-white">4x Upscale</p>
              <p className="mt-1 text-xs text-[#b9ad9a]">Maximum quality and resolution</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-[#d8d0c4] mb-4">
            Want to see all plans and pay-as-you-go options?
          </p>
          <Button asChild className="inline-flex items-center gap-2 border border-[#d7a957] bg-transparent text-[#d7a957] hover:bg-[#d7a957]/10 rounded-none h-11 px-8">
            <Link href="/pricing">
              View All Plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
