import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("id", userId).maybeSingle()

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 })
    }

    // Create user record with default 100 credits
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      email: email,
      role: "user",
    })

    if (userError) {
      console.error("[v0] Error creating user:", userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Create credit record
    const { error: creditError } = await supabase.from("user_credits").insert({
      user_id: userId,
      credits: 100, // Default credits for new users
    })

    if (creditError) {
      console.error("[v0] Error creating credits:", creditError)
      // Don't fail the request if credits creation fails
    }

    return NextResponse.json({ message: "User created successfully" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in create user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
