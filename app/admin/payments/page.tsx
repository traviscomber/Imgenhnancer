"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, RefreshCw } from "lucide-react"

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

  const fetchPendingPayments = async () => {
    if (!adminSecret) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/pending-payments?adminSecret=${encodeURIComponent(adminSecret)}`)

      if (response.status === 401) {
        setAuthenticated(false)
        return
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
      setAuthenticated(true)
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const approvePayment = async (transactionId: string) => {
    setApproving(transactionId)
    try {
      const response = await fetch("/api/admin/approve-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret, transactionId }),
      })

      if (response.ok) {
        // Refresh the list
        await fetchPendingPayments()
      }
    } catch (error) {
      console.error("Error approving payment:", error)
    } finally {
      setApproving(null)
    }
  }

  useEffect(() => {
    if (authenticated) {
      fetchPendingPayments()
    }
  }, [authenticated])

  if (!authenticated) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
            <CardDescription>Enter your admin secret to access the payment panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin Secret"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchPendingPayments()}
            />
            <Button onClick={fetchPendingPayments} className="w-full">
              Login
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
