import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function GET() {
  const checks = {
    stripe: false,
    supabase: false,
    twilio: false,
    webhookSecret: false,
    timestamp: new Date().toISOString(),
  }

  const errors: string[] = []

  // Check Stripe connection
  try {
    const stripe = getStripe()
    await stripe.balance.retrieve()
    checks.stripe = true
  } catch (error) {
    errors.push(`Stripe: ${error instanceof Error ? error.message : "Connection failed"}`)
  }

  // Check Supabase connection
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("credit_packages").select("id").limit(1)
    if (error) throw error
    checks.supabase = true
  } catch (error) {
    errors.push(`Supabase: ${error instanceof Error ? error.message : "Connection failed"}`)
  }

  // Check Twilio environment variables
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
    checks.twilio = true
  } else {
    errors.push("Twilio: Missing environment variables")
  }

  // Check webhook secret
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    checks.webhookSecret = true
  } else {
    errors.push("Stripe: Missing STRIPE_WEBHOOK_SECRET")
  }

  const allHealthy = Object.values(checks).every((check) => check === true)

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      checks,
      errors: errors.length > 0 ? errors : undefined,
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app"}/api/stripe/webhook`,
      instructions: {
        stripe: "Configure this webhook URL in your Stripe Dashboard under Developers > Webhooks",
        events: ["checkout.session.completed"],
      },
    },
    { status: allHealthy ? 200 : 503 },
  )
}
