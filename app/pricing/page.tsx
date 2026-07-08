import Link from "next/link"
import { CREDIT_COSTS, SUBSCRIPTION_TIERS, PAYG_CREDIT_PACKS } from "@/lib/credits"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"
import { Check, ChevronDown, ShoppingCart, TrendingUp, Clock } from "lucide-react"

export default function PricingPage() {
  return (
    <main className="relative min-h-screen px-6 py-24 text-[#efe8dc]" style={{
      backgroundImage: 'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/981623f7-fb48-4682-9e94-2a634b2d76fc.jfif-T6WrpT4U6kCvX5PSOrzbNuXFY2es8d.jpeg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/70"></div>
      
      <div className="relative mx-auto max-w-7xl z-10">
        {/* Navigation */}
        <nav className="mb-20 flex items-center justify-between">
          <Link href="/" aria-label="clar1ty home">
            <ClarityLogo className="h-10 w-auto drop-shadow-[0_0_10px_rgba(211,155,62,0.45)]" width={145} height={44} />
          </Link>
          <Link href="/enhance" className="text-sm text-[#d7a957] hover:text-white">
            Login
          </Link>
        </nav>

        {/* Header */}
        <section className="mb-20 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d] mb-4">Simple Pricing for Serious Image Restoration</p>
          <h1 className="text-5xl font-light tracking-tight text-[#d7a957] md:text-6xl mb-6">
            Simple pricing for
            <br />
            serious image restoration.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-[#c9a882]">
            Use credits to enhance images in x2, x3, or x4 quality.
            <br />
            Higher upscale modes create more pixels and use more credits.
            <br />
            You always see the exact cost before processing.
          </p>
        </section>

        {/* CTA Buttons */}
        <div className="mb-20 flex flex-col gap-4 sm:flex-row justify-center">
          <Button asChild className="h-12 bg-[#c9953d] text-black hover:bg-[#d7a957] rounded-sm font-semibold uppercase tracking-[0.1em] text-sm px-12">
            <Link href="/enhance">Start Free</Link>
          </Button>
          <Button asChild className="h-12 border border-[#8b7d6a] bg-[#3d3a36] text-[#d8d0c4] hover:bg-[#4d4a46] rounded-sm font-semibold uppercase tracking-[0.1em] text-sm px-12">
            <Link href="#payg">Buy Credits</Link>
          </Button>
        </div>

        {/* How Credits Work */}
        <section className="mb-20">
          <h2 className="text-center text-3xl font-light text-[#d7a957] mb-4">How Credits Work</h2>
          <h3 className="text-center text-2xl font-light text-white mb-12">Choose the right level of restoration.</h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#c9953d]/50 bg-[#1a1614]">
                <span className="text-2xl font-light text-[#d7a957]">2x</span>
              </div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9953d]">x2 Enhance</h4>
              <p className="text-3xl font-light text-[#d7a957]">{CREDIT_COSTS.ENHANCE_2X}</p>
              <p className="text-xs uppercase tracking-[0.1em] text-[#8f8678]">Credits</p>
              <p className="text-xs text-center text-[#8f8678]">Clean digital enhancement</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#c9953d]/50 bg-[#1a1614]">
                <span className="text-2xl font-light text-[#d7a957]">3x</span>
              </div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9953d]">x3 Restore</h4>
              <p className="text-3xl font-light text-[#d7a957]">{CREDIT_COSTS.ENHANCE_3X}</p>
              <p className="text-xs uppercase tracking-[0.1em] text-[#8f8678]">Credits</p>
              <p className="text-xs text-center text-[#8f8678]">High-detail restoration</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#c9953d]/50 bg-[#1a1614]">
                <span className="text-2xl font-light text-[#d7a957]">4x</span>
              </div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9953d]">x4 Pro Restore</h4>
              <p className="text-3xl font-light text-[#d7a957]">{CREDIT_COSTS.ENHANCE_4X}</p>
              <p className="text-xs uppercase tracking-[0.1em] text-[#8f8678]">Credits</p>
              <p className="text-xs text-center text-[#8f8678]">Print and archive quality</p>
            </div>
          </div>
        </section>

        {/* Subscription Plans Table */}
        <section className="mb-20">
          <h2 className="text-center text-3xl font-light text-[#d7a957] mb-4">Subscription Plans</h2>
          <h3 className="text-center text-2xl font-light text-white mb-12">Find the plan that fits your workflow.</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left font-light text-[#d8d0c4]"></th>
                  {SUBSCRIPTION_TIERS.map((tier) => (
                    <th key={tier.id} className="px-6 py-4 text-center font-semibold uppercase tracking-[0.1em] text-[#d7a957] text-xs">
                      {tier.name}
                      {tier.id === "creator" && (
                        <div className="mt-1 inline-block rounded-full bg-[#c9953d] px-2 py-1 text-[10px] font-bold text-black">
                          Most Popular
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Credits", key: "credits" },
                  { label: "Max Upload", key: "maxUpload" },
                  { label: "Batch", key: "batch" },
                  { label: "Storage", key: "storage" },
                  { label: "Usage Rights", key: "usage" },
                ].map((row) => (
                  <tr key={row.key} className="border-b border-white/10">
                    <td className="px-6 py-4 text-left font-light text-[#d8d0c4] text-xs uppercase tracking-[0.05em]">
                      {row.label}
                    </td>
                    {SUBSCRIPTION_TIERS.map((tier) => (
                      <td key={`${tier.id}-${row.key}`} className="px-6 py-4 text-center text-[#d8d0c4] text-xs">
                        {row.key === "credits" && `${tier.monthlyCredits.toLocaleString()}`}
                        {row.key === "maxUpload" && `${tier.maxFileSize}MB`}
                        {row.key === "batch" && (tier.id === "free" ? "No" : tier.id === "starter" ? "No" : tier.id === "creator" ? "Up to 20" : tier.id === "studio" ? "Up to 100" : "Custom")}
                        {row.key === "storage" && (tier.id === "free" ? "24h" : tier.id === "starter" ? "7 days" : tier.id === "creator" ? "30 days" : tier.id === "studio" ? "90 days" : "Custom")}
                        {row.key === "usage" && (tier.id === "free" ? "Non-commercial" : tier.id === "starter" ? "Personal" : tier.id === "creator" ? "Small business" : tier.id === "studio" ? "Full commercial" : "Institutional")}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-6 py-4"></td>
                  {SUBSCRIPTION_TIERS.map((tier) => (
                    <td key={`cta-${tier.id}`} className="px-6 py-4 text-center">
                      <Button asChild className={`h-10 w-full rounded-sm uppercase tracking-[0.08em] text-xs font-semibold ${
                        tier.id === "creator"
                          ? "bg-[#c9953d] text-black hover:bg-[#d7a957]"
                          : "border border-[#d7a957] bg-transparent text-[#d7a957] hover:bg-[#d7a957]/10"
                      }`}>
                        <Link href="/enhance">{tier.id === "free" ? "Start Free" : `Choose ${tier.name}`}</Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-[#8f8678]">
            <Check className="h-4 w-4 text-[#c9953d]" strokeWidth={3} />
            No hidden formulas. You always see the credit cost before processing.
          </p>
        </section>

        {/* PAYG Section */}
        <section id="payg" className="mb-20">
          <h2 className="text-center text-3xl font-light text-[#d7a957] mb-4">Pay-As-You-Go</h2>
          <h3 className="text-center text-2xl font-light text-white mb-12">Need credits without a subscription?</h3>
          
          <div className="grid gap-6 md:grid-cols-4">
            {PAYG_CREDIT_PACKS.map((pack) => (
              <div key={pack.id} className="relative flex flex-col items-center rounded-lg border border-white/10 bg-[#1a1614] p-6">
                {pack.popular && (
                  <div className="absolute right-4 top-4 rounded-full bg-[#c9953d] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-black">
                    Best Value
                  </div>
                )}
                <ShoppingCart className="h-10 w-10 text-[#d7a957] mb-4" strokeWidth={1.5} />
                <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9953d] text-center">{pack.name}</h4>
                <p className="mt-4 text-3xl font-light text-[#d7a957]">${pack.price}</p>
                <p className="text-xs text-[#8f8678] mt-1">{pack.credits.toLocaleString()} credits</p>
                <p className="text-xs text-[#8f8678] mt-4">Expires in {pack.expiryDays} days</p>
                <Button asChild className="mt-6 w-full h-10 rounded-sm border border-[#d7a957] bg-transparent text-[#d7a957] hover:bg-[#d7a957]/10 uppercase tracking-[0.08em] text-xs font-semibold">
                  <Link href="/enhance">Buy Credits</Link>
                </Button>
              </div>
            ))}
          </div>
          
          <p className="mt-6 text-center text-xs text-[#8f8678]">
            🎁 PAYG credits are valid for 12 months. No subscription required.
          </p>
        </section>

        {/* What Happens When Credits Run Out */}
        <section className="mb-20 rounded-lg border border-white/10 bg-white/5 p-8">
          <h2 className="text-center text-2xl font-light text-white mb-12">What happens when credits run out</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <ShoppingCart className="h-12 w-12 text-[#d7a957] mb-4" strokeWidth={1.5} />
              <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-white mb-2">Buy Pay-As-You-Go Credits</h4>
              <p className="text-xs text-[#8f8678]">One-time packs. Use when you need them.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-12 w-12 text-[#d7a957] mb-4" strokeWidth={1.5} />
              <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-white mb-2">Upgrade Your Plan</h4>
              <p className="text-xs text-[#8f8678]">More monthly credits and higher limits.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Clock className="h-12 w-12 text-[#d7a957] mb-4" strokeWidth={1.5} />
              <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-white mb-2">Wait Until Next Reset Date</h4>
              <p className="text-xs text-[#8f8678]">Monthly credits refresh au/automatically.</p>
            </div>
          </div>
          
          <p className="mt-8 text-center text-xs text-[#8f8678]">
            👤 Your account remains active.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <h2 className="text-center text-2xl font-light text-white mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              { q: "What is a credit?", a: "A credit is the unit of payment for image enhancement. Different upscale levels cost different amounts." },
              { q: "How many credits does each mode use?", a: "2x uses 4 credits, 3x uses 9 credits, and 4x uses 16 credits." },
              { q: "Why does 4x use 16 credits?", a: "4x upscaling creates 16x more pixels (4x width × 4x height), requiring significantly more processing." },
              { q: "Can I use 4x on any plan?", a: "Yes. All plans support 2x, 3x, and 4x upscaling. Only file size limits vary by plan." },
              { q: "Do monthly credits roll over?", a: "No. Monthly subscription credits reset each month. Pay-as-you-go credits expire after 12 months." },
              { q: "Do PAYG credits expire?", a: "Yes. Pay-as-you-go credits expire 12 months after purchase. Monthly credits never expire until the month ends." },
            ].map((item, idx) => (
              <details key={idx} className="group rounded-lg border border-white/10 bg-white/5 p-4">
                <summary className="flex cursor-pointer items-center justify-between font-light text-sm text-white hover:text-[#d7a957]">
                  {item.q}
                  <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-xs text-[#8f8678]">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center border-t border-white/10 pt-12">
          <h2 className="text-3xl font-light text-[#d7a957] mb-6">Restore More Detail.
            <br />
            Keep Full Control.
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Button asChild className="h-12 bg-[#c9953d] text-black hover:bg-[#d7a957] rounded-sm font-semibold uppercase tracking-[0.1em] text-sm px-12">
              <Link href="/enhance">Start Free</Link>
            </Button>
            <Button asChild className="h-12 border border-[#8b7d6a] bg-[#3d3a36] text-[#d8d0c4] hover:bg-[#4d4a46] rounded-sm font-semibold uppercase tracking-[0.1em] text-sm px-12">
              <Link href="#payg">View Pay-As-You-Go</Link>
            </Button>
          </div>
          <p className="mt-8 text-xs text-[#8f8678]">
            🔒 Secure processing. Your images stay private.
          </p>
        </section>
      </div>
    </main>
  )
}
