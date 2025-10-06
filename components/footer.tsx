import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Globe } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold text-gradient-gold">clar1ty</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional AI-powered image enhancement for heritage preservation, photography, and creative projects.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="px-3 py-1 bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-full text-gold-400">
                Powered by n3uralia group
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/enhance" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  AI Enhancer
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#examples" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/#professional" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Professional Use
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://www.n3uralia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  n3uralia.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.n3uralia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  n3uralia ecosystem
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/n3uralia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gold-500/20 flex items-center justify-center text-gray-400 hover:text-gold-400 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/n3uralia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gold-500/20 flex items-center justify-center text-gray-400 hover:text-gold-400 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/n3uralia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gold-500/20 flex items-center justify-center text-gray-400 hover:text-gold-400 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/n3uralia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gold-500/20 flex items-center justify-center text-gray-400 hover:text-gold-400 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@n3uralia.com"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gold-500/20 flex items-center justify-center text-gray-400 hover:text-gold-400 transition-all"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-gold-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/terms" className="hover:text-gold-400 transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/cookies" className="hover:text-gold-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} clar1ty. All rights reserved. Built with ❤️ by{" "}
              <a
                href="https://www.n3uralia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300 transition-colors"
              >
                n3uralia group
              </a>
            </p>
            <p className="text-gray-500">Part of the n3uralia ecosystem of AI products</p>
          </div>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "clar1ty",
            description: "Professional AI-powered image enhancement",
            url: "https://clar1ty.vercel.app",
            logo: "https://clar1ty.vercel.app/logo.png",
            sameAs: [
              "https://twitter.com/n3uralia",
              "https://facebook.com/n3uralia",
              "https://instagram.com/n3uralia",
              "https://linkedin.com/company/n3uralia",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              email: "hello@n3uralia.com",
              contactType: "Customer Support",
            },
            author: {
              "@type": "Organization",
              name: "n3uralia group",
              url: "https://www.n3uralia.com",
            },
          }),
        }}
      />
    </footer>
  )
}
