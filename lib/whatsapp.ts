import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886" // Twilio Sandbox number

let client: ReturnType<typeof twilio> | null = null

function getTwilioClient() {
  if (!accountSid || !authToken) {
    console.error("[v0] Twilio credentials not configured")
    return null
  }

  if (!client) {
    client = twilio(accountSid, authToken)
  }

  return client
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
  const client = getTwilioClient()

  if (!client) {
    console.error("[v0] Cannot send WhatsApp notification: Twilio not configured")
    return false
  }

  try {
    const message = formatPaymentMessage(notification)

    await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${phoneNumber}`,
      body: message,
    })

    console.log("[v0] WhatsApp notification sent successfully to", phoneNumber)
    return true
  } catch (error) {
    console.error("[v0] Failed to send WhatsApp notification:", error)
    return false
  }
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
  const client = getTwilioClient()

  if (!client) {
    return {
      success: false,
      error: "Twilio not configured. Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.",
    }
  }

  try {
    const result = await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${phoneNumber}`,
      body: message,
    })

    console.log("[v0] WhatsApp notification sent successfully, SID:", result.sid)
    return {
      success: true,
      messageSid: result.sid,
    }
  } catch (error) {
    console.error("[v0] Failed to send WhatsApp notification:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function sendWhatsAppNotification(
  message: string,
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  // Default phone number for notifications
  const defaultPhoneNumber = "+56940946660"
  return sendCustomWhatsAppNotification(defaultPhoneNumber, message)
}
