import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { shouldAwardReward, selectRandomReward, trackUserAction, updateStreak, checkAchievements, updateLeaderboardRank } from "@/lib/gamification"

export async function POST(req: NextRequest) {
  try {
    const { user_id, action_type } = await req.json()

    if (!user_id || !action_type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Track action and award base points
    const basePoints = await trackUserAction(user_id, action_type)

    // Update streak
    const streak = await updateStreak(user_id)
    const streakMultiplier = streak.currentStreak <= 3 ? 1 : streak.currentStreak <= 7 ? 1.5 : streak.currentStreak <= 14 ? 2 : 3

    // Check for Variable Ratio reward trigger
    const { data: actionCount } = await supabase
      .from("user_actions")
      .select("id")
      .eq("user_id", user_id)

    const vrTriggered = shouldAwardReward(actionCount?.length || 1, 8) // VR(8)

    // Generate reward if triggered
    let reward = null
    if (vrTriggered) {
      reward = selectRandomReward(true)

      // Insert random reward record
      await supabase.from("random_rewards").insert({
        user_id,
        reward_type: reward.type,
        points_awarded: reward.pointsAwarded,
        credits_awarded: reward.creditsAwarded,
        unlocked_feature: reward.unlockedFeature,
      })

      // Apply reward to user
      if (reward.pointsAwarded > 0) {
        const { error } = await supabase
          .from("users")
          .update({
            total_points: Math.max(0, "total_points + " + reward.pointsAwarded),
          })
          .eq("id", user_id)

        if (error) console.error("Error awarding points:", error)
      }

      if (reward.creditsAwarded > 0) {
        const { error } = await supabase
          .from("user_credits")
          .update({
            amount: Math.max(0, "amount + " + reward.creditsAwarded),
          })
          .eq("user_id", user_id)

        if (error) console.error("Error awarding credits:", error)
      }
    }

    // Check for achievements
    const achievements = await checkAchievements(user_id, action_type)

    // Update leaderboard
    const rank = await updateLeaderboardRank(user_id, "all_time")

    return NextResponse.json({
      success: true,
      points: {
        base: basePoints,
        fromStreak: Math.round(basePoints * (streakMultiplier - 1)),
        total: Math.round(basePoints * streakMultiplier),
      },
      streak: {
        current: streak.currentStreak,
        best: streak.bestStreak,
        multiplier: streakMultiplier,
      },
      reward: vrTriggered ? reward : null,
      achievements: achievements.length > 0 ? achievements : null,
      leaderboardRank: rank,
    })
  } catch (error) {
    console.error("Error checking reward:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
