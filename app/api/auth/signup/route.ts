import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    console.log("[v0] Creating user with admin client:", email)

    const adminClient = createAdminClient()

    // Create auth user with email confirmation bypassed
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        email_verified: true,
      },
    })

    if (authError) {
      console.error("[v0] Auth user creation error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    console.log("[v0] Auth user created:", authData.user.id)

    // Create user record in database with 5 free upscales
    const { error: userError } = await adminClient.from("users").insert({
      id: authData.user.id,
      email: authData.user.email,
      role: "user",
      free_upscales_available: 5, // New users get 5 free upscales
    })

    if (userError) {
      console.error("[v0] Database user creation error:", userError)
      // If user already exists, that's okay
      if (!userError.message.includes("duplicate key")) {
        return NextResponse.json({ error: userError.message }, { status: 500 })
      }
    }

    // Create credit record with default 50 credits
    const { error: creditError } = await adminClient.from("user_credits").insert({
      user_id: authData.user.id,
      credits: 50,
    })

    if (creditError) {
      console.error("[v0] Credit creation error:", creditError)
      // Don't fail if credits already exist
    }

    console.log("[v0] User setup complete:", authData.user.email)

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
