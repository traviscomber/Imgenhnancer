import { createClient } from "@supabase/supabase-js"

export async function checkFreeUpscaleAvailability(userId: string): Promise<boolean> {
  if (!userId) return false

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_ANON_KEY || "",
  )

  // Get current week start (Monday)
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const weekStart = new Date(today.setDate(diff))
  const weekStartStr = weekStart.toISOString().split("T")[0]

  // Check existing usage
  const { data: usage } = await supabase
    .from("free_upscale_usage")
    .select("upscales_used")
    .eq("user_id", userId)
    .eq("week_start", weekStartStr)
    .single()

  // If no record or upscales_used < 1, it's available
  return !usage || usage.upscales_used < 1
}

export function getWeeklyResetTime(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const weekStart = new Date(today.setDate(diff))
  const nextWeekStart = new Date(weekStart)
  nextWeekStart.setDate(nextWeekStart.getDate() + 7)
  return nextWeekStart
}
