import { createClient } from "@supabase/supabase-js"

export type ActionType = "upscale_2x" | "upscale_3x" | "upscale_4x" | "purchase_credits" | "referral"
export type RewardType = "bonus_credits" | "double_points" | "mystery" | "unlock_feature"

interface Reward {
  type: RewardType
  pointsAwarded: number
  creditsAwarded: number
  unlockedFeature?: string
  message: string
}

interface StreakData {
  currentStreak: number
  bestStreak: number
  lastActionDate: string | null
  frozenUntil: string | null
  freezeUsedThisWeek: boolean
}

// Variable Ratio Schedule - Calculate if user should get reward
export function shouldAwardReward(actionCount: number, vrRatio: number): boolean {
  // VR(5) = reward every 5 actions on average
  // Range: VR/2 to VR*1.5 (more realistic distribution)
  const min = Math.ceil(vrRatio / 2)
  const max = Math.ceil(vrRatio * 1.5)

  // Create weighted random threshold
  const randomThreshold = Math.floor(Math.random() * (max - min + 1)) + min

  return actionCount % randomThreshold === 0
}

// Select random reward based on probabilities
export function selectRandomReward(vrTriggered: boolean): Reward {
  if (!vrTriggered) {
    return {
      type: "bonus_credits",
      pointsAwarded: 0,
      creditsAwarded: 0,
      message: "Keep going!",
    }
  }

  const rewards: Array<{ type: RewardType; chance: number }> = [
    { type: "bonus_credits", chance: 0.4 },
    { type: "double_points", chance: 0.3 },
    { type: "mystery", chance: 0.2 },
    { type: "unlock_feature", chance: 0.1 },
  ]

  const rand = Math.random()
  let cumulative = 0

  for (const reward of rewards) {
    cumulative += reward.chance
    if (rand <= cumulative) {
      return generateRewardDetails(reward.type)
    }
  }

  return generateRewardDetails("mystery")
}

function generateRewardDetails(type: RewardType): Reward {
  const rewardMap: Record<RewardType, Reward> = {
    bonus_credits: {
      type: "bonus_credits",
      pointsAwarded: 50,
      creditsAwarded: 25,
      message: "🎁 +50 Points & 25 Free Credits!",
    },
    double_points: {
      type: "double_points",
      pointsAwarded: 100,
      creditsAwarded: 0,
      message: "⭐ Double Points for Next Upscale!",
    },
    mystery: {
      type: "mystery",
      pointsAwarded: 75,
      creditsAwarded: 10,
      message: "🎪 Mystery Reward Unlocked!",
    },
    unlock_feature: {
      type: "unlock_feature",
      pointsAwarded: 100,
      creditsAwarded: 0,
      unlockedFeature: "pro_preset",
      message: "🏆 Pro Preset Unlocked!",
    },
  }

  return rewardMap[type]
}

// Track user action and award points
export async function trackUserAction(userId: string, actionType: ActionType): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  )

  const pointsMap: Record<ActionType, number> = {
    upscale_2x: 10,
    upscale_3x: 25,
    upscale_4x: 50,
    purchase_credits: 100,
    referral: 500,
  }

  const points = pointsMap[actionType]

  // Insert action record
  const { error: actionError } = await supabase.from("user_actions").insert({
    user_id: userId,
    action_type: actionType,
    points_earned: points,
  })

  if (actionError) {
    console.error("Error tracking action:", actionError)
    return 0
  }

  // Update user's total points
  const { error: updateError } = await supabase
    .from("users")
    .update({
      total_points: Math.max(0, "total_points + " + points),
    })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating points:", updateError)
  }

  return points
}

