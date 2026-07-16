"use client"

import Link from "next/link"
import { ArrowRight, Download, CreditCard, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"

// Mock data - replace with real Stripe data
const currentSubscription = {
  plan: "Creator",
  price: "$19",
  interval: "month",
  nextBilling: "August 19, 2026",
  status: "active",
}

const paygPacks = [
  { credits: 50, price: 5, per_credit: 0.1 },
  { credits: 150, price: 12, per_credit: 0.08 },
  { credits: 450, price: 29, per_credit: 0.064 },
  { credits: 1500, price: 79, per_credit: 0.053 },
]

const invoices = [
  { date: "July 19, 2026", amount: "$19.00", status: "Paid", invoice: "INV-2026-07-001" },
  { date: "June 19, 2026", amount: "$19.00", status: "Paid", invoice: "INV-2026-06-001" },
  { date: "May 19, 2026", amount: "$19.00", status: "Paid", invoice: "INV-2026-05-001" },
  { date: "April 19, 2026", amount: "$19.00", status: "Paid", invoice: "INV-2026-04-001" },
]

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-black text-[#efe8dc]">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 lg:px-16">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="text-[#f1e5d3] hover:text-[#d7a957] transition">
            <ClarityLogo />
          </Link>
          <Button
            asChild
            variant="outline"
            className="border-[#6f5d49] bg-transparent text-[#efe8dc] hover:bg-[#221913]"
          >
            <Link href="/profile">Back to profile</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-16">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-[#f1e5d3] md:text-5xl">Billing & Subscriptions</h1>
          <p className="mt-3 text-sm text-[#d4c7b6]">Manage your subscription plan and purchase credits.</p>
        </div>

        {/* Current Subscription */}
        <section className="mb-12">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Current Subscription</p>
                <h2 className="mt-4 text-3xl font-light text-[#f1e5d3]">{currentSubscription.plan}</h2>
                <p className="mt-2 text-lg text-[#f2d18a]">
                  {currentSubscription.price}
                  <span className="text-sm text-[#d4c7b6]">/{currentSubscription.interval}</span>
                </p>
                <p className="mt-4 text-sm text-[#d4c7b6]">
                  Next billing date: <span className="text-[#f1e5d3]">{currentSubscription.nextBilling}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-green-900/30 border border-green-900/50 px-4 py-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Active</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3 border-t border-white/8 pt-6">
              <button className="flex-1 rounded-lg bg-[#c9953d] px-4 py-2 text-sm font-semibold text-black hover:bg-[#d7a957] transition">
                Change plan
              </button>
              <button className="flex-1 rounded-lg border border-white/8 px-4 py-2 text-sm font-semibold text-[#d4c7b6] hover:bg-white/5 transition">
                Cancel subscription
              </button>
            </div>
          </div>
        </section>

        {/* Pay-as-you-go Credits */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-light text-[#f1e5d3]">Buy Credits</h2>
            <p className="mt-2 text-sm text-[#d4c7b6]">Add credits to your account anytime. Valid for 12 months.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {paygPacks.map((pack) => (
              <div key={pack.credits} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <p className="text-3xl font-light text-[#f2d18a]">${pack.price}</p>
                <p className="mt-3 text-lg text-[#f1e5d3]">{pack.credits} credits</p>
                <p className="mt-1 text-xs text-[#8f8678]">${pack.per_credit.toFixed(3)}/credit</p>
                <button className="mt-6 w-full rounded-lg bg-[#c9953d] px-4 py-2 text-sm font-semibold text-black hover:bg-[#d7a957] transition">
                  Buy now
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Method */}
        <section className="mb-12">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8">
            <div className="flex items-center gap-2 text-[#c9953d] mb-6">
              <CreditCard className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.35em]">Payment Method</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-[#f1e5d3]">Visa ending in 4242</p>
                <p className="mt-2 text-sm text-[#d4c7b6]">Expires 12/28</p>
              </div>
              <button className="text-sm font-semibold text-[#c9953d] hover:text-[#d7a957] transition">
                Update
              </button>
            </div>
          </div>
        </section>

        {/* Billing History */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-light text-[#f1e5d3]">Billing History</h2>
            <p className="mt-2 text-sm text-[#d4c7b6]">Download invoices and view your payment history.</p>
          </div>

          <div className="rounded-2xl border border-white/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/8 bg-white/[0.02]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                      Invoice
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.invoice} className="border-t border-white/8 hover:bg-white/[0.02] transition">
                      <td className="px-6 py-4 text-sm text-[#d4c7b6]">{invoice.date}</td>
                      <td className="px-6 py-4 text-sm text-[#f1e5d3]">{invoice.invoice}</td>
                      <td className="px-6 py-4 text-sm text-[#f2d18a]">{invoice.amount}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-400">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="inline-flex items-center gap-1 text-sm font-semibold text-[#c9953d] hover:text-[#d7a957] transition">
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
