"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { analyzeImage, type ImageAnalysisResult } from "@/utils/image-analyzer"
import { Sparkles, TrendingUp, Check } from "lucide-react"

interface SmartRecommendationsProps {
  uploadedFile: File | null
  onApplyRecommendation: (preset: string) => void
  currentPreset: string | null
}

export function SmartRecommendations({
  uploadedFile,
  onApplyRecommendation,
  currentPreset,
}: SmartRecommendationsProps) {
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uploadedFile) {
      setAnalysis(null)
      setError(null)
      return
    }

    const performAnalysis = async () => {
      setIsAnalyzing(true)
      setError(null)

      try {
        console.log("🔍 Starting AI analysis for:", uploadedFile.name)
        const result = await analyzeImage(uploadedFile)
        setAnalysis(result)
        console.log("✅ Analysis complete:", result)
      } catch (err) {
        console.error("❌ Analysis failed:", err)
        setError(err instanceof Error ? err.message : "Failed to analyze image")
      } finally {
        setIsAnalyzing(false)
      }
    }

    performAnalysis()
  }, [uploadedFile])

  if (!uploadedFile) {
    return null
  }

  if (isAnalyzing) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <p className="text-white">Analyzing your image with AI...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-500/10 border-red-500/30">
        <CardContent className="p-6">
          <p className="text-red-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return null
  }

  const isApplied = currentPreset === analysis.recommendedPreset

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return "text-green-400"
    if (confidence >= 0.7) return "text-yellow-400"
    return "text-orange-400"
  }

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 0.85) return "bg-green-500/20"
    if (confidence >= 0.7) return "bg-yellow-500/20"
    return "bg-orange-500/20"
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI-Powered Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Image Type</p>
            <p className="text-white font-semibold capitalize">{analysis.imageType}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Estimated Era</p>
            <p className="text-white font-semibold">{analysis.estimatedEra}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-400">Detected Features:</p>
          <div className="flex flex-wrap gap-2">
            {analysis.isBlackAndWhite && (
              <Badge variant="secondary" className="bg-gray-700">
                Black & White
              </Badge>
            )}
            {analysis.hasVintageQuality && (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">
                Vintage Quality
              </Badge>
            )}
            {analysis.hasFaces && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                Faces Detected
              </Badge>
            )}
            {analysis.hasAsianFeatures && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                Asian Features
              </Badge>
            )}
            {analysis.hasScratches && (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                Scratches/Damage
              </Badge>
            )}
            {analysis.hasCulturalElements && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                Cultural Elements
              </Badge>
            )}
            {analysis.hasTraditionalClothing && (
              <Badge variant="secondary" className="bg-pink-500/20 text-pink-300">
                Traditional Clothing
              </Badge>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Recommended Preset</p>
              <p className="text-xl font-bold text-amber-400 capitalize">
                {analysis.recommendedPreset.replace(/-/g, " ")}
              </p>
            </div>
            <div className={`${getConfidenceBgColor(analysis.confidence)} rounded-lg px-3 py-2 text-center`}>
              <TrendingUp className={`w-4 h-4 ${getConfidenceColor(analysis.confidence)} mx-auto mb-1`} />
              <p className={`text-lg font-bold ${getConfidenceColor(analysis.confidence)}`}>
                {Math.round(analysis.confidence * 100)}%
              </p>
              <p className="text-xs text-gray-400">confidence</p>
            </div>
          </div>

          <p className="text-sm text-gray-300">
            {analysis.recommendedPreset === "indonesian-wedding" &&
              "Perfect for traditional Indonesian wedding photos with kebaya or batik. Optimizes gold colors and preserves cultural details."}
            {analysis.recommendedPreset === "asean-heritage" &&
              "Ideal for vintage ASEAN family photos. Carefully restores while preserving authentic historical character."}
            {analysis.recommendedPreset === "family-portrait" &&
              "Great for modern family photos with Asian features. Enhances clarity while maintaining natural skin tones."}
            {analysis.recommendedPreset === "vintage-photo" &&
              "Best for aged color photos from 1960s-1990s. Restores faded colors and removes yellowing."}
            {analysis.recommendedPreset === "batik-textile" &&
              "Optimized for batik patterns and traditional textiles. Enhances intricate details and vibrant colors."}
            {analysis.recommendedPreset === "old-document" &&
              "Perfect for historical documents and certificates. Removes stains and improves text clarity."}
          </p>

          <Button
            onClick={() => onApplyRecommendation(analysis.recommendedPreset)}
            className={`w-full ${
              isApplied
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white"
            }`}
            disabled={isApplied}
          >
            {isApplied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Applied
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Apply Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
