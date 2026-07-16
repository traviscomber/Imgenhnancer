"use client"

import Link from "next/link"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-16 text-[#efe8dc] lg:px-16 lg:pt-20">
      <div className="mx-auto max-w-4xl">
        <section className="mb-12">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Legal</p>
          <h1 className="mt-4 text-4xl font-light text-[#f1e5d3] md:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-sm text-[#d4c7b6]">Last updated: July 2026</p>
        </section>

        <section className="space-y-8">
          <LegalSection
            title="1. Agreement"
            copy="By using clar1ty, you agree to these terms. If you don't agree, don't use the service. We may update terms anytime. Continued use means acceptance."
          />

          <LegalSection
            title="2. Eligibility"
            copy="You must be 13+ to use clar1ty. You are responsible for account security and all activity. Don't share credentials. You are liable for unauthorized use."
          />

          <LegalSection
            title="3. Acceptable Use"
            copy="Don't upload illegal, copyrighted (without permission), or harmful content. Don't hack, reverse-engineer, or abuse the service. Violations result in termination without refund."
          />

          <LegalSection
            title="4. Your Content"
            copy="You retain ownership of your images. By uploading, you grant us license to process them only. We don't claim rights. We don't train AI on your images. You own enhanced versions."
          />

          <LegalSection
            title="5. Credits"
            copy="Credits are non-refundable. Monthly credits reset on your billing date and don't roll over. PAYG credits expire after 12 months. Unused credits are lost."
          />

          <LegalSection
            title="6. File Deletion (IMPORTANT)"
            copy="Enhanced images are deleted after 7 days. Download immediately. We cannot recover deleted files. We are not liable for lost data. Backup your files."
          />

          <LegalSection
            title="7. Service As-Is"
            copy="clar1ty is provided as-is. We make no guarantees about results. We are not liable for downtime, data loss, or damages from your use beyond the amount you paid in past 12 months."
          />

          <LegalSection
            title="8. Indemnification"
            copy="You agree to indemnify clar1ty against claims arising from your use, content, or violation of these terms."
          />

          <LegalSection
            title="9. Termination"
            copy="We may terminate your account for violations. Upon termination, all files are deleted. You lose access. Refunds follow our refund policy."
          />

          <LegalSection
            title="10. Disputes"
            copy="These terms are governed by Chilean law. Disputes are resolved through Chilean courts."
          />

          <LegalSection
            title="11. Contact"
            copy="Questions? Email support@clar1ty.art."
          />
        </section>

        <section className="mt-12 rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center">
          <p className="text-sm text-[#d4c7b6]">
            <Link href="/privacy" className="font-semibold text-[#d7a957] hover:text-[#f1e5d3]">
              Privacy Policy
            </Link>
            {" / "}
            <Link href="/refund-policy" className="font-semibold text-[#d7a957] hover:text-[#f1e5d3]">
              Refund Policy
            </Link>
            {" / "}
            <Link href="/support" className="font-semibold text-[#d7a957] hover:text-[#f1e5d3]">
              Support
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}

function LegalSection({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#f1e5d3]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#d4c7b6]">{copy}</p>
    </div>
  )
}
