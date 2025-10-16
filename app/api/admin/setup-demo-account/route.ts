import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { adminSecret, email, initialCredits } = await request.json()

    // Verify admin secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const credits = initialCredits || 500 // Default 500 credits for demo
    const demoPassword = "Demo2024!" // Default demo password

    console.log("[v0] Setting up demo account:", email)

    const adminClient = createAdminClient()

    // Check if user already exists
    const { data: existingUser } = await adminClient.from("users").select("id").eq("email", email).single()

    let userId: string

    if (existingUser) {
      console.log("[v0] User already exists, updating credits:", existingUser.id)
      userId = existingUser.id

      // Update existing user's credits
      const { error: updateError } = await adminClient
        .from("user_credits")
        .update({ credits, updated_at: new Date().toISOString() })
        .eq("user_id", userId)

      if (updateError) {
        console.error("[v0] Error updating credits:", updateError)
        return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
      }
    } else {
      // Create new user
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          email_verified: true,
          is_demo: true,
        },
      })

      if (authError) {
        console.error("[v0] Auth user creation error:", authError)
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }

      if (!authData.user) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }

      userId = authData.user.id
      console.log("[v0] Demo user created:", userId)

      // Create user record
      const { error: userError } = await adminClient.from("users").insert({
        id: userId,
        email,
        role: "user",
      })

      if (userError && !userError.message.includes("duplicate key")) {
        console.error("[v0] Database user creation error:", userError)
        return NextResponse.json({ error: userError.message }, { status: 500 })
      }

      // Create credit record
      const { error: creditError } = await adminClient.from("user_credits").insert({
        user_id: userId,
        credits,
      })

      if (creditError) {
        console.error("[v0] Credit creation error:", creditError)
        return NextResponse.json({ error: "Failed to create credits" }, { status: 500 })
      }
    }

    // Add transaction record for demo credits
    await adminClient.from("credit_transactions").insert({
      user_id: userId,
      amount: credits,
      type: "purchase",
      operation: "demo_setup",
      description: `Demo account setup with ${credits} credits`,
    })

    console.log("[v0] Demo account setup complete")

    return NextResponse.json(
      {
        message: "Demo account created successfully",
        user: {
          id: userId,
          email,
          credits,
          password: demoPassword,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Demo setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
