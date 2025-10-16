"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check, Send } from "lucide-react"
import { CREDIT_PACKAGES } from "@/lib/credits"
import Image from "next/image"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"

interface CryptoPaymentProps {
  packageId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEPOSIT_ADDRESS = "TJi1odaRdVm5e7yKLy3Uck3dwiUKDbmJ4a"
const NETWORK = "TRX"
const NETWORK_NAME = "Tron (TRC20)"

export function CryptoPayment({ packageId, open, onOpenChange }: CryptoPaymentProps) {
  const [copied, setCopied] = useState(false)
  const [isNotifying, setIsNotifying] = useState(false)
  const { user } = useAuth()
  const selectedPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(DEPOSIT_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNotifyPayment = async () => {
    if (!user) {
      toast.error("Please login to notify payment")
      return
    }

    setIsNotifying(true)

    try {
      // Call API to create pending transaction
      const response = await fetch("/api/notify-payment-sent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          packageId: packageId,
          userEmail: user.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send notification")
      }

      toast.success("Payment notification sent! Admin will verify your payment.")

      // Create WhatsApp message with payment details
      const message = `Payment Notification

Package: ${selectedPackage?.name}
Amount: $${selectedPackage?.price} USDT
User: ${user.email}
User ID: ${user.id}

I have sent the payment and waiting for verification.`

      // Open WhatsApp with pre-filled message
      const phoneNumber = "56940946660"
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

      console.log("[v0] Opening WhatsApp URL:", whatsappUrl)

      // Try to open in new tab
      const newWindow = window.open(whatsappUrl, "_blank")

      // Fallback if popup blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        console.log("[v0] Popup blocked, using location.href")
        window.location.href = whatsappUrl
      }
    } catch (error) {
      console.error("[v0] Error notifying payment:", error)
      toast.error("Failed to send notification. Please try again.")
    } finally {
      setIsNotifying(false)
    }
  }

  if (!selectedPackage) return null

  // Generate QR code URL for the deposit address
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${DEPOSIT_ADDRESS}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit USDT</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Info */}
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Package</p>
                <p className="font-semibold">{selectedPackage.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold">${selectedPackage.price} USDT</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                You will receive <span className="font-semibold text-foreground">{selectedPackage.credits}</span>{" "}
                credits
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64 border-2 border-border rounded-lg overflow-hidden bg-white p-4">
              <Image
                src={qrCodeUrl || "/placeholder.svg"}
                alt="Deposit QR Code"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Network Info */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Network</p>
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 rounded-lg bg-muted font-mono text-sm font-semibold">{NETWORK}</div>
                <span className="text-sm text-muted-foreground">{NETWORK_NAME}</span>
              </div>
            </div>

            {/* Deposit Address */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Deposit Address</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-muted font-mono text-sm break-all">
                  {DEPOSIT_ADDRESS}
                </div>
                <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0 bg-transparent">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Important:</strong> Send exactly <strong>${selectedPackage.price} USDT</strong> to the address
              above using the <strong>{NETWORK_NAME}</strong> network. Credits will be added to your account after
              confirmation (usually 5-10 minutes).
            </p>
          </div>

          <Button onClick={handleNotifyPayment} className="w-full" disabled={isNotifying}>
            <Send className="h-4 w-4 mr-2" />
            {isNotifying ? "Sending..." : "Confirm Payment"}
          </Button>

          {/* Contact Support */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              After sending payment, click the button above to notify our admin via WhatsApp for faster processing.
            </p>
            <p className="text-xs text-muted-foreground">Having issues? Contact support with your transaction hash.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
