"use server"

import { getStripe } from "@/lib/stripe"
import { CREDIT_PACKAGES } from "@/lib/credits"

export async function startCheckoutSession(packageId: string) {
  const stripe = getStripe()
  const creditPackage = CREDIT_PACKAGES.find((p) => p.id === packageId)

  if (!creditPackage) {
    throw new Error(`Credit package with id "${packageId}" not found`)
  }

  // Convert price to cents
  const priceInCents = Math.round(creditPackage.price * 100)

  // Create Checkout Sessions
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${creditPackage.name} - ${creditPackage.credits} Credits`,
            description: creditPackage.description,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      packageId: creditPackage.id,
      credits: creditPackage.credits.toString(),
    },
  })

  return session.client_secret
}

export async function getCheckoutSessionStatus(sessionId: string) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return {
    status: session.status,
    customerEmail: session.customer_details?.email,
    paymentStatus: session.payment_status,
  }
}
