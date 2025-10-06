"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileMenu } from "@/components/mobile-menu"

export function Navbar() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 group cursor-pointer bg-transparent border-none"
            aria-label="clar1ty - Scroll to top"
          >
            <Sparkles
              className="w-8 h-8 text-amber-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-amber-300"
              aria-hidden="true"
            />
            <span className="text-2xl font-bold text-white transition-all duration-300 group-hover:text-amber-400">
              clar1ty
            </span>
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8">
            <li>
              <Link href="/#features" className="text-white/80 hover:text-amber-400 transition-colors font-medium">
                Features
              </Link>
            </li>
            <li>
              <Link href="/#examples" className="text-white/80 hover:text-amber-400 transition-colors font-medium">
                Examples
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="text-white/80 hover:text-amber-400 transition-colors font-medium">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="text-white/80 hover:text-amber-400 transition-colors font-medium">
                Pricing
              </Link>
            </li>
          </ul>

          {/* CTA & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/enhance" className="hidden md:block">
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/50">
                <Sparkles className="w-4 h-4 mr-2" />
                Try Free
              </Button>
            </Link>
            <MobileMenu />
          </div>
        </div>
      </nav>
    </header>
  )
}
