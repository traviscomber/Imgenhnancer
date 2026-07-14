"use client"

import Link from "next/link"
import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">clar1ty</h3>
            <p className="text-sm text-gray-400">
              AI image enhancement for portraits, creators, brands, families and heritage restoration.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 transition-colors hover:text-amber-400">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 transition-colors hover:text-amber-400">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 transition-colors hover:text-amber-400">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 transition-colors hover:text-amber-400">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/enhance" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  Upscale
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/sign-in" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  FAQ
                </Link>
              </li>
            </ul>
            <div className="border-t border-gray-800 pt-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400" />
                <a href="mailto:info@clar1ty.art" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  info@clar1ty.art
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  Disclaimer
                </Link>
              </li>
              <li>
                <a href="mailto:legal@clar1ty.art" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                  Legal Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex flex-col items-center gap-2 text-sm text-gray-400 sm:flex-row">
              <p>© 2025 clar1ty. All rights reserved.</p>
              <span className="hidden sm:inline">•</span>
              <p>
                Built by{" "}
                <a
                  href="https://n3uralia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-amber-400 transition-colors hover:text-amber-300"
                >
                  N3uralia
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href="mailto:info@clar1ty.art" className="text-sm text-gray-400 transition-colors hover:text-amber-400">
                info@clar1ty.art
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
