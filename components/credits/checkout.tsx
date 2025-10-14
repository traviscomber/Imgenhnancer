"use client"

import { useCallback, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/app/actions/stripe"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  packageId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Checkout({ packageId, open, onOpenChange }: CheckoutProps) {
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      setError(null)
      const clientSecret = await startCheckoutSession(packageId)
      return clientSecret
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout")
      throw err
    }
  }, [packageId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
        </DialogHeader>
        {error ? (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div id="checkout">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
