/**
 * WhatsApp Web API integration
 * Sends messages directly via WhatsApp Web without Twilio
 */

interface WhatsAppMessage {
  phone: string
  message: string
}

/**
 * Send a message via WhatsApp Web API
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  try {
    const apiUrl = process.env.WHATSAPP_API_URL || process.env.NEXT_PUBLIC_WHATSAPP_API_URL

    if (!apiUrl) {
      console.error("[v0] WhatsApp API URL not configured")
      return false
    }

    console.log("[v0] Sending WhatsApp message to:", phone)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone.replace(/\+/g, ""), // Remove + from phone number
        message,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] WhatsApp API error:", errorText)
      return false
    }

    console.log("[v0] WhatsApp message sent successfully")
    return true
  } catch (error) {
    console.error("[v0] Failed to send WhatsApp message:", error)
    return false
  }
}

/**
 * Send a payment notification via WhatsApp
 */
export async function sendPaymentNotification(
  userEmail: string,
  packageName: string,
  amount: number,
  credits: number,
  userId: string,
): Promise<boolean> {
  const message =
    `🔔 *New Payment Notification*\n\n` +
    `📧 Email: ${userEmail}\n` +
    `📦 Package: ${packageName}\n` +
    `💰 Amount: $${amount}\n` +
    `🎯 Credits: ${credits}\n` +
    `👤 User ID: ${userId}\n\n` +
    `⏰ Time: ${new Date().toLocaleString()}\n\n` +
    `Please verify the transaction and credit the account.`

  return sendWhatsAppMessage("56940946660", message)
}
