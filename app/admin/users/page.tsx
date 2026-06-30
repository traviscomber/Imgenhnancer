"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserWithCredits {
  id: string
  email: string
  role: string
  created_at: string
  credits: number
  transactions_count: number
}

export default function AdminUsersPage() {
  const [adminSecret, setAdminSecret] = useState("")
  const [users, setUsers] = useState<UserWithCredits[]>([])
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchEmail, setSearchEmail] = useState("")

  const fetchUsers = async () => {
    if (!adminSecret.trim()) {
      setError("Please enter the admin secret")
      return
    }

    console.log("[v0] Fetching users with admin secret")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users?adminSecret=${encodeURIComponent(adminSecret)}`)

      console.log("[v0] Users fetch response status:", response.status)

      if (response.status === 401) {
        setAuthenticated(false)
        setError("Invalid admin secret. Please check your credentials.")
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Fetched users:", data.users?.length || 0)

      setUsers(data.users || [])
      setAuthenticated(true)
      setError(null)
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
      setError("Failed to connect to server. Please try again.")
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  )

  const totalCredits = users.reduce((sum, user) => sum + user.credits, 0)
  const activeUsers = users.length
  const totalTransactions = users.reduce((sum, user) => sum + user.transactions_count, 0)

  const exportToCSV = () => {
    const headers = ["Email", "Role", "Credits", "Transactions", "Created At"]
    const rows = filteredUsers.map(user => [
      user.email,
      user.role,
      user.credits,
      user.transactions_count,
      new Date(user.created_at).toLocaleDateString()
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Admin - Users & Credits</CardTitle>
            <CardDescription>Enter admin secret to access user data</CardDescription>
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
              onKeyPress={(e) => e.key === "Enter" && fetchUsers()}
            />
            <Button onClick={fetchUsers} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Loading..." : "Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users & Credits</h1>
          <p className="text-gray-400">Manage users and view their credit balances</p>
        </div>
        <Button onClick={() => setAuthenticated(false)} variant="outline">
          Logout
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-gray-400">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-gray-400">Operations performed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Export */}
      <div className="flex gap-3">
        <Input
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="flex-1"
        />
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button onClick={fetchUsers} variant="outline" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Refresh
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Credits</th>
                  <th className="text-left py-3 px-4 font-semibold">Transactions</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                      <td className="py-3 px-4 font-medium">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{user.credits.toLocaleString()}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{user.transactions_count}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={user.role === "admin" ? "default" : "secondary"}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
