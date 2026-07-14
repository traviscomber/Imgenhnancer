"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { ClarityLogo } from "@/components/clarity-logo"

const desktopLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
] as const

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center group" aria-label="clar1ty home">
            <ClarityLogo className="h-8 w-auto transition-transform group-hover:scale-105" width={130} height={40} />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {desktopLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm tracking-[0.08em] text-[#efe8dc] transition hover:text-[#d7a957]"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="h-11 rounded-none border border-[#c9953d]/70 bg-transparent px-6 text-sm font-medium text-[#efe8dc] hover:bg-[#c9953d]/10 hover:text-white">
              <Link href="/enhance">Upscale</Link>
            </Button>
            <Button asChild className="h-11 rounded-none bg-[#c9953d] px-6 text-sm font-medium text-black hover:bg-[#d7a957]">
              <Link href="/sign-in">Log in</Link>
            </Button>
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
            </div>

            <div className="mt-4 grid gap-3">
              <Button asChild className="h-11 rounded-none border border-[#c9953d]/70 bg-transparent text-sm font-medium text-[#efe8dc] hover:bg-[#c9953d]/10 hover:text-white">
                <Link href="/enhance" onClick={() => setIsMenuOpen(false)}>
                  Upscale
                </Link>
              </Button>
              <Button asChild className="h-11 rounded-none bg-[#c9953d] text-sm font-medium text-black hover:bg-[#d7a957]">
                <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                  Log in
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
