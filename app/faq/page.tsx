import Link from "next/link"

const faqCategories = [
  {
    title: "What is clar1ty?",
    items: [
      {
        question: "What is clar1ty?",
        answer:
          "clar1ty is a preservation-first AI image enhancement platform built for portraits, heritage images, creative work, and cultural detail. It restores clarity without changing the identity or character of your images.",
      },
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
    ],
  },
  {
    title: "How it works",
    items: [
      {
        question: "How do the presets work?",
        answer:
          "The 4 presets guide your workflow: Clean Enhance for digital work, Old Photo Restore for damaged photos, Face Detail for portraits, and Cultural Detail for heritage and cultural imagery. Each preset uses specialized tuning for its use case.",
      },
      {
        question: "What is the difference between x2, x3, and x4?",
        answer:
          "x2 Enhance is conservative and stays closer to the original appearance. x3 Restore offers balanced enhancement with more visible repair. x4 Pro Restore applies the strongest treatment for heavily damaged images. Two x2 passes usually stay closer to original than one x4 pass.",
      },
      {
        question: "What is Cultural Detail?",
        answer:
          "Cultural Detail helps preserve architecture, traditional clothing, ornaments, patterns, fabrics and cultural textures during enhancement. It's optimized for heritage buildings, jewelry, artifacts, and historical visuals.",
      },
    ],
  },
  {
    title: "Credits & Pricing",
    items: [
      {
        question: "What is a credit?",
        answer:
          "A credit is a unit of processing power. Each enhancement mode costs credits: x2 Enhance = 6 credits, x3 Restore = 8 credits, x4 Pro Restore = 10 credits.",
      },
      {
        question: "Do monthly credits roll over?",
        answer:
          "No, monthly credits reset on your billing date and unused credits do not carry over. Pay-as-you-go credits are valid for 12 months.",
      },
      {
        question: "Can I use x4 on any plan?",
        answer:
          "Yes, all plans can use any enhancement mode (x2, x3, x4). Credit availability depends on your plan's monthly allowance.",
      },
    ],
  },
  {
    title: "Storage & Privacy",
    items: [
      {
        question: "Do you store my images?",
        answer:
          "No. Files are processed temporarily and automatically deleted. Job metadata (filename, preset, mode, date, status) is stored for your history only. Images are never used for training or marketing.",
      },
      {
        question: "How long can I download my enhanced image?",
        answer:
          "Enhanced images are available for download for 24-48 hours after processing. After that, the file is automatically deleted. Keep originals if you need permanent records.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-16 text-[#efe8dc] lg:px-16 lg:pt-20">
      <div className="mx-auto max-w-5xl">
        <section className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Help center</p>
          <h1 className="mt-6 text-4xl font-light tracking-[0.04em] text-white md:text-6xl">FAQ</h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#d8d0c4]">
            Practical answers for image preparation, privacy, credits, presets and preservation-focused enhancement.
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

        <section className="mt-16 space-y-14">
          {faqCategories.map((category) => (
            <div key={category.title}>
              <h2 className="mb-6 text-2xl font-light text-[#f1e5d3]">{category.title}</h2>
              <div className="grid gap-4">
                {category.items.map((item) => (
                  <article key={item.question} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                    <h3 className="font-semibold text-[#f1e5d3]">{item.question}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center">
          <p className="text-sm leading-7 text-[#d4c7b6]">
            Have a question we didn't answer?{" "}
            <Link href="/support" className="font-semibold text-[#d7a957] transition hover:text-[#f1e5d3]">
              Contact support
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
