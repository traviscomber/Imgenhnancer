"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, CreditCard, Settings } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 mt-2">Manage your application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users Management */}
        <Card className="hover:border-amber-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-amber-500" />
              <div>
                <CardTitle>Users & Credits</CardTitle>
                <CardDescription>View all users and their credit balances</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Payments Management */}
        <Card className="hover:border-amber-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-amber-500" />
              <div>
                <CardTitle>Payments</CardTitle>
                <CardDescription>View and approve pending payments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/payments">
              <Button className="w-full">Manage Payments</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Demo Setup */}
        <Card className="hover:border-amber-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-amber-500" />
              <div>
                <CardTitle>Demo Setup</CardTitle>
                <CardDescription>Initialize demo data for testing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/demo-setup">
              <Button className="w-full">Setup Demo</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
