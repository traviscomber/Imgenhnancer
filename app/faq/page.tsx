import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ClarityLogo } from "@/components/clarity-logo"

const faqs = [
  {
    question: "What kind of images is Clar1ty built for?",
    answer:
      "Clar1ty is tuned for heritage portraits, archive scans, cultural landmarks, printed photos, low-resolution files, and digital artwork where identity and visual context matter.",
  },
  {
    question: "Will enhancement change faces or cultural details?",
    answer:
      "The goal is preservation first: natural tones, facial structure, textiles, ornaments, and local visual character should remain recognizable instead of being replaced by generic AI detail.",
  },
  {
    question: "How do credits work?",
    answer:
      "Credits are consumed only when an image is processed. Higher-resolution enhancement uses more credits because it requires more compute.",
  },
  {
    question: "Do you store uploaded images?",
    answer:
      "Images are processed securely. Clar1ty is designed around minimal storage: we save nothing unnecessary and treat your images as yours.",
  },
  {
    question: "What should I upload for best results?",
    answer:
      "Use the clearest available source, avoid screenshots when possible, and choose the preset that matches the image type: archive scan, portrait preserve, heritage restore, or digital art upscale.",
  },
  {
    question: "Where do I ask about billing or technical issues?",
    answer:
      "Use the support form or email info@clar1ty.art. Include the account email, approximate time of the issue, and any relevant transaction or upload details.",
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
            Practical answers for image preparation, privacy, credits, and preservation-focused enhancement.
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
