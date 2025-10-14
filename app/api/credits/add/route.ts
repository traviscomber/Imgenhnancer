import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amount, description, type = "purchase" } = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current credits
    const { data: creditData } = await supabase.from("user_credits").select("credits").eq("user_id", user.id).single()

    const currentCredits = creditData?.credits || 0

    // Add credits
    const { error: updateError } = await supabase.from("user_credits").upsert({
      user_id: user.id,
      credits: currentCredits + amount,
    })

    if (updateError) {
      console.error("[CREDITS] Error adding credits:", updateError)
      return NextResponse.json({ error: "Failed to add credits" }, { status: 500 })
    }

    // Log transaction
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount,
      type,
      description: description || `Added ${amount} credits`,
    })

    return NextResponse.json({
      success: true,
      creditsAdded: amount,
      totalCredits: currentCredits + amount,
    })
  } catch (error) {
    console.error("[CREDITS] Add error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
