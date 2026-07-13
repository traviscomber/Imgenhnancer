import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ClarityLogo } from "@/components/clarity-logo"

const faqs = [
  {
    question: "Is clar1ty only for old photos?",
    answer:
      "No. clar1ty works with modern digital photos, portraits, product images, creative assets, artwork, scans and old photographs.",
  },
  {
    question: "Is clar1ty good for Asian faces?",
    answer:
      "Yes. clar1ty is designed with special care for Asian portraits, facial detail, skin texture, traditional clothing and cultural visual elements.",
  },
  {
    question: "What is Cultural Detail?",
    answer:
      "Cultural Detail helps preserve architecture, traditional clothing, ornaments, patterns, fabrics and cultural textures during enhancement.",
  },
  {
    question: "What is the difference between x2 and x4?",
    answer:
      "x2 is more conservative and usually stays closer to the original appearance. x4 applies stronger one-step enhancement and may introduce more AI-generated detail.",
  },
  {
    question: "Which preset should I choose?",
    answer:
      "Choose Clean Enhance for general work, Old Photo Restore for damaged photos, Face Detail for portraits and Cultural Detail for heritage or culturally specific images.",
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-[#efe8dc]">
      <div className="pointer-events-none fixed inset-0 opacity-25">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_at_22%_18%,rgba(201,149,61,0.2),transparent_34%),radial-gradient(circle_at_74%_10%,rgba(122,91,50,0.18),transparent_34%)]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <nav className="flex items-center justify-between border-b border-white/10 pb-8">
          <Link href="/" aria-label="clar1ty home">
            <ClarityLogo className="h-10 w-auto drop-shadow-[0_0_10px_rgba(211,155,62,0.45)]" width={145} height={44} />
          </Link>
          <Link href="/support" className="rounded-full border border-[#c9953d]/40 px-4 py-2 text-sm text-[#f0d59c] hover:border-[#c9953d] hover:text-white">
            Support
          </Link>
        </nav>

        <Link href="/support" className="mt-10 inline-flex items-center gap-2 text-sm text-[#b9ad9a] transition hover:text-[#d7a957]">
          <ArrowLeft className="h-4 w-4" />
          Back to support
        </Link>

        <section className="py-16 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Clar1ty help</p>
          <h1 className="mt-6 text-5xl font-light tracking-[0.04em] text-white md:text-6xl">FAQ</h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#d8d0c4]">
            Practical answers for image preparation, privacy, credits and preservation-focused enhancement.
          </p>
        </section>

        <section className="grid gap-5 pb-24">
          {faqs.map((item) => (
            <article key={item.question} className="rounded-2xl border border-white/10 bg-white/[0.035] p-7 shadow-[0_0_32px_rgba(214,188,117,0.08)]">
              <h2 className="text-xl font-semibold text-white">{item.question}</h2>
              <p className="mt-4 text-sm leading-7 text-[#d8d0c4]">{item.answer}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
