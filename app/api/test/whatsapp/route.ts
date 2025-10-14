import { type NextRequest, NextResponse } from "next/server"
import { sendWhatsAppNotification } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
  try {
    // Get admin secret from request
    const { adminSecret } = await request.json()

    // Verify admin secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Send test notification
    const result = await sendWhatsAppNotification(
      "🧪 Test Notification\n\n" +
        "This is a test message from your AI Image Enhancer payment system.\n\n" +
        "✅ WhatsApp notifications are working correctly!\n\n" +
        "You will receive alerts here when:\n" +
        "• Stripe payments are completed\n" +
        "• Crypto payments are verified\n\n" +
        "Test sent at: " +
        new Date().toLocaleString(),
    )

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
