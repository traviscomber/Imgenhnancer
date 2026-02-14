"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Flame, Sparkles, TrendingUp, Zap } from "lucide-react"

export interface UserGameStats {
  totalPoints: number
  level: number
  streakDays: number
  badges: number
  nextLevelPoints: number
  currentLevelPoints: number
  dailyChallengesCompleted: number
  spinsAvailable: number
}

export interface GameStats {
  points: UserGameStats
  streaks: {
    current: number
    longest: number
    nextResetDate: string | null
  }
  dailyChallenges: Array<{
    id: string
    name: string
    progress: number
    target: number
    completed: boolean
  }>
  badges: Array<{
    id: string
    name: string
    rarity: "common" | "rare" | "epic" | "legendary"
    earnedAt: string
  }>
}

export function RewardsDashboard({ stats }: { stats: GameStats }) {
  const [showLuckySpin, setShowLuckySpin] = useState(false)
  const [spinResult, setSpinResult] = useState<any>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const progressToNextLevel = (
    (stats.points.currentLevelPoints /
      (stats.points.nextLevelPoints - stats.points.currentLevelPoints)) *
    100
  )

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-900"
      case "rare":
        return "bg-blue-100 text-blue-900"
      case "epic":
        return "bg-purple-100 text-purple-900"
      case "legendary":
        return "bg-amber-100 text-amber-900"
      default:
        return "bg-gray-100 text-gray-900"
    }
  }

  const handleLuckySpin = async () => {
    setIsSpinning(true)
    // Simulate spin animation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSpinResult({
      name: "50 Bonus Points",
      type: "bonus_points",
      rarity: "rare",
    })
    setIsSpinning(false)
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Level Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{stats.points.level}</div>
            <Progress value={progressToNextLevel} className="mt-2 h-2" />
            <p className="text-xs text-amber-700 mt-1">
              {stats.points.currentLevelPoints.toLocaleString()} / {stats.points.nextLevelPoints.toLocaleString()} pts
            </p>
          </CardContent>
        </Card>

        {/* Points Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.points.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-blue-700 mt-2">Total earned</p>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-red-600" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{stats.streaks.current} days</div>
            <p className="text-xs text-red-700 mt-2">Best: {stats.streaks.longest} days</p>
          </CardContent>
        </Card>

        {/* Badges Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-purple-600" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stats.badges.length}</div>
            <p className="text-xs text-purple-700 mt-2">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Daily Challenges
          </CardTitle>
          <CardDescription>Complete challenges for bonus points and rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.dailyChallenges.map((challenge) => (
            <div key={challenge.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{challenge.name}</span>
                {challenge.completed && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    ✓ Complete
                  </Badge>
                )}
              </div>
              <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
              <p className="text-xs text-gray-600">
                {challenge.progress} / {challenge.target}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Lucky Spin Section */}
      <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Lucky Spin
          </CardTitle>
          <CardDescription>Earn spins by completing activities, then spin for random rewards!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-purple-200">
            <span className="font-semibold text-purple-900">Spins Available:</span>
            <span className="text-2xl font-bold text-purple-700">{stats.points.spinsAvailable}</span>
          </div>

          {stats.points.spinsAvailable > 0 ? (
            <>
              <Button
                onClick={handleLuckySpin}
                disabled={isSpinning}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-lg"
              >
                {isSpinning ? "🎡 Spinning..." : "🎡 Spin Now!"}
              </Button>

              {spinResult && (
                <div className="bg-white rounded-lg p-4 border-2 border-green-400 space-y-2">
                  <p className="font-semibold text-green-700">You Won!</p>
                  <p className="text-lg font-bold text-green-900">{spinResult.name}</p>
                  <Badge className={`${getRarityColor(spinResult.rarity)}`}>{spinResult.rarity}</Badge>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center text-gray-600">
              <p>Complete activities to earn spins!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Badges */}
      {stats.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Recent Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.badges.slice(0, 8).map((badge) => (
                <div key={badge.id} className={`p-3 rounded-lg text-center ${getRarityColor(badge.rarity)}`}>
                  <Award className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs font-semibold">{badge.name}</p>
                  <p className="text-xs opacity-75">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
