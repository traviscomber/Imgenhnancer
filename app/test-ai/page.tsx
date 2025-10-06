"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { analyzeImage, type ImageAnalysisResult } from "@/utils/image-analyzer"
import { Sparkles, Upload, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TestAIPage() {
  const [result, setResult] = useState<ImageAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)
    setPreviewUrl(URL.createObjectURL(file))

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

  const getConfidenceStatus = (confidence: number) => {
    if (confidence >= 0.85) return { text: "Excellent", color: "text-green-400", bg: "bg-green-500/20" }
    if (confidence >= 0.7) return { text: "Good", color: "text-yellow-400", bg: "bg-yellow-500/20" }
    return { text: "Fair", color: "text-orange-400", bg: "bg-orange-500/20" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/enhance">
            <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Enhance
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Image Analyzer Test</h1>
            <p className="text-gray-400">Test the AI recommendation system with your images</p>
          </div>
        </div>

        {/* Upload Card */}
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
              <label htmlFor="test-upload" className="flex-1">
                <Button asChild disabled={isAnalyzing} className="w-full bg-amber-500 hover:bg-amber-600">
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {isAnalyzing ? "Analyzing..." : "Upload Test Image"}
                  </span>
                </Button>
              </label>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <p className="text-white">Analyzing image with AI...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <>
            {/* Main Results Card */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Analysis Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Image Type</p>
                    <p className="text-white font-semibold capitalize">{result.imageType}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Recommended</p>
                    <p className="text-amber-400 font-semibold capitalize">
                      {result.recommendedPreset.replace(/-/g, " ")}
                    </p>
                  </div>
                  <div className={`${getConfidenceStatus(result.confidence).bg} rounded-lg p-3`}>
                    <p className="text-xs text-gray-400 mb-1">Confidence</p>
                    <p className={`${getConfidenceStatus(result.confidence).color} font-semibold`}>
                      {Math.round(result.confidence * 100)}% ({getConfidenceStatus(result.confidence).text})
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Era</p>
                    <p className="text-white font-semibold">{result.estimatedEra}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Detected Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.isBlackAndWhite && <Badge variant="secondary">Black & White</Badge>}
                    {result.hasVintageQuality && (
                      <Badge className="bg-amber-500/20 text-amber-300">Vintage Quality</Badge>
                    )}
                    {result.hasFaces && <Badge className="bg-blue-500/20 text-blue-300">Faces Detected</Badge>}
                    {result.hasAsianFeatures && (
                      <Badge className="bg-green-500/20 text-green-300">Asian Features</Badge>
                    )}
                    {result.hasScratches && (
                      <Badge className="bg-orange-500/20 text-orange-300">Scratches/Damage</Badge>
                    )}
                    {result.hasCulturalElements && (
                      <Badge className="bg-purple-500/20 text-purple-300">Cultural Elements</Badge>
                    )}
                    {result.hasTraditionalClothing && (
                      <Badge className="bg-pink-500/20 text-pink-300">Traditional Clothing</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Analysis */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Technical Analysis Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-gray-800 rounded p-3">
                    <span className="text-gray-500">Color Variance:</span>
                    <span className="text-white ml-2 font-mono">{result.analysis.colorVariance.toFixed(2)}</span>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <span className="text-gray-500">Brightness:</span>
                    <span className="text-white ml-2 font-mono">{result.analysis.brightness.toFixed(2)}</span>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <span className="text-gray-500">Edge Count:</span>
                    <span className="text-white ml-2 font-mono">{result.analysis.edgeCount}</span>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <span className="text-gray-500">Skin Pixels:</span>
                    <span className="text-white ml-2 font-mono">{result.analysis.skinTonePixels}</span>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <span className="text-gray-500">Cultural Pixels:</span>
                    <span className="text-white ml-2 font-mono">{result.analysis.culturalColorPixels}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expected Results for Wedding Photos */}
            <Card className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white text-sm">✅ Expected Results for Wedding Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>
                      Image Type: <strong className="text-white">wedding</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>
                      Recommended Preset: <strong className="text-amber-400">indonesian-wedding</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>
                      Confidence: <strong className="text-green-400">85-92%</strong> (Excellent)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Should detect: Traditional Clothing, Cultural Elements, Asian Features</span>
                  </li>
                </ul>

                {result.recommendedPreset === "indonesian-wedding" && result.confidence >= 0.85 ? (
                  <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />✅ Perfect! AI correctly identified this as an Indonesian
                      wedding photo.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-400 text-sm">
                      Note: This may not be a traditional wedding photo, or the image quality affects detection
                      accuracy.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
