import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    let supabase
    
    try {
      supabase = await createClient()
    } catch (clientError) {
      console.error("[CREDITS] Failed to create Supabase client:", clientError)
      return NextResponse.json(
        {
          success: false,
          error: "Service temporarily unavailable",
          retry: true,
          credits: 0,
        },
        { status: 503 }
      )
    }

    if (!supabase) {
      console.error("[CREDITS] Supabase client is null")
      return NextResponse.json(
        {
          success: false,
          error: "Service not configured",
          retry: false,
          credits: 0,
        },
        { status: 503 }
      )
    }

    let user
    let authError

    try {
      const result = await supabase.auth.getUser()
      user = result.data?.user
      authError = result.error
    } catch (fetchError) {
      console.error("[CREDITS] Failed to fetch user from Supabase:", fetchError)
      return NextResponse.json(
        {
          success: false,
          error: "Session not ready",
          retry: true,
          credits: 0,
        },
        { status: 503 }
      )
    }

    if (authError || !user) {
      console.log("[CREDITS] No authenticated user:", authError?.message)
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          credits: 0,
        },
        { status: 401 }
      )
    }

    let creditData
    let creditError

    try {
      const result = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle()

      creditData = result.data
      creditError = result.error
    } catch (fetchError) {
      console.error("[CREDITS] Failed to fetch credits from database:", fetchError)
      return NextResponse.json(
        {
          success: false,
          error: "Database temporarily unavailable",
          retry: true,
          credits: 0,
        },
        { status: 503 }
      )
    }

    if (creditError) {
      console.error("[CREDITS] Error fetching credits:", creditError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch credits",
          credits: 0,
        },
        { status: 500 }
      )
    }

    if (!creditData) {
      console.log("[CREDITS] No credit record found, creating default record for user:", user.id)

      // Check if user is admin
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

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
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create credit record",
            credits: defaultCredits,
          },
          { status: 500 }
        )
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
    console.error("[CREDITS] Unhandled error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        credits: 0,
      },
      { status: 500 }
    )
  }
}
