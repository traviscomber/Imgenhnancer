import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"
import { CREDIT_PACKAGES } from "@/lib/credits"
import { sendWhatsAppMessage } from "@/lib/whatsapp-web"

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

    const notificationMessage = `🔔 *PAYMENT NOTIFICATION*

👤 User: ${userEmail}
📦 Package: ${packageData.name}
💰 Amount: $${packageData.price_usd} USDT
⭐ Credits: ${packageData.credits}
🌐 Network: Tron (TRC20)
📍 Address: TJi1odaRdVm5e7yKLy3Uck3dwiUKDbmJ4a

🆔 User ID: ${userId}
📋 Package ID: ${packageId}

Please verify the transaction on the blockchain and credit the user's account.`

    console.log("[v0] Payment notification:", notificationMessage)

    // Send via WhatsApp Web API
    await sendWhatsAppMessage("56940946660", notificationMessage)

    // Store notification in database for admin to check
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: packageData.credits,
      operation: "pending_purchase",
      description: `Pending crypto payment: ${packageData.name} package - $${packageData.price_usd} USDT`,
    })

    return NextResponse.json({
      success: true,
      message: "Payment notification sent. Admin will verify your payment shortly.",
    })
  } catch (error) {
    console.error("[v0] Error sending payment notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
