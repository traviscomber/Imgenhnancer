import "server-only"

import Stripe from "stripe"

// Initialize Stripe lazily to avoid errors during build when env vars are not available
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return stripeInstance
}

// For backward compatibility
export const stripe = getStripe()
