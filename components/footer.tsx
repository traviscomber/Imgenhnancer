"use client"

import Link from "next/link"
import { Mail } from "lucide-react"
import { ClarityLogo } from "@/components/clarity-logo"

const productLinks = [
  { href: "/enhance", label: "Enhance image" },
  { href: "/pricing", label: "Pricing" },
  { href: "/examples", label: "Examples" },
  { href: "/use-cases", label: "Use cases" },
] as const

const studioLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
  { href: "/sign-in", label: "Sign in" },
] as const

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refund policy" },
  { href: "/disclaimer", label: "Disclaimer" },
] as const

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050403] text-[#f3eadf]">
      <div className="clarity-container py-14 md:py-18">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr] lg:gap-12">
          <div>
            <Link href="/" className="inline-flex" aria-label="Clar1ty home">
              <ClarityLogo className="h-10 w-auto" width={150} height={48} />
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#c8bcad]">
              A quiet restoration studio for portraits, archives, creative references, and visual memory.
            </p>
            <div className="mt-8 border-l border-[#c9953d]/40 pl-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#c9953d]">Built by N3uralia</p>
              <p className="mt-2 text-sm leading-7 text-[#918679]">
                Designed for clarity, cultural detail, and controlled enhancement.
              </p>
            </div>
          </div>

          <div>
            <FooterColumn title="Product" links={productLinks} />
          </div>

          <div>
            <FooterColumn title="Studio" links={studioLinks} />
          </div>

          <div>
            <FooterColumn title="Legal" links={legalLinks} />
            <a
              href="mailto:info@clar1ty.art"
              className="mt-6 inline-flex items-center gap-2 text-sm text-[#c8bcad] transition hover:text-[#d7a957]"
            >
              <Mail className="h-4 w-4 text-[#c9953d]" />
              info@clar1ty.art
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-7">
          <div className="flex flex-col gap-4 text-xs uppercase tracking-[0.18em] text-[#918679] md:flex-row md:items-center md:justify-between">
            <p>© 2026 Clar1ty. All rights reserved.</p>
            <a
              href="https://n3uralia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c9953d] transition hover:text-[#d7a957]"
            >
              N3uralia ecosystem
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: readonly { href: string; label: string }[]
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c9953d]">{title}</h4>
      <ul className="mt-5 space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-sm text-[#c8bcad] transition hover:text-[#f3eadf]">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
