import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const adminSecret = request.nextUrl.searchParams.get("adminSecret")
    const ADMIN_SECRET = process.env.ADMIN_SECRET

    // Verify admin secret
    if (!adminSecret || adminSecret !== ADMIN_SECRET) {
      console.log("[v0] Invalid admin secret attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize Supabase client at runtime
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    )

    console.log("[v0] Fetching all users with credits...")

    // Fetch all users
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, email, role, created_at")
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("[v0] Error fetching users:", usersError)
      throw usersError
    }

    // For each user, fetch their credits and transaction count
    const usersWithCredits = await Promise.all(
      (usersData || []).map(async (user) => {
        // Get credits
        const { data: creditData } = await supabase
          .from("user_credits")
          .select("credits")
          .eq("user_id", user.id)
          .single()

        // Get transaction count
        const { count } = await supabase
          .from("credit_transactions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          credits: creditData?.credits || 0,
          transactions_count: count || 0,
        }
      })
    )

    console.log("[v0] Retrieved", usersWithCredits.length, "users with credits")

    return NextResponse.json({
      users: usersWithCredits,
      total: usersWithCredits.length,
    })
  } catch (error) {
    console.error("[v0] Error in admin users endpoint:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
