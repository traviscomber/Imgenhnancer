"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TestTube, Download, Play, CheckCircle, Loader2, ImageIcon, Sparkles, Target, Zap, X } from "lucide-react"
import { generateDomemaster } from "@/utils/domemaster"

interface TestStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "completed" | "error"
  progress: number
  result?: {
    downloadUrl?: string
    fileName?: string
    fileSize?: string
    details?: string
  }
}

export function DomemasterTestWorkflow() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "generate-pattern",
      name: "Generate Test Pattern",
      description: "Create 4K equirectangular test image with grid and markers",
      status: "pending",
      progress: 0,
    },
    {
      id: "simulate-enhancement",
      name: "Simulate AI Enhancement",
      description: "Apply 2x upscaling and quality improvements",
      status: "pending",
      progress: 0,
    },
    {
      id: "create-4k-dome",
      name: "Create 4K Domemaster",
      description: "Generate 4096x4096 domemaster with overlay guides",
      status: "pending",
      progress: 0,
    },
    {
      id: "create-8k-dome",
      name: "Create 8K Domemaster",
      description: "Generate 8192x8192 high-resolution domemaster",
      status: "pending",
      progress: 0,
    },
  ])

  const updateStep = (stepId: string, updates: Partial<TestStep>) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step)))
  }

  const generateTestPattern = async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      const width = 4096
      const height = 2048
      canvas.width = width
      canvas.height = height

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, "#87CEEB") // Sky blue
      gradient.addColorStop(0.7, "#98FB98") // Pale green
      gradient.addColorStop(1, "#8B4513") // Saddle brown

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
      ctx.lineWidth = 2

      // Longitude lines (every 30°)
      for (let lon = 0; lon <= 360; lon += 30) {
        const x = (lon / 360) * width
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Latitude lines (every 30°)
      for (let lat = -90; lat <= 90; lat += 30) {
        const y = ((90 - lat) / 180) * height
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Add cardinal direction markers
      ctx.fillStyle = "white"
      ctx.font = "48px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const markers = [
        { text: "N", x: width * 0.5, y: height * 0.1 },
        { text: "S", x: width * 0.5, y: height * 0.9 },
        { text: "E", x: width * 0.75, y: height * 0.5 },
        { text: "W", x: width * 0.25, y: height * 0.5 },
      ]

      markers.forEach((marker) => {
        ctx.fillText(marker.text, marker.x, marker.y)
      })

      // Add zenith marker
      ctx.fillStyle = "yellow"
      ctx.beginPath()
      ctx.arc(width * 0.5, height * 0.5, 20, 0, 2 * Math.PI)
      ctx.fill()

      ctx.fillStyle = "black"
      ctx.font = "24px Arial"
      ctx.fillText("ZENITH", width * 0.5, height * 0.5)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
        },
        "image/png",
        1.0,
      )
    })
  }

  const simulateEnhancement = async (inputBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      img.onload = () => {
        // 2x upscaling
        canvas.width = img.width * 2
        canvas.height = img.height * 2

        // Use high-quality scaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Apply enhancement effects
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Enhance contrast and saturation
        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128))
          data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128))
          data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128))

          // Increase saturation
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          data[i] = Math.min(255, Math.max(0, gray + 1.3 * (data[i] - gray)))
          data[i + 1] = Math.min(255, Math.max(0, gray + 1.3 * (data[i + 1] - gray)))
          data[i + 2] = Math.min(255, Math.max(0, gray + 1.3 * (data[i + 2] - gray)))
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            URL.revokeObjectURL(img.src)
          },
          "image/png",
          1.0,
        )
      }

      img.src = URL.createObjectURL(inputBlob)
    })
  }

  const runTestWorkflow = async () => {
    setIsRunning(true)
    setCurrentStep(0)

    // Reset all steps
    setSteps((prev) => prev.map((step) => ({ ...step, status: "pending" as const, progress: 0 })))

    try {
      // Step 1: Generate test pattern
      updateStep("generate-pattern", { status: "running", progress: 0 })
      setCurrentStep(0)

      for (let i = 0; i <= 100; i += 10) {
        updateStep("generate-pattern", { progress: i })
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      const testPattern = await generateTestPattern()
      const patternUrl = URL.createObjectURL(testPattern)

      updateStep("generate-pattern", {
        status: "completed",
        progress: 100,
        result: {
          downloadUrl: patternUrl,
          fileName: "test-pattern-4k.png",
          fileSize: `${Math.round(testPattern.size / 1024)}KB`,
          details: "4096x2048 equirectangular test pattern with grid and markers",
        },
      })

      // Step 2: Simulate enhancement
      updateStep("simulate-enhancement", { status: "running", progress: 0 })
      setCurrentStep(1)

      for (let i = 0; i <= 100; i += 5) {
        updateStep("simulate-enhancement", { progress: i })
        await new Promise((resolve) => setTimeout(resolve, 30))
      }

      const enhancedImage = await simulateEnhancement(testPattern)
      const enhancedUrl = URL.createObjectURL(enhancedImage)

      updateStep("simulate-enhancement", {
        status: "completed",
        progress: 100,
        result: {
          downloadUrl: enhancedUrl,
          fileName: "enhanced-8k.png",
          fileSize: `${Math.round(enhancedImage.size / 1024)}KB`,
          details: "8192x4096 enhanced with 2x upscaling, contrast and saturation boost",
        },
      })

      // Step 3: Create 4K domemaster
      updateStep("create-4k-dome", { status: "running", progress: 0 })
      setCurrentStep(2)

      for (let i = 0; i <= 100; i += 2) {
        updateStep("create-4k-dome", { progress: i })
        await new Promise((resolve) => setTimeout(resolve, 20))
      }

      const dome4k = await generateDomemaster(enhancedImage, {
        size: 4096,
        bleedPercent: 3,
        overlay: true,
        projection: "equidistant",
      })
      const dome4kUrl = URL.createObjectURL(dome4k)

      updateStep("create-4k-dome", {
        status: "completed",
        progress: 100,
        result: {
          downloadUrl: dome4kUrl,
          fileName: "domemaster-4k.png",
          fileSize: `${Math.round(dome4k.size / 1024)}KB`,
          details: "4096x4096 domemaster with elevation circles and azimuth guides",
        },
      })

      // Step 4: Create 8K domemaster
      updateStep("create-8k-dome", { status: "running", progress: 0 })
      setCurrentStep(3)

      for (let i = 0; i <= 100; i += 1) {
        updateStep("create-8k-dome", { progress: i })
        await new Promise((resolve) => setTimeout(resolve, 30))
      }

      const dome8k = await generateDomemaster(enhancedImage, {
        size: 8192,
        bleedPercent: 3,
        overlay: true,
        projection: "equidistant",
      })
      const dome8kUrl = URL.createObjectURL(dome8k)

      updateStep("create-8k-dome", {
        status: "completed",
        progress: 100,
        result: {
          downloadUrl: dome8kUrl,
          fileName: "domemaster-8k.png",
          fileSize: `${Math.round(dome8k.size / 1024)}KB`,
          details: "8192x8192 high-resolution domemaster for professional planetarium use",
        },
      })
    } catch (error) {
      console.error("Test workflow error:", error)
      const errorStepId = steps[currentStep]?.id
      if (errorStepId) {
        updateStep(errorStepId, {
          status: "error",
          result: { details: `Error: ${error instanceof Error ? error.message : "Unknown error"}` },
        })
      }
    } finally {
      setIsRunning(false)
    }
  }

  const downloadAll = () => {
    steps.forEach((step) => {
      if (step.result?.downloadUrl && step.result?.fileName) {
        const a = document.createElement("a")
        a.href = step.result.downloadUrl
        a.download = step.result.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    })
  }

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const hasResults = completedSteps > 0

  return (
    <div className="space-y-8">
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TestTube className="w-6 h-6 text-blue-400" />
              <div>
                <CardTitle className="text-white">Domemaster Test Workflow</CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Complete pipeline test: Pattern generation → AI enhancement → Domemaster conversion
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {hasResults && (
                <Button
                  onClick={downloadAll}
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              )}
              <Button onClick={runTestWorkflow} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Test Workflow
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Overall Progress</span>
              <span className="text-gray-300">
                {completedSteps}/{steps.length} completed
              </span>
            </div>
            <Progress value={(completedSteps / steps.length) * 100} className="h-2" />
          </div>

          {/* Test Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20">
                      {step.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : step.status === "running" ? (
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                      ) : step.status === "error" ? (
                        <X className="w-5 h-5 text-red-400" />
                      ) : (
                        <span className="text-gray-400 text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{step.name}</h3>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      step.status === "completed"
                        ? "default"
                        : step.status === "running"
                          ? "secondary"
                          : step.status === "error"
                            ? "destructive"
                            : "outline"
                    }
                    className={
                      step.status === "completed"
                        ? "bg-green-600/20 text-green-400 border-green-500/50"
                        : step.status === "running"
                          ? "bg-blue-600/20 text-blue-400 border-blue-500/50"
                          : ""
                    }
                  >
                    {step.status === "pending" && "Pending"}
                    {step.status === "running" && "Running"}
                    {step.status === "completed" && "Completed"}
                    {step.status === "error" && "Error"}
                  </Badge>
                </div>

                {step.status === "running" && (
                  <div className="mb-3">
                    <Progress value={step.progress} className="h-1" />
                  </div>
                )}

                {step.result && (
                  <div className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-white text-sm font-medium">{step.result.fileName}</p>
                          <p className="text-gray-400 text-xs">{step.result.details}</p>
                          {step.result.fileSize && (
                            <p className="text-gray-500 text-xs">Size: {step.result.fileSize}</p>
                          )}
                        </div>
                      </div>
                      {step.result.downloadUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const a = document.createElement("a")
                            a.href = step.result!.downloadUrl!
                            a.download = step.result!.fileName!
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                          }}
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator className="bg-white/10" />

          {/* Feature Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h4 className="text-white font-medium">Test Pattern</h4>
              </div>
              <p className="text-gray-300 text-sm">
                4K equirectangular grid with cardinal markers and zenith point for accurate projection testing
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-medium">AI Enhancement</h4>
              </div>
              <p className="text-gray-300 text-sm">
                2x upscaling with contrast and saturation enhancement to simulate real AI processing
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg p-4 border border-orange-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <h4 className="text-white font-medium">Domemaster</h4>
              </div>
              <p className="text-gray-300 text-sm">
                4K and 8K domemasters with elevation circles, azimuth guides, and cardinal directions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
