import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = createAdminClient()

  try {
    console.log("[v0] Resetting admin password...")

    // Get the admin user
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      return NextResponse.json({ error: "Failed to list users" }, { status: 400 })
    }

    const adminUser = users?.users.find((u) => u.email === "admin@clarity.art")
    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 })
    }

    // Update the user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
      password: "N3uralia.2025",
    })

    if (updateError) {
      console.error("[v0] Error updating admin password:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    console.log("[v0] Admin password reset successfully")

    return NextResponse.json({
      success: true,
      message: "Admin password reset successfully",
      email: "admin@clarity.art",
      password: "N3uralia.2025",
    })
  } catch (error) {
    console.error("[v0] Reset admin password error:", error)
    return NextResponse.json({ error: "Failed to reset admin password" }, { status: 500 })
  }
}
