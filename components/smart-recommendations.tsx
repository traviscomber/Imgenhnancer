"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { analyzeImage, type ImageAnalysisResult } from "@/utils/image-analyzer"

interface SmartRecommendationsProps {
  files: File[]
  onApplyRecommendation: (presetId: string) => void
  selectedPreset: string | null
}

export function SmartRecommendations({ files, onApplyRecommendation, selectedPreset }: SmartRecommendationsProps) {
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (files.length > 0) {
      analyzeFirstImage()
    } else {
      setAnalysis(null)
    }
  }, [files])

  const analyzeFirstImage = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeImage(files[0])
      setAnalysis(result)
    } catch (err) {
      setError("Failed to analyze image")
      console.error("Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (files.length === 0) return null

  if (isAnalyzing) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="p-6 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <p className="text-white">Analyzing your image with AI...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !analysis) return null

  const isRecommendationApplied = selectedPreset === analysis.recommendedPreset
  const confidenceColor =
    analysis.confidence > 0.8 ? "text-green-400" : analysis.confidence > 0.6 ? "text-yellow-400" : "text-orange-400"

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              AI-Powered Recommendation
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">Based on intelligent image analysis</CardDescription>
          </div>
          <Badge className={`${confidenceColor} border-current`}>{Math.round(analysis.confidence * 100)}% Match</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Analysis Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-gray-800/50 rounded-lg p-2">
            <p className="text-xs text-gray-400">Type</p>
            <p className="text-sm font-semibold text-white capitalize">{analysis.imageType}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2">
            <p className="text-xs text-gray-400">Era</p>
            <p className="text-sm font-semibold text-white">{analysis.estimatedEra}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2">
            <p className="text-xs text-gray-400">Color</p>
            <p className="text-sm font-semibold text-white">{analysis.isBlackAndWhite ? "B&W" : "Color"}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2">
            <p className="text-xs text-gray-400">Quality</p>
            <p className="text-sm font-semibold text-white">{analysis.hasVintageQuality ? "Vintage" : "Modern"}</p>
          </div>
        </div>

        {/* Detected Features */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-300">Detected Features:</p>
          <div className="flex flex-wrap gap-2">
            {analysis.hasFaces && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Faces Detected
              </Badge>
            )}
            {analysis.hasAsianFeatures && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Asian Features
              </Badge>
            )}
            {analysis.hasScratches && (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                Damage/Scratches
              </Badge>
            )}
            {analysis.hasCulturalElements && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Cultural Elements
              </Badge>
            )}
            {analysis.hasTraditionalClothing && (
              <Badge variant="secondary" className="bg-pink-500/20 text-pink-300">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Traditional Clothing
              </Badge>
            )}
          </div>
        </div>

        {/* Recommended Preset */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-300 mb-1">Recommended Preset:</p>
              <p className="text-lg font-bold text-white capitalize">{analysis.recommendedPreset.replace(/-/g, " ")}</p>
              <p className="text-xs text-gray-400 mt-1">This preset is optimized for your image based on AI analysis</p>
            </div>
            <Button
              onClick={() => onApplyRecommendation(analysis.recommendedPreset)}
              disabled={isRecommendationApplied}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {isRecommendationApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
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
        </div>

        {/* Why This Recommendation */}
        <div className="bg-gray-800/30 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-400 mb-2">Why this preset?</p>
          <ul className="space-y-1 text-xs text-gray-300">
            {analysis.hasCulturalElements && analysis.hasTraditionalClothing && (
              <li>• Detected traditional Indonesian wedding attire (kebaya/batik)</li>
            )}
            {analysis.hasVintageQuality && <li>• Image shows signs of aging and requires restoration</li>}
            {analysis.hasScratches && <li>• Damage and scratches detected - scratch removal enabled</li>}
            {analysis.isBlackAndWhite && <li>• Black & white photo - colorization recommended</li>}
            {analysis.hasAsianFeatures && <li>• ASEAN face preservation activated to maintain authentic features</li>}
            {analysis.imageType === "document" && (
              <li>• Document detected - text sharpening and clarity enhancement</li>
            )}
            {analysis.imageType === "textile" && <li>• Textile patterns detected - texture enhancement enabled</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
