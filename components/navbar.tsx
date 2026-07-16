"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User } from "lucide-react"
import { ClarityLogo } from "@/components/clarity-logo"
import { useAuth } from "@/lib/auth"

const desktopLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
] as const

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)

  // Fetch credits whenever user changes
  useEffect(() => {
    if (!user) {
      setCredits(null)
      return
    }
    fetch("/api/credits/check")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.success) setCredits(data.credits)
      })
      .catch(() => {})
  }, [user])

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
    // Hard-navigate so session cookies are cleared
    window.location.href = "/"
  }

  const authButtons = user ? (
    <>
      {/* Credits badge */}
      <Link
        href="/billing"
        className="flex items-center gap-1.5 rounded-none border border-white/15 px-3 py-1.5 text-sm text-[#efe8dc] transition hover:border-[#c9953d]/50 hover:text-[#d7a957]"
        title="Your credits"
      >
        <span className="text-xs text-[#c9953d] font-semibold">
          {credits !== null ? credits.toLocaleString() : "—"}
        </span>
        <span className="text-xs text-[#efe8dc]/50">credits</span>
      </Link>

      {/* Profile */}
      <Link
        href="/profile"
        className="flex items-center gap-1.5 text-sm text-[#efe8dc] transition hover:text-[#d7a957]"
        title={user.email}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c9953d]/40 bg-[#c9953d]/10">
          <User className="h-4 w-4 text-[#c9953d]" />
        </div>
        <span className="hidden lg:block max-w-[120px] truncate text-xs">
          {user.email.split("@")[0]}
        </span>
      </Link>

      {/* Upscale CTA */}
      <Button asChild className="h-11 rounded-none border border-[#c9953d]/70 bg-transparent px-6 text-sm font-medium text-[#efe8dc] hover:bg-[#c9953d]/10 hover:text-white">
        <Link href="/enhance">Upscale</Link>
      </Button>

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 h-11 rounded-none border border-white/15 bg-transparent px-4 text-sm font-medium text-[#efe8dc]/70 transition hover:border-white/30 hover:text-[#efe8dc]"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden lg:inline">Sign out</span>
      </button>
    </>
  ) : (
    <>
      <Button asChild className="h-11 rounded-none border border-[#c9953d]/70 bg-transparent px-6 text-sm font-medium text-[#efe8dc] hover:bg-[#c9953d]/10 hover:text-white">
        <Link href="/enhance">Upscale</Link>
      </Button>
      <Button asChild className="h-11 rounded-none bg-[#c9953d] px-6 text-sm font-medium text-black hover:bg-[#d7a957]">
        <Link href="/sign-in">Log in</Link>
      </Button>
    </>
  )

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center group" aria-label="clar1ty home">
            <ClarityLogo className="h-8 w-auto transition-transform group-hover:scale-105" width={130} height={40} />
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {desktopLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm tracking-[0.08em] text-[#efe8dc] transition hover:text-[#d7a957]"
              >
                {item.label}
              </Link>
            ))}
            {/* Only render when auth state is resolved to avoid flash */}
            {!loading && authButtons}
          </div>

          <button
            onClick={() => setIsMenuOpen((current) => !current)}
            className="md:hidden text-[#efe8dc] transition hover:text-[#d7a957]"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-white/10 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {desktopLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-[#efe8dc] transition hover:bg-white/5 hover:text-[#d7a957]"
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-[#efe8dc] transition hover:bg-white/5 hover:text-[#d7a957]"
                >
                  Profile {credits !== null && <span className="text-[#c9953d] ml-1">· {credits.toLocaleString()} credits</span>}
                </Link>
              )}
            </div>

            <div className="mt-4 grid gap-3">
              <Button asChild className="h-11 rounded-none border border-[#c9953d]/70 bg-transparent text-sm font-medium text-[#efe8dc] hover:bg-[#c9953d]/10 hover:text-white">
                <Link href="/enhance" onClick={() => setIsMenuOpen(false)}>
                  Upscale
                </Link>
              </Button>
              {user ? (
                <Button
                  onClick={handleLogout}
                  className="h-11 rounded-none border border-white/15 bg-transparent text-sm font-medium text-[#efe8dc]/70 hover:border-white/30 hover:text-[#efe8dc]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              ) : (
                <Button asChild className="h-11 rounded-none bg-[#c9953d] text-sm font-medium text-black hover:bg-[#d7a957]">
                  <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                    Log in
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
