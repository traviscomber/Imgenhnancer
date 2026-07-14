import Link from "next/link"

const faqs = [
  {
    question: "Is clar1ty only for old photos?",
    answer:
      "No. clar1ty works with modern digital photos, portraits, product images, creative assets, scans and old photographs.",
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
    <main className="min-h-screen bg-black px-6 pb-24 pt-16 text-[#efe8dc] lg:px-16 lg:pt-20">
      <div className="mx-auto max-w-5xl">
        <section className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Clar1ty help</p>
          <h1 className="mt-6 text-4xl font-light tracking-[0.04em] text-white md:text-6xl">FAQ</h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#d8d0c4]">
            Practical answers for image preparation, privacy, credits and preservation-focused enhancement.
          </p>
          <div className="mt-8 flex justify-center gap-4 text-sm">
            <Link href="/support" className="text-[#d7a957] transition hover:text-white">
              Support
            </Link>
            <span className="text-white/20">/</span>
            <Link href="/pricing" className="text-[#d7a957] transition hover:text-white">
              Pricing
            </Link>
          </div>
        </section>

        <section className="mt-14 grid gap-5">
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
