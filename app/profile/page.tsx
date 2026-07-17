"use client"

import Link from "next/link"
import { ArrowRight, LogOut, Settings, Zap, Calendar, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"
import { useState } from "react"

// Mock user data - replace with real data from auth/database
const mockUser = {
  email: "user@example.com",
  plan: "Creator",
  planId: "creator",
  planPrice: "$19/month",
  joinDate: "January 2024",
  monthlyCredits: 600,
  monthlyCreditsUsed: 145,
  paygCredits: 250,
  paygExpires: "July 16, 2027",
  nextReset: "August 19, 2026",
  maxUploadMb: 15,
  batchLimit: 20,
  supportLevel: "email",
}

export default function ProfilePage() {
  const [showPasswordForm, setShowPasswordForm] = useState(false)

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
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-16">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-[#f1e5d3] md:text-5xl">Account Settings</h1>
          <p className="mt-3 text-sm text-[#d4c7b6]">Manage your credits, subscription and account details.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Left Column - Quick Stats */}
          <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Current Plan</p>
              <h2 className="mt-4 text-2xl font-light text-[#f1e5d3]">{mockUser.plan}</h2>
              <p className="mt-2 text-sm text-[#d7a957]">{mockUser.planPrice}</p>
              <p className="mt-4 text-xs text-[#8f8678]">Member since {mockUser.joinDate}</p>
              <Link
                href="/billing"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#c9953d] hover:text-[#d7a957] transition"
              >
                Manage subscription <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Credits Overview */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <div className="flex items-center gap-2 text-[#c9953d]">
                <Zap className="h-5 w-5" />
                <p className="text-xs uppercase tracking-[0.35em]">Credits</p>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#d4c7b6]">Monthly Credits</p>
                    <p className="text-lg font-light text-[#f2d18a]">
                      {mockUser.monthlyCreditsUsed}/{mockUser.monthlyCredits}
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#c9953d] to-[#d7a957]"
                      style={{ width: `${(mockUser.monthlyCreditsUsed / mockUser.monthlyCredits) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#8f8678]">
                    Reset on {mockUser.nextReset}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/8">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#d4c7b6]">Pay-as-you-go</p>
                    <p className="text-lg font-light text-[#f2d18a]">{mockUser.paygCredits}</p>
                  </div>
                  <p className="text-xs text-[#8f8678]">
                    Expires {mockUser.paygExpires}
                  </p>
                  <Link
                    href="/billing"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#c9953d] hover:text-[#d7a957] transition"
                  >
                    Buy credits <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity Link */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">History</p>
              <Link
                href="/history"
                className="mt-4 block text-sm font-semibold text-[#c9953d] hover:text-[#d7a957] transition"
              >
                View enhancement history
              </Link>
            </div>
          </div>

          {/* Right Column - Account Settings */}
          <div className="space-y-6">
            {/* Email */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <div className="flex items-center gap-2 text-[#c9953d] mb-4">
                <Mail className="h-5 w-5" />
                <p className="text-xs uppercase tracking-[0.35em]">Email Address</p>
              </div>
              <p className="text-lg text-[#f1e5d3]">{mockUser.email}</p>
              <button className="mt-4 text-sm font-semibold text-[#c9953d] hover:text-[#d7a957] transition">
                Change email
              </button>
            </div>

            {/* Password */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <div className="flex items-center gap-2 text-[#c9953d] mb-4">
                <Lock className="h-5 w-5" />
                <p className="text-xs uppercase tracking-[0.35em]">Password</p>
              </div>
              <p className="text-sm text-[#d4c7b6]">Last changed 3 months ago</p>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="mt-4 text-sm font-semibold text-[#c9953d] hover:text-[#d7a957] transition"
              >
                Change password
              </button>

              {showPasswordForm && (
                <div className="mt-6 space-y-4 pt-6 border-t border-white/8">
                  <div>
                    <label className="text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-lg border border-white/8 bg-black/40 px-4 py-2 text-sm text-[#f1e5d3] placeholder-[#6f5d49] focus:border-[#c9953d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-lg border border-white/8 bg-black/40 px-4 py-2 text-sm text-[#f1e5d3] placeholder-[#6f5d49] focus:border-[#c9953d] focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 rounded-lg bg-[#c9953d] px-4 py-2 text-sm font-semibold text-black hover:bg-[#d7a957] transition">
                      Update password
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="flex-1 rounded-lg border border-white/8 px-4 py-2 text-sm font-semibold text-[#d4c7b6] hover:bg-white/5 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account Actions */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d] mb-4">Account</p>
              <div className="space-y-3">
                <button className="w-full rounded-lg border border-white/8 px-4 py-2 text-sm font-semibold text-[#d4c7b6] hover:bg-white/5 transition text-left">
                  Download my data
                </button>
                <button className="w-full rounded-lg border border-white/8 px-4 py-2 text-sm font-semibold text-[#d4c7b6] hover:bg-white/5 transition text-left">
                  Delete account
                </button>
              </div>
            </div>

            {/* Sign Out */}
            <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-900/30 border border-red-900/50 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-900/40 transition">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
