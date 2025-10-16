"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Transaction {
  id: string
  user_id: string
  amount: number
  description: string
  created_at: string
  operation: string
  users: {
    email: string
  }
}

export default function AdminPaymentsPage() {
  const [adminSecret, setAdminSecret] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [approving, setApproving] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPendingPayments = async () => {
    if (!adminSecret.trim()) {
      setError("Please enter the admin secret")
      return
    }

    console.log("[v0] Attempting admin login")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/pending-payments?adminSecret=${encodeURIComponent(adminSecret)}`)

      console.log("[v0] Admin login response status:", response.status)

      if (response.status === 401) {
        setAuthenticated(false)
        setError("Invalid admin secret. Please check your credentials.")
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Fetched transactions:", data.transactions?.length || 0)

      setTransactions(data.transactions || [])
      setAuthenticated(true)
      setError(null)
    } catch (error) {
      console.error("[v0] Error fetching payments:", error)
      setError("Failed to connect to server. Please try again.")
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const approvePayment = async (transactionId: string) => {
    setApproving(transactionId)
    setError(null)

    try {
      const response = await fetch("/api/admin/approve-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret, transactionId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to approve payment")
      }

      // Refresh the list
      await fetchPendingPayments()
    } catch (error) {
      console.error("[v0] Error approving payment:", error)
      setError(error instanceof Error ? error.message : "Failed to approve payment")
    } finally {
      setApproving(null)
    }
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
            <CardDescription>Enter your admin secret to access the payment panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Input
              type="password"
              placeholder="Admin Secret"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchPendingPayments()}
            />
            <Button onClick={fetchPendingPayments} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pending Payments</h1>
          <p className="text-muted-foreground">Review and approve crypto payment notifications</p>
        </div>
        <Button onClick={fetchPendingPayments} disabled={loading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">No pending payments to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="py-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{transaction.users.email}</p>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">Credits: {transaction.amount}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => approvePayment(transaction.id)}
                    disabled={approving === transaction.id}
                    className="ml-4"
                  >
                    {approving === transaction.id ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
