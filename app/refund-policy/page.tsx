"use client"

import Link from "next/link"

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-16 text-[#efe8dc] lg:px-16 lg:pt-20">
      <div className="mx-auto max-w-4xl">
        <section className="mb-12">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Legal</p>
          <h1 className="mt-4 text-4xl font-light text-[#f1e5d3] md:text-5xl">Refund Policy</h1>
          <p className="mt-4 text-sm text-[#d4c7b6]">Last updated: July 2026</p>
        </section>

        <section className="space-y-8">
          <LegalSection
            title="Our Policy"
            copy="clar1ty offers a 30-day money-back guarantee on subscription purchases. PAYG credits are non-refundable once purchased. Refunds are for subscription plans only."
          />

          <LegalSection
            title="Subscription Refunds (30 days)"
            copy="If you purchase a subscription (Starter, Creator, Studio, Archive), you can request a refund within 30 days of purchase for any reason. You must not have used more than 50% of your monthly credits to be eligible."
          />

          <LegalSection
            title="How to Request"
            copy="Email support@clar1ty.art with 'Refund Request' in the subject. Include your account email and order ID. We will respond within 5 business days. Refunds are processed within 5-7 business days after approval."
          />

          <LegalSection
            title="PAYG Credits (Non-Refundable)"
            copy="Pay-as-you-go credit packs are non-refundable once purchased. However, unused PAYG credits expire after 12 months of inactivity. Plan accordingly."
          />

          <LegalSection
            title="Free Credits"
            copy="Free trial credits are non-refundable and cannot be converted to cash. Free credits expire 30 days after account creation if unused."
          />

          <LegalSection
            title="Exceptions (No Refund)"
            copy="We do not issue refunds if: (1) You've used >50% of monthly credits, (2) You've violated our terms, (3) Your account is suspended, (4) You're requesting refund after 30 days, (5) PAYG credits are purchased."
          />

          <LegalSection
            title="Plan Changes"
            copy="Upgrading your subscription is pro-rated. Downgrading your subscription takes effect on next billing date. We do not refund the difference when downgrading mid-cycle."
          />

          <LegalSection
            title="Cancellation"
            copy="You can cancel your subscription anytime. Cancellation takes effect on your next billing date. You retain access until then. Remaining credits for current month are forfeited."
          />

          <LegalSection
            title="Disputes"
            copy="If you believe you qualify for a refund, contact support@clar1ty.art. We will review your request within 5 business days. Our decision is final."
          />

          <LegalSection
            title="Changes to Policy"
            copy="We may update this policy. Changes take effect immediately. Your continued use means you accept the updated policy."
          />
        </section>

        <section className="mt-12 rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center">
          <p className="text-sm text-[#d4c7b6]">
            <Link href="/privacy" className="font-semibold text-[#d7a957] hover:text-[#f1e5d3]">
              Privacy Policy
            </Link>
            {" / "}
            <Link href="/terms" className="font-semibold text-[#d7a957] hover:text-[#f1e5d3]">
              Terms of Service
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
