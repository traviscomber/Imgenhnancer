"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  TestTube,
  Download,
  Loader2,
  CheckCircle,
  Play,
  Sparkles,
  ImageIcon,
  Zap,
  Target,
  Info,
  AlertCircle,
} from "lucide-react"
import { generateTestPattern, generateDomemaster } from "@/utils/domemaster"

interface TestStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "completed" | "error"
  progress: number
  result?: {
    blob?: Blob
    downloadUrl?: string
    size?: string
    details?: string
    error?: string
  }
}

export function DomemasterTestWorkflow() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "generate-pattern",
      name: "Generate Test Pattern",
      description: "Create synthetic 4K equirectangular test image with grid and markers",
      status: "pending",
      progress: 0,
    },
    {
      id: "simulate-enhancement",
      name: "Simulate AI Enhancement",
      description: "Apply 2x upscaling and enhancement filters to test pattern",
      status: "pending",
      progress: 0,
    },
    {
      id: "generate-4k-dome",
      name: "Generate 4K Domemaster",
      description: "Create 4096×4096 domemaster with guide overlays",
      status: "pending",
      progress: 0,
    },
    {
      id: "generate-8k-dome",
      name: "Generate 8K Domemaster",
      description: "Create 8192×8192 domemaster with guide overlays",
      status: "pending",
      progress: 0,
    },
  ])

  const updateStep = (stepId: string, updates: Partial<TestStep>) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step)))
  }

  const simulateEnhancement = async (sourceBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      img.onload = () => {
        try {
          // 2x upscaling
          canvas.width = img.width * 2
          canvas.height = img.height * 2

          // Use high-quality image smoothing for upscaling
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Apply enhancement effects
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Slight contrast and saturation boost
          for (let i = 0; i < data.length; i += 4) {
            // Increase contrast
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128)) // R
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128)) // G
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128)) // B

            // Slight saturation boost
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
            data[i] = Math.min(255, Math.max(0, gray + 1.1 * (data[i] - gray)))
            data[i + 1] = Math.min(255, Math.max(0, gray + 1.1 * (data[i + 1] - gray)))
            data[i + 2] = Math.min(255, Math.max(0, gray + 1.1 * (data[i + 2] - gray)))
          }

          ctx.putImageData(imageData, 0, 0)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create enhanced blob"))
              }
              URL.revokeObjectURL(img.src)
            },
            "image/png",
            1.0,
          )
        } catch (error) {
          reject(error)
          URL.revokeObjectURL(img.src)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for enhancement"))
        URL.revokeObjectURL(img.src)
      }

      img.src = URL.createObjectURL(sourceBlob)
    })
  }

  const runTestWorkflow = async () => {
    setIsRunning(true)
    setCurrentStep("generate-pattern")

    try {
      // Step 1: Generate test pattern
      updateStep("generate-pattern", { status: "running", progress: 0 })

      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        updateStep("generate-pattern", { progress: i })
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const testPattern = await generateTestPattern(4096, 2048)
      const testPatternUrl = URL.createObjectURL(testPattern)

      updateStep("generate-pattern", {
        status: "completed",
        progress: 100,
        result: {
          blob: testPattern,
          downloadUrl: testPatternUrl,
          size: `${Math.round(testPattern.size / 1024)}KB`,
          details: "4096×2048 equirectangular test pattern with grid overlay and test markers",
        },
      })

      // Step 2: Simulate AI enhancement
      setCurrentStep("simulate-enhancement")
      updateStep("simulate-enhancement", { status: "running", progress: 0 })

      // Simulate AI processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        updateStep("simulate-enhancement", { progress: i })
        await new Promise((resolve) => setTimeout(resolve, 150))
      }

      const enhancedPattern = await simulateEnhancement(testPattern)
      const enhancedUrl = URL.createObjectURL(enhancedPattern)

      updateStep("simulate-enhancement", {
        status: "completed",
        progress: 100,
        result: {
          blob: enhancedPattern,
          downloadUrl: enhancedUrl,
          size: `${Math.round(enhancedPattern.size / 1024)}KB`,
          details: "Simulated 2x upscaling (4K→8K) with contrast and saturation enhancement",
        },
      })

      // Step 3: Generate 4K domemaster
      setCurrentStep("generate-4k-dome")
      updateStep("generate-4k-dome", { status: "running", progress: 0 })

      // Simulate progress for domemaster generation
      const dome4KProgress = setInterval(() => {
        updateStep("generate-4k-dome", (prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 95),
        }))
      }, 200)

      const dome4K = await generateDomemaster(enhancedPattern, {
        size: 4096,
        bleedPercent: 3,
        overlay: true,
        projection: "equidistant",
      })

      clearInterval(dome4KProgress)
      const dome4KUrl = URL.createObjectURL(dome4K)

      updateStep("generate-4k-dome", {
        status: "completed",
        progress: 100,
        result: {
          blob: dome4K,
          downloadUrl: dome4KUrl,
          size: `${Math.round(dome4K.size / 1024)}KB`,
          details: "4K domemaster with elevation circles, azimuth lines, and cardinal direction labels",
        },
      })

      // Step 4: Generate 8K domemaster
      setCurrentStep("generate-8k-dome")
      updateStep("generate-8k-dome", { status: "running", progress: 0 })

      // Simulate progress for 8K domemaster generation
      const dome8KProgress = setInterval(() => {
        updateStep("generate-8k-dome", (prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 3, 95),
        }))
      }, 300)

      const dome8K = await generateDomemaster(enhancedPattern, {
        size: 8192,
        bleedPercent: 3,
        overlay: true,
        projection: "equidistant",
      })

      clearInterval(dome8KProgress)
      const dome8KUrl = URL.createObjectURL(dome8K)

      updateStep("generate-8k-dome", {
        status: "completed",
        progress: 100,
        result: {
          blob: dome8K,
          downloadUrl: dome8KUrl,
          size: `${Math.round(dome8K.size / 1024)}KB`,
          details: "8K high-resolution domemaster for professional planetarium systems",
        },
      })

      setCurrentStep(null)
    } catch (error) {
      console.error("Test workflow error:", error)
      if (currentStep) {
        updateStep(currentStep, {
          status: "error",
          result: { error: `Error: ${error instanceof Error ? error.message : "Unknown error"}` },
        })
      }
    } finally {
      setIsRunning(false)
    }
  }

  const resetWorkflow = () => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: "pending" as const,
        progress: 0,
        result: undefined,
      })),
    )
    setCurrentStep(null)
    setIsRunning(false)
  }

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadAll = () => {
    steps.forEach((step) => {
      if (step.result?.downloadUrl) {
        const filename = `${step.id}-result.png`
        downloadFile(step.result.downloadUrl, filename)
      }
    })
  }

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const overallProgress = (completedSteps / steps.length) * 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Domemaster Test Workflow</CardTitle>
                <CardDescription className="text-blue-200">
                  Complete pipeline test: Pattern Generation → AI Enhancement → Domemaster Creation
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {completedSteps > 0 && (
                <Button onClick={downloadAll} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              )}
              <Button onClick={resetWorkflow} variant="outline" size="sm" disabled={isRunning}>
                Reset
              </Button>
              <Button
                onClick={runTestWorkflow}
                disabled={isRunning}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Test...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Test Workflow
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Overall Progress</span>
              <span className="text-gray-300">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>
                {completedSteps}/{steps.length} steps completed
              </span>
              <span>{isRunning ? "Processing..." : "Ready"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="grid gap-6">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`bg-black/20 backdrop-blur-lg border-white/10 transition-all ${
              currentStep === step.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {step.status === "pending" && (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                        <span className="text-xs text-gray-400">{index + 1}</span>
                      </div>
                    )}
                    {step.status === "running" && <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />}
                    {step.status === "completed" && <CheckCircle className="w-6 h-6 text-green-400" />}
                    {step.status === "error" && <AlertCircle className="w-6 h-6 text-red-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{step.name}</h3>
                    <p className="text-gray-300 text-sm mb-3">{step.description}</p>

                    {/* Progress Bar */}
                    {(step.status === "running" || step.status === "completed") && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{step.progress}%</span>
                        </div>
                        <Progress value={step.progress} className="h-1" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center space-x-2">
                      {step.status === "completed" && (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {step.status === "running" && (
                        <Badge className="bg-blue-600 text-white">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Processing
                        </Badge>
                      )}
                      {step.status === "error" && (
                        <Badge className="bg-red-600 text-white">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      {step.status === "pending" && (
                        <Badge variant="outline" className="text-gray-400 border-gray-400">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Image */}
                {step.result?.downloadUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={step.result.downloadUrl || "/placeholder.svg"}
                      alt={step.name}
                      className="w-20 h-20 object-cover rounded-lg border border-white/20"
                    />
                  </div>
                )}
              </div>

              {/* Results */}
              {step.result && (
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">Result</span>
                    </div>
                    {step.result.downloadUrl && (
                      <Button
                        onClick={() => downloadFile(step.result!.downloadUrl!, `${step.id}-result.png`)}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>

                  {step.result.size && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">File Size:</span>
                        <span className="text-white ml-2">{step.result.size}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400 ml-2">Generated</span>
                      </div>
                    </div>
                  )}

                  {step.result.details && (
                    <div className="text-sm text-gray-300 bg-white/5 rounded p-2">
                      <Info className="w-4 h-4 inline mr-2" />
                      {step.result.details}
                    </div>
                  )}

                  {step.result.error && (
                    <div className="text-sm text-red-300 bg-red-900/20 rounded p-2">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      {step.result.error}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Overview */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Test Workflow Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Test Pattern Generation
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 4K equirectangular test pattern (4096×2048)</li>
                <li>• Grid overlay for projection verification</li>
                <li>• Color gradients and test markers</li>
                <li>• Zenith, horizon, and nadir labels</li>
                <li>• Cardinal direction markers</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                AI Enhancement Simulation
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 2x upscaling (4K → 8K equirectangular)</li>
                <li>• High-quality image smoothing</li>
                <li>• Contrast and saturation enhancement</li>
                <li>• Simulates real AI model output</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Domemaster Generation
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Equidistant fisheye projection</li>
                <li>• Bilinear interpolation for smooth sampling</li>
                <li>• 4K (4096×4096) and 8K (8192×8192) output</li>
                <li>• 3% bleed margin for dome edge handling</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Guide Overlays
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Elevation circles every 10° (10°-80°)</li>
                <li>• Azimuth lines every 30°</li>
                <li>• Cardinal direction labels (N, E, S, W)</li>
                <li>• Center crosshairs and zenith marker</li>
                <li>• Corner alignment markers</li>
              </ul>
            </div>
          </div>

          <Separator className="my-6 bg-white/10" />

          <div className="text-center">
            <p className="text-sm text-gray-400">
              This test workflow validates the complete domemaster generation pipeline without requiring external AI
              services. Use it to verify projection accuracy, guide overlay positioning, and output quality before
              processing real equirectangular images.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
