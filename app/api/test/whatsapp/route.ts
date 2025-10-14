import { type NextRequest, NextResponse } from "next/server"
import { sendWhatsAppNotification } from "@/lib/whatsapp"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Get admin secret from request
    const { adminSecret } = await request.json()

    // Verify admin secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const testMessage = `🧪 *WhatsApp Alert System Test*

✅ *Status:* Active and Working!

📱 *Notification Details:*
• Recipient: +56940946660
• System: AI Image Enhancer
• Test Time: ${new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" })}

💰 *You will receive alerts for:*
✓ Stripe payments (automatic)
✓ Crypto USDT payments (manual verification)

📊 *Alert Information Includes:*
• Payment amount & credits
• Package purchased
• User email
• Transaction ID

🎉 *Integration successful!* You're all set to receive payment notifications.`

    const result = await sendWhatsAppNotification(testMessage)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test WhatsApp notification sent successfully!",
        messageSid: result.messageSid,
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Test WhatsApp notification error:", error)
    return NextResponse.json({ error: "Failed to send test notification" }, { status: 500 })
  }
}
