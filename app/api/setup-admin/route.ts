import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = createAdminClient()

  try {
    console.log("[v0] Setting up admin user...")

    // Create admin user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@clarity.art",
      password: "N3uralia.2025",
      email_confirm: true,
    })

    if (authError) {
      console.error("[v0] Error creating admin auth user:", authError)
      if (authError.message.includes("already registered")) {
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const adminUser = existingUser?.users.find((u) => u.email === "admin@clarity.art")

        if (adminUser) {
          console.log("[v0] Admin auth user already exists, setting up database records...")
          // Continue with database setup using existing user ID
          await setupDatabaseRecords(supabase, adminUser.id)
          return NextResponse.json({
            success: true,
            message: "Admin user already exists and is ready to use",
            email: "admin@clarity.art",
          })
        }
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log("[v0] Admin auth user created:", authData.user.id)

    await setupDatabaseRecords(supabase, authData.user.id)

    console.log("[v0] Admin user setup complete")

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      email: "admin@clarity.art",
    })
  } catch (error) {
    console.error("[v0] Setup admin error:", error)
    return NextResponse.json({ error: "Failed to setup admin user" }, { status: 500 })
  }
}

async function setupDatabaseRecords(supabase: any, userId: string) {
  const { data: existingUser } = await supabase.from("users").select("id").eq("id", userId).maybeSingle()

  if (existingUser) {
    // Update existing user
    const { error: userError } = await supabase
      .from("users")
      .update({
        email: "admin@clarity.art",
        role: "admin",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (userError) {
      console.error("[v0] Error updating user record:", userError)
      throw userError
    }
  } else {
    // Insert new user
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      email: "admin@clarity.art",
      role: "admin",
    })

    if (userError) {
      console.error("[v0] Error creating user record:", userError)
      throw userError
    }
  }

  const { data: existingCredits } = await supabase
    .from("user_credits")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle()

  if (existingCredits) {
    // Update existing credits
    const { error: creditsError } = await supabase
      .from("user_credits")
      .update({
        credits: 999999,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (creditsError) {
      console.error("[v0] Error updating admin credits:", creditsError)
      throw creditsError
    }
  } else {
    // Insert new credits
    const { error: creditsError } = await supabase.from("user_credits").insert({
      user_id: userId,
      credits: 999999,
    })

    if (creditsError) {
      console.error("[v0] Error setting admin credits:", creditsError)
      throw creditsError
    }
  }

  console.log("[v0] Database records setup complete for user:", userId)
}
