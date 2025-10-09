import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Info, User, Sparkles } from "lucide-react"

interface FacialAnalysis {
  hasFace: boolean
  gender: string
  ageRange: string
  expression: string
  quality: string
  features: string[]
}

interface FacialAnalysisCardProps {
  analysis: FacialAnalysis
  selectedCategory: string
  selectedPreset: string
}

export function FacialAnalysisCard({ analysis, selectedCategory, selectedPreset }: FacialAnalysisCardProps) {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "text-green-400 bg-green-500/20"
      case "good":
        return "text-blue-400 bg-blue-500/20"
      case "fair":
        return "text-yellow-400 bg-yellow-500/20"
      case "poor":
        return "text-red-400 bg-red-500/20"
      default:
        return "text-gray-400 bg-gray-500/20"
    }
  }

  const getRecommendations = () => {
    const recommendations: string[] = []

    if (!analysis.hasFace) {
      if (selectedCategory === "faces" || selectedCategory === "avatar") {
        recommendations.push("⚠️ No face detected - consider switching to Creative or Experimental mode")
      }
    }

    if (analysis.quality === "poor") {
      recommendations.push("💡 Low quality detected - enhancement will help but results may vary")
    }

    if (analysis.quality === "excellent") {
      recommendations.push("✨ Excellent quality - perfect for enhancement!")
    }

    if (selectedCategory === "avatar") {
      recommendations.push(`🎭 Avatar mode will transform this ${analysis.gender} face into ${selectedPreset} style`)
    }

    if (selectedCategory === "faces" && analysis.hasFace) {
      recommendations.push("👤 Face preservation mode active - features will be maintained")
    }

    return recommendations
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Sparkles className="w-4 h-4 text-purple-400" />
          AI Facial Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Face Detection */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Face Detected:</span>
          <Badge className={analysis.hasFace ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
            {analysis.hasFace ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Yes
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                No
              </>
            )}
          </Badge>
        </div>

        {analysis.hasFace && (
          <>
            {/* Gender */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Gender:</span>
              <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                <User className="w-3 h-3 mr-1" />
                {analysis.gender}
              </Badge>
            </div>

            {/* Age Range */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Age Range:</span>
              <Badge className="bg-purple-500/20 text-purple-400">{analysis.ageRange}</Badge>
            </div>

            {/* Expression */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Expression:</span>
              <Badge className="bg-pink-500/20 text-pink-400 capitalize">{analysis.expression}</Badge>
            </div>

            {/* Quality */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Image Quality:</span>
              <Badge className={`${getQualityColor(analysis.quality)} capitalize`}>{analysis.quality}</Badge>
            </div>

            {/* Features */}
            {analysis.features.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-gray-400">Notable Features:</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Recommendations */}
        {getRecommendations().length > 0 && (
          <div className="pt-3 border-t border-purple-500/20 space-y-2">
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <Info className="w-4 h-4" />
              <span className="font-medium">Recommendations:</span>
            </div>
            <div className="space-y-1">
              {getRecommendations().map((rec, idx) => (
                <p key={idx} className="text-xs text-gray-400 pl-6">
                  {rec}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
