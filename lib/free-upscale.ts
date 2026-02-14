import { createClient } from "@supabase/supabase-js"

export async function checkFreeUpscaleAvailability(userId: string): Promise<{
  available: boolean
  type: "initial" | "monthly"
  remaining: number
  nextResetDate: Date | null
}> {
  if (!userId) {
    return { available: false, type: "initial", remaining: 0, nextResetDate: null }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  )

  // Get user's free upscale allocation
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("free_upscales_available, last_monthly_free_upscale")
    .eq("id", userId)
    .single()

  if (userError || !userData) {
    return { available: false, type: "initial", remaining: 0, nextResetDate: null }
  }

  const { free_upscales_available, last_monthly_free_upscale } = userData

  // Check if monthly free upscale is available
  const today = new Date()
  const lastUsedDate = last_monthly_free_upscale ? new Date(last_monthly_free_upscale) : null

  let monthlyAvailable = false
  let nextMonthlyReset: Date | null = null

  if (!lastUsedDate) {
    // Never used monthly free upscale
    monthlyAvailable = true
  } else {
    // Check if a month has passed
    const nextMonth = new Date(lastUsedDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    if (today >= nextMonth) {
      monthlyAvailable = true
    } else {
      nextMonthlyReset = nextMonth
    }
  }

  // Initial free upscales available (out of 5)
  const initialAvailable = free_upscales_available > 0

  return {
    available: initialAvailable || monthlyAvailable,
    type: initialAvailable ? "initial" : monthlyAvailable ? "monthly" : "initial",
    remaining: free_upscales_available,
    nextResetDate: monthlyAvailable ? null : nextMonthlyReset,
  }
}

export async function useFreeUpscale(
  userId: string,
  type: "initial" | "monthly",
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  )

  if (type === "initial") {
    // Deduct from initial free upscales (max 5 per user)
    const { data: currentUser } = await supabase
      .from("users")
      .select("free_upscales_available")
      .eq("id", userId)
      .single()

    if (!currentUser || currentUser.free_upscales_available <= 0) {
      return { success: false, error: "No free upscales available" }
    }

    const newCount = Math.max(0, currentUser.free_upscales_available - 1)

    const { error } = await supabase.from("users").update({ free_upscales_available: newCount }).eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, remaining: newCount }
  } else {
    // Mark monthly free upscale as used
    const today = new Date().toISOString()
    const { error } = await supabase.from("users").update({ last_monthly_free_upscale: today }).eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, remaining: 0 }
  }
}

export function getNextMonthlyResetDate(lastUsedDate: Date | null): Date {
  if (!lastUsedDate) {
    return new Date() // Available now
  }
  const nextMonth = new Date(lastUsedDate)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  return nextMonth
}
