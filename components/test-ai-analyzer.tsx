"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { analyzeImage, type ImageAnalysisResult } from "@/utils/image-analyzer"
import { Sparkles, Upload, AlertCircle } from "lucide-react"

export function TestAIAnalyzer() {
  const [result, setResult] = useState<ImageAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      console.log("🔍 Starting analysis for:", file.name)
      const analysis = await analyzeImage(file)
      setResult(analysis)
      console.log("✅ Analysis complete:", analysis)
    } catch (err) {
      console.error("❌ Analysis failed:", err)
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="bg-gray-900 border-amber-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Test AI Image Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="test-upload"
            disabled={isAnalyzing}
          />
          <label htmlFor="test-upload">
            <Button asChild disabled={isAnalyzing}>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Upload Test Image"}
              </span>
            </Button>
          </label>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-400">Image Type</p>
                <p className="text-white font-semibold capitalize">{result.imageType}</p>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-400">Recommended Preset</p>
                <p className="text-amber-400 font-semibold">{result.recommendedPreset.replace(/-/g, " ")}</p>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-400">Confidence</p>
                <p className="text-green-400 font-semibold">{Math.round(result.confidence * 100)}%</p>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-400">Era</p>
                <p className="text-white font-semibold">{result.estimatedEra}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Detected Features:</p>
              <div className="flex flex-wrap gap-2">
                {result.isBlackAndWhite && <Badge variant="secondary">Black & White</Badge>}
                {result.hasVintageQuality && <Badge variant="secondary">Vintage Quality</Badge>}
                {result.hasFaces && <Badge variant="secondary">Faces Detected</Badge>}
                {result.hasAsianFeatures && <Badge className="bg-green-500/20 text-green-300">Asian Features</Badge>}
                {result.hasScratches && <Badge className="bg-orange-500/20 text-orange-300">Scratches/Damage</Badge>}
                {result.hasCulturalElements && (
                  <Badge className="bg-purple-500/20 text-purple-300">Cultural Elements</Badge>
                )}
                {result.hasTraditionalClothing && (
                  <Badge className="bg-pink-500/20 text-pink-300">Traditional Clothing</Badge>
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded p-3 space-y-2">
              <p className="text-sm text-gray-400">Technical Analysis:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Color Variance:</span>
                  <span className="text-white ml-2">{result.analysis.colorVariance.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Brightness:</span>
                  <span className="text-white ml-2">{result.analysis.brightness.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Edge Count:</span>
                  <span className="text-white ml-2">{result.analysis.edgeCount}</span>
                </div>
                <div>
                  <span className="text-gray-500">Skin Pixels:</span>
                  <span className="text-white ml-2">{result.analysis.skinTonePixels}</span>
                </div>
                <div>
                  <span className="text-gray-500">Cultural Pixels:</span>
                  <span className="text-white ml-2">{result.analysis.culturalColorPixels}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-white font-semibold mb-2">✅ Expected Result for Wedding Photo:</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>
                  • Image Type: <strong className="text-white">wedding</strong>
                </li>
                <li>
                  • Recommended Preset: <strong className="text-amber-400">indonesian-wedding</strong>
                </li>
                <li>
                  • Confidence: <strong className="text-green-400">85-95%</strong>
                </li>
                <li>• Should detect: Traditional Clothing, Cultural Elements, Asian Features</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
