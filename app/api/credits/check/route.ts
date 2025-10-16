import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    let user
    let authError

    try {
      const result = await supabase.auth.getUser()
      user = result.data.user
      authError = result.error
    } catch (fetchError) {
      console.error("[CREDITS] Failed to fetch user from Supabase:", fetchError)
      // Return a temporary error that the client can retry
      return NextResponse.json(
        {
          error: "Session not ready",
          retry: true,
          message: "Please wait a moment and try again",
        },
        { status: 503 },
      )
    }

    if (authError || !user) {
      console.log("[CREDITS] No authenticated user:", authError?.message)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let creditData
    let creditError

    try {
      const result = await supabase.from("user_credits").select("credits").eq("user_id", user.id).maybeSingle()

      creditData = result.data
      creditError = result.error
    } catch (fetchError) {
      console.error("[CREDITS] Failed to fetch credits from database:", fetchError)
      return NextResponse.json(
        {
          error: "Database temporarily unavailable",
          retry: true,
        },
        { status: 503 },
      )
    }

    if (creditError) {
      console.error("[CREDITS] Error fetching credits:", creditError)
      return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
    }

    if (!creditData) {
      console.log("[CREDITS] No credit record found, creating default record for user:", user.id)

      // Check if user is admin
      const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle()

      const isAdmin = userData?.role === "admin"
      const defaultCredits = isAdmin ? 999999 : 50

      const { data: newCreditData, error: insertError } = await supabase
        .from("user_credits")
        .insert({
          user_id: user.id,
          credits: defaultCredits,
        })
        .select("credits")
        .single()

      if (insertError) {
        console.error("[CREDITS] Error creating credit record:", insertError)
        return NextResponse.json({ error: "Failed to create credit record" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        credits: newCreditData?.credits || defaultCredits,
        userId: user.id,
      })
    }

    return NextResponse.json({
      success: true,
      credits: creditData.credits || 0,
      userId: user.id,
    })
  } catch (error) {
    console.error("[CREDITS] Check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
