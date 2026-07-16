"use client"

import Link from "next/link"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-16 text-[#efe8dc] lg:px-16 lg:pt-20">
      <div className="mx-auto max-w-4xl">
        <section className="mb-12">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Legal</p>
          <h1 className="mt-4 text-4xl font-light text-[#f1e5d3] md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-[#d4c7b6]">Last updated: July 2026</p>
        </section>

        <section className="space-y-8">
          <LegalSection
            title="Images are private"
            copy="Images you upload are processed temporarily and deleted after 7 days. We do not permanently store, train on, or use images for any purpose other than your enhancement request. No images are shared with third parties."
          />

          <LegalSection
            title="Job metadata only"
            copy="We store: filename, preset used, enhancement mode, file size, date, and status. This is for your account history and support only. Metadata is deleted when you delete your account."
          />

          <LegalSection
            title="Account data"
            copy="We collect email, encrypted password, subscription tier, credit balance, and billing info (via Stripe). This manages your account, payments, and support. Your name is optional."
          />

          <LegalSection
            title="Usage analytics"
            copy="We collect anonymous usage data: pages viewed, features accessed, processing volumes. This helps us improve. We do not track individual behavior or use third-party tracking cookies."
          />

          <LegalSection
            title="Communications"
            copy="Service emails are mandatory (security, billing). Marketing emails are optional. You can unsubscribe anytime in your account settings. We never spam or share your email."
          />

          <LegalSection
            title="Security"
            copy="Data is encrypted in transit (TLS 1.3) and at rest. Passwords use bcrypt hashing. We perform regular security audits. Report security issues to support@clar1ty.art."
          />

          <LegalSection
            title="Third parties"
            copy="Stripe handles payments. Supabase hosts our database. Both have their own privacy policies. Image processing happens on our infrastructure only—no external processing services."
          />

          <LegalSection
            title="Your rights"
            copy="You can access, correct, or delete your personal data anytime. Contact support@clar1ty.art. We respond within 30 days. You can download your data from your account."
          />

          <LegalSection
            title="Children"
            copy="clar1ty is for users 13+. We do not knowingly collect data from children. If we discover such collection, we delete it immediately."
          />

          <LegalSection
            title="Changes"
            copy="We may update this policy. We will notify you of material changes via email. Continued use means you accept the new policy."
          />

          <LegalSection
            title="Contact"
            copy="Questions? Email support@clar1ty.art or visit our support page."
          />
        </section>

        <section className="mt-12 rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center">
          <p className="text-sm text-[#d4c7b6]">
            <Link href="/terms" className="font-semibold text-[#d7a957] hover:text-[#f1e5d3]">
              Terms of Service
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