// Check and manage streak
export async function updateStreak(userId: string): Promise<StreakData> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  )

  const today = new Date().toISOString().split("T")[0]

  // Get current streak
  const { data: streak, error: getError } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (getError && getError.code !== "PGRST116") {
    console.error("Error fetching streak:", getError)
    return { currentStreak: 0, bestStreak: 0, lastActionDate: null, frozenUntil: null, freezeUsedThisWeek: false }
  }

  // Create streak if doesn't exist
  if (!streak) {
    const { data: newStreak, error: createError } = await supabase
      .from("user_streaks")
      .insert({
        user_id: userId,
        current_streak: 1,
        best_streak: 1,
        last_action_date: today,
      })
      .select()
      .single()

    if (createError) console.error("Error creating streak:", createError)
    return newStreak || { currentStreak: 1, bestStreak: 1, lastActionDate: today, frozenUntil: null, freezeUsedThisWeek: false }
  }

  const lastActionDate = streak.last_action_date
  const lastDate = new Date(lastActionDate)
  const todayDate = new Date(today)
  const dayDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  let newStreak = streak.current_streak
  let frozenUntil = streak.frozen_until

  // Check if streak is frozen
  if (frozenUntil) {
    const freezeDate = new Date(frozenUntil)
    if (todayDate <= freezeDate) {
      // Streak is still frozen
      return {
        currentStreak: newStreak,
        bestStreak: streak.best_streak,
        lastActionDate,
        frozenUntil: frozenUntil,
        freezeUsedThisWeek: streak.freeze_used_this_week,
      }
    } else {
      // Unfreeze
      frozenUntil = null
    }
  }

  // Update streak logic
  if (dayDiff === 0) {
    // Same day, no change
  } else if (dayDiff === 1) {
    // Consecutive day, increment
    newStreak += 1
  } else {
    // Broke streak
    newStreak = 1
  }

  const bestStreak = Math.max(streak.best_streak, newStreak)

  // Update database
  const { error: updateError } = await supabase
    .from("user_streaks")
    .update({
      current_streak: newStreak,
      best_streak: bestStreak,
      last_action_date: today,
      frozen_until: frozenUntil,
    })
    .eq("user_id", userId)

  if (updateError) console.error("Error updating streak:", updateError)

  return {
    currentStreak: newStreak,
    bestStreak,
    lastActionDate: today,
    frozenUntil,
    freezeUsedThisWeek: streak.freeze_used_this_week,
  }
}

// Freeze streak for a week
export async function freezeStreak(userId: string): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  )

  const today = new Date()
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const thisWeekMonday = new Date(today)
  thisWeekMonday.setDate(today.getDate() - today.getDay() + 1) // Monday
  const thisWeekMondayStr = thisWeekMonday.toISOString().split("T")[0]

  const { error } = await supabase
    .from("user_streaks")
    .update({
      frozen_until: weekFromNow,
      freeze_used_this_week: true,
      freeze_used_date: thisWeekMondayStr,
    })
    .eq("user_id", userId)

  return !error
}

// Get streak multiplier
export function getStreakMultiplier(currentStreak: number): number {
  if (currentStreak <= 3) return 1
  if (currentStreak <= 7) return 1.5
  if (currentStreak <= 14) return 2
  return 3
}

// Check and unlock achievements
export async function checkAchievements(userId: string, actionType: ActionType): Promise<string[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  )

  const unlockedAchievements: string[] = []

  // Get user's action count
  const { data: actions } = await supabase
    .from("user_actions")
    .select("action_type")
    .eq("user_id", userId)

  if (!actions) return unlockedAchievements

  const upscaleCount = actions.filter((a) => a.action_type.includes("upscale")).length

  // Check achievements
  if (upscaleCount === 1) {
    unlockedAchievements.push("First Upscale")
  }
  if (upscaleCount === 5) {
    unlockedAchievements.push("5 in a Day")
  }
  if (upscaleCount === 50) {
    unlockedAchievements.push("Upscale Master")
  }
  if (upscaleCount === 1000) {
    unlockedAchievements.push("Legend Status")
  }

  // Insert achievements if new
  for (const achievement of unlockedAchievements) {
    const { error } = await supabase.from("achievements").insert({
      user_id: userId,
      achievement_type: "milestone",
      achievement_name: achievement,
      points_awarded: 100,
    })

    if (error && error.code !== "23505") {
      // 23505 = unique constraint (already exists)
      console.error("Error inserting achievement:", error)
    }
  }

  return unlockedAchievements
}

// Get leaderboard position
export async function updateLeaderboardRank(userId: string, period: "weekly" | "monthly" | "all_time"): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  )

  const { data: user } = await supabase
    .from("users")
    .select("total_points, country")
    .eq("id", userId)
    .single()

  if (!user) return 0

  // Calculate rank
  const { data: highScores } = await supabase
    .from("users")
    .select("id, total_points")
    .gt("total_points", user.total_points)

  const rank = (highScores?.length || 0) + 1

  // Update leaderboard
  const today = new Date()
  const weekNum = Math.ceil(today.getDate() / 7)

  const { error } = await supabase.from("leaderboards").upsert(
    {
      user_id: userId,
      total_points: user.total_points,
      week_number: period === "weekly" ? weekNum : undefined,
      month: period === "monthly" ? today.getMonth() : undefined,
      year: today.getFullYear(),
      rank,
      country: user.country,
      period,
    },
    { onConflict: "user_id,period" },
  )

  if (error) console.error("Error updating leaderboard:", error)

  return rank
}
