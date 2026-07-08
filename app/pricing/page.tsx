import Link from "next/link"
import { CREDIT_COSTS, CREDIT_PACKAGES, SUBSCRIPTION_TIERS, PAYG_CREDIT_PACKS, calculateEnhancementsPerMonth } from "@/lib/credits"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"
import { Check } from "lucide-react"

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-24 text-[#efe8dc]">
      <div className="mx-auto max-w-7xl">
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
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Flexible Plans</p>
          <h1 className="mt-6 text-5xl font-light tracking-[0.04em] text-white md:text-6xl">Choose Your Plan</h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#d8d0c4]">
            Select a monthly subscription for unlimited access or pay-as-you-go for flexibility. Credits are consumed only when processing images.
          </p>
        </section>

        {/* Monthly Subscription Tiers */}
        <section className="mb-20">
          <h2 className="mb-12 text-center text-3xl font-light text-white">Monthly Subscriptions</h2>
          <div className="grid gap-6 lg:grid-cols-5">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <article
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border bg-[#080706] p-8 shadow-[0_0_32px_rgba(214,188,117,0.12)] transition-all ${
                  tier.id === "creator" ? "border-[#c9953d] lg:ring-2 lg:ring-[#c9953d]/50" : "border-white/10"
                } hover:border-[#d7a957]`}
              >
                {tier.id === "creator" && (
                  <span className="absolute right-5 top-5 rounded-full bg-[#c9953d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black">
                    Popular
                  </span>
                )}
                
                <div>
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
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
                  
                  <p className="mt-4 text-2xl font-light text-[#d7a957]">{tier.monthlyCredits.toLocaleString()}</p>
                  <p className="text-xs text-[#8f8678]">credits per month</p>
                  
                  <p className="mt-3 text-sm text-[#d8d0c4]">
                    ≈ {calculateEnhancementsPerMonth(tier.monthlyCredits)} 4x enhancements
                  </p>
                </div>

                <div className="my-8 flex-1 border-t border-white/10"></div>

                <ul className="space-y-3 text-xs text-[#d8d0c4]">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#c9953d]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild className={`mt-8 h-11 w-full rounded-none ${
                  tier.id === "creator" 
                    ? "bg-[#c9953d] text-black hover:bg-[#e0b365]"
                    : "border border-[#d7a957] bg-transparent text-[#d7a957] hover:bg-[#d7a957]/10"
                }`}>
                  <Link href="/enhance">Get Started</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        {/* How Credits Work */}
        <section className="mb-20 rounded-2xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="text-2xl font-light text-white">How Credits Work</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <div className="text-4xl font-light text-[#c9953d]">{CREDIT_COSTS.ENHANCE_2X}</div>
              <p className="mt-2 text-sm font-medium text-white">2x Upscale</p>
              <p className="mt-1 text-xs text-[#b9ad9a]">Perfect for standard enhancing</p>
            </div>
            <div>
              <div className="text-4xl font-light text-[#c9953d]">{CREDIT_COSTS.ENHANCE_3X}</div>
              <p className="mt-2 text-sm font-medium text-white">3x Upscale</p>
              <p className="mt-1 text-xs text-[#b9ad9a]">Better detail and resolution</p>
            </div>
            <div>
              <div className="text-4xl font-light text-[#c9953d]">{CREDIT_COSTS.ENHANCE_4X}</div>
              <p className="mt-2 text-sm font-medium text-white">4x Upscale</p>
              <p className="mt-1 text-xs text-[#b9ad9a]">Maximum quality and detail</p>
            </div>
          </div>
        </section>

        {/* Pay-As-You-Go Packages */}
        <section className="mb-20">
          <h2 className="mb-12 text-center text-3xl font-light text-white">Pay-As-You-Go Packs</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {PAYG_CREDIT_PACKS.map((pkg) => (
              <article
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl border bg-[#080706] p-6 shadow-[0_0_32px_rgba(214,188,117,0.12)] ${
                  pkg.popular ? "border-[#c9953d]" : "border-white/10"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#c9953d] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-black">
                    Best Value
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-light text-white">${pkg.price}</span>
                  <span className="ml-2 text-xs text-[#b9ad9a]">one-time</span>
                </div>
                <p className="mt-2 text-xs text-[#8f8678]">${pkg.pricePerCredit.toFixed(3)} per credit</p>
                <p className="mt-3 text-xs text-[#d8d0c4]">Expires in {pkg.expiryDays} days</p>
                <Button asChild className="mt-auto pt-6 h-10 w-full rounded-none border border-[#d7a957] bg-transparent text-xs text-[#d7a957] hover:bg-[#d7a957]/10">
                  <Link href="/enhance">Buy Credits</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20 max-w-3xl">
          <h2 className="mb-8 text-2xl font-light text-white">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Can I mix subscriptions and pay-as-you-go?</h3>
              <p className="mt-2 text-sm text-[#d8d0c4]">Yes. Your monthly credits are used first, then pay-as-you-go credits top up when needed.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Do unused credits roll over?</h3>
              <p className="mt-2 text-sm text-[#d8d0c4]">Monthly subscription credits refresh each month. Pay-as-you-go credits expire in 12 months.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Can I upgrade or downgrade?</h3>
              <p className="mt-2 text-sm text-[#d8d0c4]">Yes. Changes take effect at the start of your next billing cycle.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">What file sizes are supported?</h3>
              <p className="mt-2 text-sm text-[#d8d0c4]">Max file sizes vary by plan: Free (2MB), Starter (10MB), Creator (15MB), Studio (30MB), Business (50MB+).</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Are there discounts for annual billing?</h3>
              <p className="mt-2 text-sm text-[#d8d0c4]">Contact our team at info@clar1ty.art for volume or annual pricing.</p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <p className="text-center text-sm text-[#8f8678]">
          Questions? <a href="mailto:info@clar1ty.art" className="text-[#d7a957] hover:text-white">Email us</a> or <Link href="/support" className="text-[#d7a957] hover:text-white">visit support</Link>
        </p>
      </div>
    </main>
  )
}
