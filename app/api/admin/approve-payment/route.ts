import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { CREDIT_PACKAGES } from "@/lib/credits"

export const runtime = "nodejs"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-me-in-production"

export async function POST(request: NextRequest) {
  try {
    const { adminSecret, transactionId } = await request.json()

    // Verify admin secret
    if (adminSecret !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 })
    }

    // Get the pending transaction
    const { data: transaction, error: fetchError } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("operation", "pending_purchase")
      .single()

    if (fetchError || !transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Parse package info from description
    const packageMatch = transaction.description.match(/\$(\d+)/)
    const priceUsd = packageMatch ? Number.parseInt(packageMatch[1]) : 0

    // Find matching package
    const packageData = CREDIT_PACKAGES.find((pkg) => pkg.price === priceUsd)

    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // Get current credits
    const { data: currentCredits, error: creditsError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", transaction.user_id)
      .single()

    if (creditsError && creditsError.code !== "PGRST116") {
      throw creditsError
    }

    const newCredits = (currentCredits?.credits || 0) + packageData.credits

    // Update user credits
    const { error: upsertError } = await supabase.from("user_credits").upsert({
      user_id: transaction.user_id,
      credits: newCredits,
      updated_at: new Date().toISOString(),
    })

    if (upsertError) throw upsertError

    // Update transaction to approved
    const { error: updateError } = await supabase
      .from("credit_transactions")
      .update({
        operation: "purchase",
        description: transaction.description.replace("Pending crypto payment", "Approved crypto payment"),
      })
      .eq("id", transactionId)

    if (updateError) throw updateError

    console.log("[v0] Successfully approved payment and added credits")

    return NextResponse.json({
      success: true,
      creditsAdded: packageData.credits,
      newBalance: newCredits,
    })
  } catch (error) {
    console.error("[v0] Error approving payment:", error)
    return NextResponse.json({ error: "Failed to approve payment" }, { status: 500 })
  }
}
