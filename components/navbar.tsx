"use client"

import { useState, useEffect } from "react"
import { Sparkles, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setIsMobileMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-lg border-b border-white/10 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={scrollToTop} className="flex items-center space-x-2 group cursor-pointer">
            <Sparkles className="w-7 h-7 text-amber-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-xl font-bold text-white transition-all duration-300 group-hover:text-amber-400">
              clar1ty
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium">
              Home
            </a>
            <a href="#examples" className="text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium">
              Examples
            </a>
            <a
              href="#professional"
              className="text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium"
            >
              Professional Use
            </a>
            <Link href="/enhance">
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/50">
                Try Enhancer
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 bg-black/95 backdrop-blur-lg">
            <div className="flex flex-col space-y-4">
              <a
                href="#home"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium px-4 py-2"
              >
                Home
              </a>
              <a
                href="#examples"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium px-4 py-2"
              >
                Examples
              </a>
              <a
                href="#professional"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-amber-400 transition-colors text-sm font-medium px-4 py-2"
              >
                Professional Use
              </a>
              <div className="px-4 pt-2">
                <Link href="/enhance">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white transition-all duration-300">
                    Try Enhancer
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
