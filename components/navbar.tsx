"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Sparkles } from "lucide-react"
import { CreditDisplay } from "@/components/credits/credit-display"
import { isAuthenticated } from "@/lib/auth"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const [userCredits, setUserCredits] = useState<number>(0)

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)

      if (authenticated) {
        try {
          const response = await fetch("/api/credits/check")
          const data = await response.json()
          if (data.success) {
            setUserCredits(data.credits)
          }
        } catch (error) {
          console.error("Failed to fetch credits:", error)
        }
      }
    }

    checkAuth()
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              clar1ty
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#examples" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
              Examples
            </Link>
            <Link href="/#professional" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
              Professional Use
            </Link>
            {isAuth && <CreditDisplay credits={userCredits} />}
            <Link href="/enhance">
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
              >
                Try Enhancer
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-amber-400 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-800">
            <Link
              href="/#examples"
              className="block text-gray-300 hover:text-amber-400 transition-colors text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Examples
            </Link>
            <Link
              href="/#professional"
              className="block text-gray-300 hover:text-amber-400 transition-colors text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Professional Use
            </Link>
            {isAuth && (
              <Link href="/credits" onClick={() => setIsMenuOpen(false)}>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
                >
                  Credits: {userCredits}
                </Button>
              </Link>
            )}
            <Link href="/enhance" onClick={() => setIsMenuOpen(false)}>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
              >
                Try Enhancer
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
