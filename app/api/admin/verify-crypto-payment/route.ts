import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendPaymentNotification } from "@/lib/whatsapp"

export const runtime = "nodejs"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const ADMIN_PHONE = "+56940946660"
const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-me-in-production"

export async function POST(request: NextRequest) {
  try {
    const { adminSecret, userId, packageId, transactionHash, userEmail } = await request.json()

    // Verify admin secret
    if (adminSecret !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!userId || !packageId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("id", packageId)
      .single()

    if (packageError || !packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // Add credits to user account
    const { data: currentCredits, error: fetchError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError
    }

    const newCredits = (currentCredits?.credits || 0) + packageData.credits

    const { error: upsertError } = await supabase.from("user_credits").upsert({
      user_id: userId,
      credits: newCredits,
      updated_at: new Date().toISOString(),
    })

    if (upsertError) throw upsertError

    // Record transaction
    const { error: transactionError } = await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: packageData.credits,
      transaction_type: "purchase",
      description: `Crypto purchase: ${packageData.name}`,
      metadata: {
        package_id: packageId,
        transaction_hash: transactionHash,
        payment_method: "crypto",
        amount_paid: packageData.price_usd,
      },
    })

    if (transactionError) throw transactionError

    // Send WhatsApp notification to admin
    console.log("[v0] Attempting to send WhatsApp notification...")
    const notificationSent = await sendPaymentNotification(ADMIN_PHONE, {
      type: "crypto",
      amount: packageData.price_usd,
      currency: "USDT",
      credits: packageData.credits,
      packageName: packageData.name,
      userEmail,
      transactionId: transactionHash,
    })

    if (!notificationSent) {
      console.error("[v0] Failed to send WhatsApp notification, but payment was processed successfully")
    } else {
      console.log("[v0] WhatsApp notification sent successfully")
    }

    console.log("[v0] Successfully verified crypto payment and added credits")

    return NextResponse.json({
      success: true,
      creditsAdded: packageData.credits,
      newBalance: newCredits,
    })
  } catch (error) {
    console.error("[v0] Error verifying crypto payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
