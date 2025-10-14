"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function TestWhatsAppPage() {
  const [adminSecret, setAdminSecret] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTest = async () => {
    if (!adminSecret) {
      setResult({ success: false, message: "Please enter the admin secret" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `✅ Success! WhatsApp notification sent. Check your phone at +56940946660`,
        })
      } else {
        setResult({
          success: false,
          message: `❌ Error: ${data.error || "Failed to send notification"}`,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">WhatsApp Notification Test</CardTitle>
            <CardDescription className="text-gray-400">
              Test the WhatsApp alert system for payment notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="adminSecret" className="text-white">
                Admin Secret
              </Label>
              <Input
                id="adminSecret"
                type="password"
                placeholder="Enter your admin secret"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <p className="text-sm text-gray-400">This is the ADMIN_SECRET environment variable you configured</p>
            </div>

            <Button
              onClick={handleTest}
              disabled={loading || !adminSecret}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Test WhatsApp Message"
              )}
            </Button>

            {result && (
              <Alert className={result.success ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"}>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription className={result.success ? "text-green-300" : "text-red-300"}>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-white font-semibold mb-2">What this test does:</h3>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>Sends a test WhatsApp message to +56940946660</li>
                <li>Verifies Twilio integration is working</li>
                <li>Confirms the notification format and content</li>
                <li>Tests the same system used for real payment alerts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
