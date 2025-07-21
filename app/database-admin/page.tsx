import type { Metadata } from "next"
import DatabaseHealthDashboard from "@/components/database/health-dashboard"

export const metadata: Metadata = {
  title: "Database Administration",
  description: "Manage and monitor your database health",
}

export default function DatabaseAdminPage() {
  return (
    <div className="container mx-auto py-6">
      <DatabaseHealthDashboard />
    </div>
  )
}
