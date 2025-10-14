const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappFromEnv = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"
// Remove whatsapp: prefix if it exists, then add it back to ensure consistent formatting
const whatsappFrom = whatsappFromEnv.startsWith("whatsapp:") ? whatsappFromEnv : `whatsapp:${whatsappFromEnv}`

async function sendTwilioMessage(
  to: string,
  body: string,
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  if (!accountSid || !authToken) {
    return {
      success: false,
      error:
        "Twilio credentials not configured. Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.",
    }
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: whatsappFrom,
        To: to,
        Body: body,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Twilio API error:", errorData)
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      }
    }

    const data = await response.json()
    console.log("[v0] WhatsApp notification sent successfully, SID:", data.sid)
    return {
      success: true,
      messageSid: data.sid,
    }
  } catch (error) {
    console.error("[v0] Failed to send WhatsApp notification:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export interface PaymentNotification {
  type: "stripe" | "crypto"
  amount: number
  currency: string
  credits: number
  packageName: string
  userEmail?: string
  transactionId?: string
}

export async function sendPaymentNotification(
  phoneNumber: string,
  notification: PaymentNotification,
): Promise<boolean> {
  console.log("[v0] Sending payment notification to:", phoneNumber)
  console.log("[v0] Notification details:", JSON.stringify(notification, null, 2))

  const message = formatPaymentMessage(notification)
  console.log("[v0] Formatted message:", message)

  const result = await sendTwilioMessage(`whatsapp:${phoneNumber}`, message)

  if (result.success) {
    console.log("[v0] WhatsApp notification sent successfully, SID:", result.messageSid)
  } else {
    console.error("[v0] WhatsApp notification failed:", result.error)
  }

  return result.success
}

function formatPaymentMessage(notification: PaymentNotification): string {
  const emoji = notification.type === "stripe" ? "💳" : "₿"
  const paymentType = notification.type === "stripe" ? "Stripe" : "Crypto"

  let message = `${emoji} *New Payment Received!*\n\n`
  message += `Payment Type: ${paymentType}\n`
  message += `Package: ${notification.packageName}\n`
  message += `Amount: ${notification.currency} ${notification.amount}\n`
  message += `Credits: ${notification.credits}\n`

  if (notification.userEmail) {
    message += `User: ${notification.userEmail}\n`
  }

  if (notification.transactionId) {
    message += `Transaction: ${notification.transactionId}\n`
  }

  message += `\nTime: ${new Date().toLocaleString()}`

  return message
}

export async function sendCustomWhatsAppNotification(
  phoneNumber: string,
  message: string,
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  return sendTwilioMessage(`whatsapp:${phoneNumber}`, message)
}

export async function sendWhatsAppNotification(
  message: string,
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const defaultPhoneNumber = "+56940946660"
  return sendCustomWhatsAppNotification(defaultPhoneNumber, message)
}
