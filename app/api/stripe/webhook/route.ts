import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"
import { sendPaymentNotification } from "@/lib/whatsapp"

export const runtime = "nodejs"

const ADMIN_PHONE = "+56940946660"

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("[STRIPE] Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    try {
      const credits = Number.parseInt(session.metadata?.credits || "0")
      const packageId = session.metadata?.packageId
      const customerEmail = session.customer_details?.email
      const packageName = session.metadata?.packageName || packageId

      if (!credits || !packageId) {
        console.error("[STRIPE] Missing metadata in session:", session.id)
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
      }

      // Find user by email
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", customerEmail)
        .limit(1)

      if (userError || !users || users.length === 0) {
        console.error("[STRIPE] User not found for email:", customerEmail, userError)
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const userId = users[0].id

      // Add credits to user account
      const { data: existingCredits } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", userId)
        .single()

      if (existingCredits) {
        // Update existing credits
        await supabase
          .from("user_credits")
          .update({
            credits: existingCredits.credits + credits,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      } else {
        // Insert new credits record
        await supabase.from("user_credits").insert({
          user_id: userId,
          credits: credits,
        })
      }

      // Record transaction
      await supabase.from("credit_transactions").insert({
        user_id: userId,
        amount: credits,
        type: "purchase",
        description: `Purchased ${packageId} package via Stripe`,
        operation: "PURCHASE",
      })

      console.log(`[STRIPE] Added ${credits} credits to user ${userId}`)

      await sendPaymentNotification(ADMIN_PHONE, {
        type: "stripe",
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase() || "USD",
        credits,
        packageName: packageName || packageId,
        userEmail: customerEmail || undefined,
        transactionId: session.id,
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("[STRIPE] Error processing payment:", error)
      return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
