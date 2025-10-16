import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"
import { CREDIT_PACKAGES } from "@/lib/credits"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { userId, packageId, userEmail } = await request.json()

    if (!userId || !packageId || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()
    let packageData

    // Try database first (case-insensitive search)
    const { data: dbPackage } = await supabase.from("credit_packages").select("*").ilike("name", packageId).single()

    if (dbPackage) {
      packageData = {
        name: dbPackage.name,
        price_usd: dbPackage.price_usd,
        credits: dbPackage.credits,
      }
    } else {
      // Fallback to hardcoded packages from credits library
      const fallbackPackage = CREDIT_PACKAGES.find((pkg) => pkg.id.toLowerCase() === packageId.toLowerCase())

      if (!fallbackPackage) {
        console.error("[v0] Package not found:", packageId)
        return NextResponse.json({ error: "Package not found" }, { status: 404 })
      }

      packageData = {
        name: fallbackPackage.name,
        price_usd: fallbackPackage.price,
        credits: fallbackPackage.credits,
      }
    }

    console.log("[v0] Creating pending payment transaction for user:", userEmail)

    const { error: insertError } = await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: packageData.credits,
      type: "crypto",
      operation: "pending_purchase",
      description: `Pending crypto payment: ${packageData.name} package - $${packageData.price_usd} USDT`,
    })

    if (insertError) {
      console.error("[v0] Database insert error:", insertError)
      throw insertError
    }

    console.log("[v0] Pending transaction created successfully")

    return NextResponse.json({
      success: true,
      message: "Payment notification sent. Admin will verify your payment shortly.",
    })
  } catch (error) {
    console.error("[v0] Error creating pending transaction:", error)
    return NextResponse.json({ error: "Failed to create pending transaction" }, { status: 500 })
  }
}
