"use client"

import { useEffect, useState } from "react"
import { Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CREDIT_PACKAGES } from "@/lib/credits"
import { CryptoPayment } from "./crypto-payment"

export function CreditDisplay() {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/credits/check")

      if (response.status === 503) {
        const data = await response.json()
        if (data.retry && retryCount < 3) {
          console.log("[CREDITS] Session not ready, retrying in 2s...")
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
            fetchCredits()
          }, 2000)
          return
        }
      }

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCredits(data.credits)
          setRetryCount(0)
        }
      }
    } catch (error) {
      console.error("[CREDITS] Failed to fetch:", error)
      if (retryCount < 3) {
        console.log("[CREDITS] Network error, retrying in 2s...")
        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          fetchCredits()
        }, 2000)
        return
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()
    const interval = setInterval(fetchCredits, 30000)
    return () => clearInterval(interval)
  }, [])

  const handlePurchase = (packageId: string) => {
    setSelectedPackageId(packageId)
    setCheckoutOpen(true)
  }

  const handleCheckoutComplete = () => {
    setCheckoutOpen(false)
    setSelectedPackageId(null)
    fetchCredits()
  }

  const isLowCredits = credits !== null && credits < 20

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 ${isLowCredits ? "border-orange-500 text-orange-600" : ""}`}
          >
            <Coins className={`h-4 w-4 ${isLowCredits ? "text-orange-500" : "text-yellow-500"}`} />
            <span className="font-semibold">{credits?.toLocaleString() || 0}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Your Credits</h4>
              <p className="text-sm text-muted-foreground">
                You have <span className="font-semibold text-foreground">{credits?.toLocaleString() || 0}</span> credits
                remaining
              </p>
            </div>

            {isLowCredits && (
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  ⚠️ Low credits! Purchase more to continue enhancing images.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h5 className="text-sm font-medium">Credit Packages</h5>
              {CREDIT_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-3 rounded-lg border ${pkg.popular ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{pkg.name}</span>
                    {pkg.popular && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{pkg.credits.toLocaleString()} credits</span>
                    <span className="font-semibold">${pkg.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">${pkg.pricePerCredit.toFixed(3)} per credit</p>
                  <Button className="w-full mt-2" size="sm" onClick={() => handlePurchase(pkg.id)}>
                    Purchase
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedPackageId && (
        <CryptoPayment
          packageId={selectedPackageId}
          open={checkoutOpen}
          onOpenChange={(open) => {
            setCheckoutOpen(open)
            if (!open) {
              handleCheckoutComplete()
            }
          }}
        />
      )}
    </>
  )
}
