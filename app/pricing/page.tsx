import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"
import { CREDIT_COSTS, PAYG_CREDIT_PACKS, SUBSCRIPTION_TIERS } from "@/lib/credits"
import { Check, Wand2, Sparkles, Zap } from "lucide-react"

const modeCards = [
  { title: "x2 Enhance", credits: CREDIT_COSTS.ENHANCE_2X, copy: "Light enhancement", icon: Wand2 },
  { title: "x3 Restore", credits: CREDIT_COSTS.ENHANCE_3X, copy: "Balanced restoration", icon: Sparkles },
  { title: "x4 Pro Restore", credits: CREDIT_COSTS.ENHANCE_4X, copy: "Stronger AI enhancement", icon: Zap },
]

const faqQuestions = [
  "What is a credit?",
  "How many credits does each mode use?",
  "Why choose x2 instead of x4?",
  "Can I use x4 on any plan?",
  "What is the upload limit?",
  "Do monthly credits roll over?",
  "Do PAYG credits expire?",
  "What happens when I run out of credits?",
  "Is clar1ty only for old photos?",
  "Which plan should I choose?",
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-[#efe8dc] lg:px-16">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between border-b border-white/8 pb-8">
          <Link href="/" aria-label="clar1ty home">
            <ClarityLogo className="h-10 w-auto" width={145} height={44} />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/sign-in" className="text-[#d7a957] transition hover:text-white">
              Sign in
            </Link>
            <Button asChild className="h-10 rounded-none bg-[#c9953d] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-black hover:bg-[#d7a957]">
              <Link href="/sign-in">Start free</Link>
            </Button>
          </div>
        </nav>

        <section className="mx-auto max-w-3xl py-20 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Simple plans for serious restoration</p>
          <h1 className="mt-6 text-5xl font-light leading-tight text-[#f1e5d3] md:text-6xl">Start free, scale when you need more credits.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#d4c7b6]">
            Use credits every time you enhance an image. You always see the exact cost before processing.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild className="h-12 rounded-none bg-[#c9953d] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-black hover:bg-[#d7a957]">
              <Link href="/sign-in">Start free</Link>
            </Button>
            <Button asChild className="h-12 rounded-none border border-[#6f5d49] bg-[#17120f] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#f0e2cf] hover:bg-[#221913]">
              <Link href="#payg">Buy credits</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-[#a8977c]">Secure and private. No credit card required for Free.</p>
        </section>

        <section className="py-8">
          <div className="grid gap-6 md:grid-cols-3">
            {modeCards.map(({ title, credits, copy, icon: Icon }) => (
              <article key={title} className="rounded-2xl bg-white/[0.03] p-7 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#17120f]">
                  <Icon className="h-8 w-8 text-[#d7a957]" strokeWidth={1.5} />
                </div>
                <h2 className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9953d]">{title}</h2>
                <p className="mt-4 text-5xl font-light text-[#f2d18a]">{credits}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8f8678]">Credits</p>
                <p className="mt-4 text-sm text-[#d4c7b6]">{copy}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-white/[0.03] px-6 py-5 text-sm leading-7 text-[#d7ccba]">
            Two x2 passes usually stay closer to the original appearance and preserve a more natural look. A single x4 pass applies a stronger enhancement in one step and may introduce more AI-generated detail, while still remaining visually close to the original image.
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Subscription plans</p>
            <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">Choose the plan that fits your workflow.</h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <article key={tier.id} className={`relative rounded-2xl p-7 ${tier.id === "creator" ? "bg-[#c9953d]/12 ring-1 ring-[#c9953d]/35" : "bg-white/[0.03]"}`}>
                {tier.id === "creator" ? (
                  <div className="absolute right-5 top-5 rounded-full bg-[#c9953d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black">
                    Most Popular
                  </div>
                ) : null}
                <p className="text-xs uppercase tracking-[0.22em] text-[#c9953d]">{tier.name}</p>
                <h3 className="mt-4 text-3xl font-light text-[#f1e5d3]">{tier.price === 0 ? "$0" : `$${tier.price} / month`}</h3>
                <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">{tier.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-[#ddd2c2]">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#c9953d]" strokeWidth={3} />
                    {tier.monthlyCredits.toLocaleString()} credits
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#c9953d]" strokeWidth={3} />
                    {tier.maxFileSize} MB max upload
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#c9953d]" strokeWidth={3} />
                    {tier.features[2]}
                  </li>
                </ul>
                <Button asChild className="mt-7 h-11 w-full rounded-none border border-[#6f5d49] bg-[#17120f] text-[12px] font-semibold uppercase tracking-[0.12em] text-[#f0e2cf] hover:bg-[#221913]">
                  <Link href="/sign-in">{tier.id === "free" ? "Start free" : `Choose ${tier.name}`}</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section id="payg" className="py-24">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Pay as you go</p>
            <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">Need credits without a subscription?</h2>
            <p className="mt-6 text-sm leading-7 text-[#d4c7b6]">Buy credits once and use them when you need extra image enhancement.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {PAYG_CREDIT_PACKS.map((pack) => (
              <article key={pack.id} className="relative rounded-2xl bg-white/[0.03] p-6">
                {pack.popular ? (
                  <div className="absolute right-4 top-4 rounded-full bg-[#c9953d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black">
                    Best Value
                  </div>
                ) : null}
                <p className="text-xs uppercase tracking-[0.22em] text-[#c9953d]">{pack.name}</p>
                <p className="mt-4 text-3xl font-light text-[#f2d18a]">${pack.price}</p>
                <p className="mt-2 text-sm text-[#d4c7b6]">{pack.credits.toLocaleString()} credits</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#8f8678]">Expires in {pack.expiryDays} days</p>
                <Button asChild className="mt-6 h-10 w-full rounded-none border border-[#6f5d49] bg-[#17120f] text-[12px] font-semibold uppercase tracking-[0.12em] text-[#f0e2cf] hover:bg-[#221913]">
                  <Link href="/sign-in">Buy credits</Link>
                </Button>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[#a8977c]">PAYG credits are valid for 12 months. No subscription required.</p>
        </section>

        <section className="py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Buy extra credits", copy: "Add PAYG credits anytime." },
              { title: "Upgrade your plan", copy: "Get more monthly credits and higher limits." },
              { title: "Wait until next reset", copy: "Monthly credits refresh automatically." },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl bg-white/[0.03] p-6 text-center">
                <p className="text-sm font-semibold text-[#f1e5d3]">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">{item.copy}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[#a8977c]">Your account remains active.</p>
        </section>

        <section className="py-20">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Common questions</p>
            <h2 className="mt-6 text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">FAQ</h2>
          </div>
          <div className="mt-10 grid gap-4">
            {faqQuestions.map((question) => (
              <details key={question} className="rounded-2xl bg-white/[0.03] p-6">
                <summary className="cursor-pointer list-none text-base font-medium text-[#f6ebdd]">{question}</summary>
                <p className="mt-4 text-sm leading-7 text-[#d1c3b1]">
                  {question === "What is a credit?"
                    ? "A credit is the unit of payment for image enhancement. Different upscale levels cost different amounts."
                    : question === "How many credits does each mode use?"
                      ? "x2 uses 6 credits, x3 uses 8 credits and x4 uses 10 credits."
                      : question === "Why choose x2 instead of x4?"
                        ? "x2 is more conservative and usually stays closer to the original appearance. x4 applies stronger one-step enhancement."
                        : question === "Can I use x4 on any plan?"
                          ? "Yes. All plans support x2, x3 and x4. Only file size limits vary by plan."
                          : question === "What is the upload limit?"
                            ? "Upload limits vary by plan from 2 MB on Free to 50 MB+ on Archive / Business."
                            : question === "Do monthly credits roll over?"
                              ? "No. Monthly subscription credits reset each month. PAYG credits expire after 12 months."
                              : question === "Do PAYG credits expire?"
                                ? "Yes. Pay-as-you-go credits expire 12 months after purchase."
                                : question === "What happens when I run out of credits?"
                                  ? "Buy extra credits, upgrade your plan or wait until the next reset date."
                                  : question === "Is clar1ty only for old photos?"
                                    ? "No. clar1ty works with modern photos, portraits, product images, creative assets and old photographs."
                                    : "Choose Clean Enhance for general work, Old Photo Restore for damaged photos, Face Detail for portraits and Cultural Detail for heritage or culturally specific images."}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="py-16 text-center">
          <h2 className="text-4xl font-light leading-tight text-[#f1e5d3] md:text-5xl">Restore more detail. Keep full control.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#d4c7b6]">
            Start with 10 free credits. Enhance portraits, restore memories, improve creative visuals and preserve the details that matter.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild className="h-12 rounded-none bg-[#c9953d] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-black hover:bg-[#d7a957]">
              <Link href="/sign-in">Start free</Link>
            </Button>
            <Button asChild className="h-12 rounded-none border border-[#6f5d49] bg-[#17120f] px-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#f0e2cf] hover:bg-[#221913]">
              <Link href="#payg">View Pay-As-You-Go</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
