"use client"

import Link from "next/link"
import { ArrowRight, Check, Gift, Sparkles, Zap, ChevronDown, type LucideIcon } from "lucide-react"
import { useState } from "react"
import { PricingSection } from "@/components/pricing-section"
import { PAYG_CREDIT_PACKS, SUBSCRIPTION_TIERS } from "@/lib/credits"

const faq_items = [
  { q: "What is a credit?", a: "A credit is a unit of processing power. Each enhancement mode costs a set number of credits (x2=6, x3=8, x4=10)." },
  { q: "How many credits does each mode use?", a: "x2 Enhance uses 6 credits, x3 Restore uses 8 credits, and x4 Pro Restore uses 10 credits." },
  { q: "Why choose x2 instead of x4?", a: "x2 stays closer to the original appearance and preserves a more natural look. x4 applies stronger enhancement in one step, which may introduce more AI-generated detail." },
  { q: "Can I use x4 on any plan?", a: "Yes, all plans can use any enhancement mode. Credit availability depends on your plan." },
  { q: "What is the upload limit?", a: "Free: 2MB, Starter: 10MB, Creator: 15MB, Studio: 30MB, Archive: 50MB+ (available on request)." },
  { q: "Do monthly credits roll over?", a: "No, monthly credits reset on your billing date and unused credits do not carry over." },
  { q: "Do PAYG credits expire?", a: "Yes, pay-as-you-go credits are valid for 12 months from purchase." },
  { q: "What happens when I run out of credits?", a: "You can buy additional PAYG credits, upgrade your plan, or wait until your next monthly reset." },
  { q: "Do you store my images?", a: "No. Files are processed temporarily and automatically deleted. Job metadata (filename, preset, date) is stored for history only." },
  { q: "Is clar1ty only for old photos?", a: "No, clar1ty works with any image: portraits, product photos, digital art, archives, and more." },
  { q: "Which plan should I choose?", a: "Free for testing, Starter for personal use, Creator for small business, Studio for professional work, Archive for institutions." },
]

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <main className="bg-black text-[#efe8dc]">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pb-16 pt-16 lg:px-16 lg:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,149,61,0.12),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(124,96,61,0.12),transparent_26%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Pricing</p>
          <h1 className="mt-6 max-w-4xl text-4xl font-light leading-tight text-[#f1e5d3] md:text-6xl">
            Simple plans for serious restoration.
          </h1>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-[#d4c7b6] md:text-base">
            Start free, scale when you need more credits, larger files, batch processing and professional usage rights.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/enhance"
              className="inline-flex items-center gap-2 rounded-none bg-[#c9953d] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#d7a957]"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-none border border-[#6f5d49] bg-[#17120f] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#efe8dc] transition hover:bg-[#221913]"
            >
              Buy credits
            </Link>
          </div>
        </div>
      </section>

      {/* How Credits Work */}
      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">How credits work</p>
            <h2 className="mt-4 text-3xl font-light text-[#f1e5d3]">Choose the right mode for your image.</h2>
            
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <CreditModeCard icon={<Sparkles className="h-6 w-6" />} title="x2 Enhance" credits={6} copy="Light enhancement for clean digital images." />
              <CreditModeCard icon={<Zap className="h-6 w-6" />} title="x3 Restore" credits={8} copy="Balanced restoration for portraits and archives." />
              <CreditModeCard icon={<Gift className="h-6 w-6" />} title="x4 Pro Restore" credits={10} copy="Stronger treatment for damaged images." />
            </div>

            <div className="mt-6 rounded-xl border border-white/8 bg-black/30 px-5 py-4 text-sm leading-7 text-[#ddd2c2]">
              Two x2 passes usually stay closer to the original appearance and preserve a more natural look. A single x4 pass applies a stronger enhancement in one step and may introduce more AI-generated detail, while still remaining visually close to the original image.
            </div>
          </div>
        </div>
      </section>

      {/* Main Pricing Component */}
      <PricingSection />

      {/* PAYG Packs Section */}
      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Pay as you go</p>
            <h2 className="mt-4 text-3xl font-light text-[#f1e5d3]">Need credits without a subscription?</h2>
            <p className="mt-3 max-w-2xl mx-auto text-sm leading-7 text-[#d4c7b6]">Buy credits once and use them when you need extra image enhancement. Valid for 12 months.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {PAYG_CREDIT_PACKS.map((pack) => (
              <div key={pack.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center">
                <p className="text-3xl font-light text-[#f2d18a]">${pack.price}</p>
                <p className="mt-2 text-sm text-[#c9953d]">{pack.credits} credits</p>
                <p className="mt-3 text-xs text-[#8f8678]">${pack.pricePerCredit.toFixed(3)} per credit</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-white/8 bg-black/30 px-5 py-4 text-sm leading-7 text-[#ddd2c2] text-center">
            PAYG credits valid 12 months. No subscription required. Can be bought by free or paid users. Monthly credits used first.
          </div>
        </div>
      </section>

      {/* When Credits Run Out */}
      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-[#f1e5d3]">When credits run out</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8">
              <h3 className="text-lg font-semibold text-[#f1e5d3]">Buy extra credits</h3>
              <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">Purchase PAYG credits instantly and continue enhancing.</p>
              <Link href="#payg" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#c9953d] hover:text-[#d7a957]">
                View packs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8">
              <h3 className="text-lg font-semibold text-[#f1e5d3]">Upgrade your plan</h3>
              <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">Move to a higher tier with more monthly credits and larger uploads.</p>
              <Link href="/pricing#plans" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#c9953d] hover:text-[#d7a957]">
                See plans <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8">
              <h3 className="text-lg font-semibold text-[#f1e5d3]">Wait until next reset</h3>
              <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">Your account remains active. Monthly credits reset on your billing date.</p>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-[#8f8678]">Your account remains active.</div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Questions</p>
            <h2 className="mt-4 text-3xl font-light text-[#f1e5d3]">Frequently asked</h2>
          </div>

          <div className="space-y-3">
            {faq_items.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-white/8 bg-white/[0.03]">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition"
                >
                  <p className="font-medium text-[#f1e5d3]">{item.q}</p>
                  <ChevronDown
                    className={`h-5 w-5 text-[#c9953d] transition ${expandedFaq === idx ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 pb-4 text-sm leading-7 text-[#d4c7b6] border-t border-white/8">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-light text-[#f1e5d3]">Restore more detail. Keep full control.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/enhance"
              className="inline-flex items-center gap-2 rounded-none bg-[#c9953d] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[#d7a957]"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-none border border-[#6f5d49] bg-[#17120f] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#efe8dc] transition hover:bg-[#221913]"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function CreditModeCard({
  icon,
  title,
  credits,
  copy,
}: {
  icon: React.ReactNode
  title: string
  credits: number
  copy: string
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <div className="text-[#c9953d]">{icon}</div>
      <h3 className="mt-3 font-semibold text-[#f1e5d3]">{title}</h3>
      <p className="mt-2 text-2xl font-light text-[#f2d18a]">{credits}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8f8678]">Credits</p>
      <p className="mt-3 text-sm leading-6 text-[#d4c7b6]">{copy}</p>
    </div>
  )
}
