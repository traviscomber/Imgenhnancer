import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminSecret = searchParams.get("adminSecret")
    const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-me-in-production"

    // Verify admin secret
    if (adminSecret !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize Supabase client at runtime
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch pending transactions
    const { data: transactions, error } = await supabase
      .from("credit_transactions")
      .select(
        `
        *,
        users!inner(email)
      `,
      )
      .eq("operation", "pending_purchase")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Error fetching pending payments:", error)
    return NextResponse.json({ error: "Failed to fetch pending payments" }, { status: 500 })
  }
}
