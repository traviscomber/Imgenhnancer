"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Globe } from "lucide-react"
import { CreditDisplay } from "@/components/credits/credit-display"
import { isAuthenticated } from "@/lib/auth"
import { ClarityLogo } from "@/components/clarity-logo"
import { useLanguage, type Language } from "@/hooks/use-language"
import { trackLanguageSwitch } from "@/lib/analytics"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const [userCredits, setUserCredits] = useState<number>(0)
  const [language, setLanguage] = useLanguage()
  const [previousLanguage, setPreviousLanguage] = useState<Language | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)

      if (authenticated) {
        try {
          const response = await fetch("/api/credits/check", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })

          if (!response.ok) {
            console.warn(`[v0] Credits check failed with status ${response.status}`)
            setUserCredits(0)
            return
          }

          const data = await response.json()
          if (data.success && typeof data.credits === "number") {
            setUserCredits(data.credits)
          } else {
            setUserCredits(0)
          }
        } catch (error) {
          console.error("[v0] Failed to fetch credits:", error)
          setUserCredits(0)
        }
      }
    }

    checkAuth()
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center group">
            <ClarityLogo className="h-8 w-auto group-hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/#examples" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
              Examples
            </Link>
            <Link href="/#professional" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
              Professional Use
            </Link>
            
            {/* Language Toggle */}
            <div className="flex items-center gap-2 border-l border-gray-700 pl-6">
              <button
                onClick={() => {
                  if (language !== "en") {
                    trackLanguageSwitch("en", language)
                    setPreviousLanguage(language)
                  }
                  setLanguage("en")
                }}
                className={`text-xs font-medium transition-colors ${
                  language === "en" ? "text-amber-400" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                EN
              </button>
              <span className="text-gray-600">/</span>
              <button
                onClick={() => {
                  if (language !== "es") {
                    trackLanguageSwitch("es", language)
                    setPreviousLanguage(language)
                  }
                  setLanguage("es")
                }}
                className={`text-xs font-medium transition-colors ${
                  language === "es" ? "text-amber-400" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                ES
              </button>
            </div>

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

            {/* Mobile Language Toggle */}
            <div className="flex items-center gap-2 border-y border-gray-700 py-3">
              <Globe className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => {
                  if (language !== "en") {
                    trackLanguageSwitch("en", language)
                    setPreviousLanguage(language)
                  }
                  setLanguage("en")
                  setIsMenuOpen(false)
                }}
                className={`text-xs font-medium transition-colors ${
                  language === "en" ? "text-amber-400" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                English
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={() => {
                  if (language !== "es") {
                    trackLanguageSwitch("es", language)
                    setPreviousLanguage(language)
                  }
                  setLanguage("es")
                  setIsMenuOpen(false)
                }}
                className={`text-xs font-medium transition-colors ${
                  language === "es" ? "text-amber-400" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Español
              </button>
            </div>

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
