import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { calculateCreditsNeeded } from "@/lib/credits"

export async function POST(request: Request) {
  try {
    const { amount, operation, upscaleFactor, imageId, description } = await request.json()

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

    let creditsNeeded: number
    if (amount !== undefined && amount !== null) {
      creditsNeeded = amount
    } else if (operation) {
      creditsNeeded = calculateCreditsNeeded(operation, upscaleFactor)
    } else {
      return NextResponse.json({ error: "Must provide either amount or operation" }, { status: 400 })
    }

    if (creditsNeeded === 0) {
      return NextResponse.json({ success: true, creditsDeducted: 0 })
    }

    // Get current credits
    const { data: creditData, error: fetchError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single()

    if (fetchError) {
      console.error("[CREDITS] Error fetching credits:", fetchError)
      return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
    }

    const currentCredits = creditData?.credits || 0

    // Check if user has enough credits
    if (currentCredits < creditsNeeded) {
      return NextResponse.json(
        { error: "Insufficient credits", required: creditsNeeded, available: currentCredits },
        { status: 402 },
      )
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ credits: currentCredits - creditsNeeded })
      .eq("user_id", user.id)

    if (updateError) {
      console.error("[CREDITS] Error updating credits:", updateError)
      return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 })
    }

    const { error: transactionError } = await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -creditsNeeded,
      type: "usage",
      description: description || `${operation || "Enhancement"} operation`,
      image_id: imageId,
      operation: operation || "enhance",
    })

    if (transactionError) {
      console.error("[CREDITS] Error creating transaction:", transactionError)
      // Don't fail the request if transaction logging fails
    }

    return NextResponse.json({
      success: true,
      creditsDeducted: creditsNeeded,
      remainingCredits: currentCredits - creditsNeeded,
    })
  } catch (error) {
    console.error("[CREDITS] Deduct error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
