import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("[v0] Logging in user:", email)

    const supabase = await createClient()

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[v0] Login error:", error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.user) {
      console.error("[v0] No user returned from login")
      return NextResponse.json({ error: "Login failed" }, { status: 401 })
    }

    console.log("[v0] User logged in successfully:", data.user.id)

    // Fetch user profile from database
    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (userError) {
      console.warn("[v0] Could not fetch user profile:", userError)
    }

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: data.user.id,
          email: data.user.email,
          role: userProfile?.role || "user",
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Login API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
