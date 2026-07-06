import Link from "next/link"
import { CREDIT_COSTS, CREDIT_PACKAGES } from "@/lib/credits"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-24 text-[#efe8dc]">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-20 flex items-center justify-between">
          <Link href="/" aria-label="clar1ty home">
            <ClarityLogo className="h-10 w-auto drop-shadow-[0_0_10px_rgba(211,155,62,0.45)]" width={145} height={44} />
          </Link>
          <Link href="/enhance" className="text-sm text-[#d7a957] hover:text-white">
            Login
          </Link>
        </nav>

        <section className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Clar1ty credits</p>
          <h1 className="mt-6 text-5xl font-light tracking-[0.04em] text-white md:text-6xl">Pricing</h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#d8d0c4]">
            Buy credits for restoration, upscaling, and cultural-image enhancement. Credits are consumed only when
            processing images.
          </p>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {CREDIT_PACKAGES.map((pkg) => (
            <article
              key={pkg.id}
              className={`relative rounded-2xl border bg-[#080706] p-8 shadow-[0_0_32px_rgba(214,188,117,0.12)] ${
                pkg.popular ? "border-[#c9953d]" : "border-white/10"
              }`}
            >
              {pkg.popular ? (
                <span className="absolute right-5 top-5 rounded-full bg-[#c9953d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black">
                  Popular
                </span>
              ) : null}
              <h2 className="text-2xl font-semibold text-white">{pkg.name}</h2>
              <p className="mt-3 min-h-10 text-sm text-[#b9ad9a]">{pkg.description}</p>
              <div className="mt-8">
                <span className="text-5xl font-light text-white">${pkg.price}</span>
                <span className="ml-2 text-sm text-[#b9ad9a]">USDT</span>
              </div>
              <p className="mt-4 text-sm text-[#d8d0c4]">{pkg.credits.toLocaleString()} credits</p>
              <p className="mt-1 text-xs text-[#8f8678]">${pkg.pricePerCredit.toFixed(3)} per credit</p>
              <Button asChild className="mt-8 h-12 w-full rounded-none bg-[#c9953d] text-black hover:bg-[#e0b365]">
                <Link href="/enhance">Start with {pkg.name}</Link>
              </Button>
            </article>
          ))}
        </section>

        <section className="mx-auto mt-16 grid max-w-3xl gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-sm text-[#d8d0c4] md:grid-cols-2">
          <div>
            <p className="font-semibold text-white">Enhancement cost</p>
            <p className="mt-2">{CREDIT_COSTS.ENHANCE_2X} credits for 2x enhancement.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Higher resolution</p>
            <p className="mt-2">
              {CREDIT_COSTS.ENHANCE_3X} credits for 3x and {CREDIT_COSTS.ENHANCE_4X} credits for 4x enhancement.
            </p>
          </div>
        </section>

        <p className="mt-12 text-center text-sm text-[#8f8678]">
          Questions? <a href="mailto:info@clar1ty.art" className="text-[#d7a957] hover:text-white">info@clar1ty.art</a>
        </p>
      </div>
    </main>
  )
}
