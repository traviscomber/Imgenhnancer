"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Sparkles, ImageIcon, BookOpen, DollarSign, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  const menuItems = [
    { href: "/#features", label: "Features", icon: Sparkles },
    { href: "/#examples", label: "Examples", icon: ImageIcon },
    { href: "/#how-it-works", label: "How It Works", icon: BookOpen },
    { href: "/#pricing", label: "Pricing", icon: DollarSign },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-amber-400 hover:bg-amber-500/10"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] bg-gray-900 border-white/10">
          <SheetHeader className="text-left mb-8">
            <SheetTitle className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span className="text-xl font-bold text-white">clar1ty</span>
            </SheetTitle>
            <SheetDescription className="text-gray-400">AI Image Enhancement</SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white hover:bg-amber-500/10 hover:text-amber-400 transition-all"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-white/10">
            <Link href="/enhance" onClick={() => setOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Try Free
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Powered by <span className="text-amber-400 font-semibold">n3uralia group</span>
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
