"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DemoSetupPage() {
  const [adminSecret, setAdminSecret] = useState("")
  const [email, setEmail] = useState("n3uralia@gmail.com")
  const [initialCredits, setInitialCredits] = useState("500")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleSetup = async () => {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/admin/setup-demo-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminSecret,
          email,
          initialCredits: Number.parseInt(initialCredits),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to setup demo account")
      } else {
        setResult(data)
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Demo Account Setup</CardTitle>
            <CardDescription>Create or update demo accounts with initial credits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminSecret">Admin Secret</Label>
              <Input
                id="adminSecret"
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter admin secret"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits">Initial Credits</Label>
              <Input
                id="credits"
                type="number"
                value={initialCredits}
                onChange={(e) => setInitialCredits(e.target.value)}
                placeholder="500"
              />
            </div>

            <Button onClick={handleSetup} disabled={loading} className="w-full">
              {loading ? "Setting up..." : "Setup Demo Account"}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Demo Account Created Successfully!</p>
                    <p>Email: {result.user.email}</p>
                    <p>Password: {result.user.password}</p>
                    <p>Credits: {result.user.credits}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      User can now login and test the system. Credits can be topped up via crypto payment.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Crypto Payment Testing</CardTitle>
            <CardDescription>How to test real topups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Login with the demo account credentials</p>
            <p>2. Go to the credits page and click "Purchase"</p>
            <p>3. Select a package and view the crypto payment details</p>
            <p>4. Send USDT to the displayed address on Tron network</p>
            <p>
              5. Call the verification webhook at <code>/api/admin/verify-crypto-payment</code> with the transaction
              details
            </p>
            <p className="text-muted-foreground mt-4">
              Webhook URL: <code>POST /api/admin/verify-crypto-payment</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
