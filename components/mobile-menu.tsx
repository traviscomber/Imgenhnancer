"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const menuItems = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
] as const

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-amber-500/10 hover:text-amber-400"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] border-white/10 bg-gray-900">
          <SheetHeader className="mb-8 text-left">
            <SheetTitle className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-amber-400" />
              <span className="text-xl font-bold text-white">clar1ty</span>
            </SheetTitle>
            <SheetDescription className="text-gray-400">AI image enhancement</SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 font-medium text-white transition hover:bg-amber-500/10 hover:text-amber-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t border-white/10 pt-8">
            <Link href="/enhance" onClick={() => setOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Upscale
              </Button>
            </Link>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-center text-xs text-gray-500">
              Powered by <span className="font-semibold text-amber-400">n3uralia group</span>
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
