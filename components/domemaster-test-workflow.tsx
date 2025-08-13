"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  TestTube,
  Download,
  Loader2,
  CheckCircle,
  ImageIcon,
  Sparkles,
  Settings,
  FileImage,
  Zap,
  X,
} from "lucide-react"
import { generateTestPattern, generateDomemaster, type DomemasterOptions } from "@/utils/domemaster"

interface TestStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "completed" | "error"
  progress: number
  downloadUrl?: string
  fileSize?: string
  duration?: string
}

export function DomemasterTestWorkflow() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "generate-pattern",
      name: "Generate Test Pattern",
      description: "Create 4K equirectangular test image with grid and markers",
      status: "pending",
      progress: 0,
    },
    {
      id: "simulate-enhance",
      name: "Simulate AI Enhancement",
      description: "Apply 2x upscaling and quality improvements",
      status: "pending",
      progress: 0,
    },
    {
      id: "create-4k-dome",
      name: "Create 4K Domemaster",
      description: "Generate 4096x4096 domemaster projection",
      status: "pending",
      progress: 0,
    },
    {
      id: "create-8k-dome",
      name: "Create 8K Domemaster",
      description: "Generate 8192x8192 domemaster projection",
      status: "pending",
      progress: 0,
    },
  ])

  const updateStep = (stepId: string, updates: Partial<TestStep>) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step)))
  }

  const runTestWorkflow = async () => {
    setIsRunning(true)
    const startTime = Date.now()

    try {
      // Step 1: Generate test pattern
      setCurrentStep("generate-pattern")
      updateStep("generate-pattern", { status: "running", progress: 0 })

      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate processing time

      const testCanvas = generateTestPattern(4096, 2048)
      updateStep("generate-pattern", { status: "running", progress: 50 })

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Convert to blob
      const testBlob = await new Promise<Blob>((resolve, reject) => {
        testCanvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Failed to create test pattern blob"))
        }, "image/png")
      })

      const testUrl = URL.createObjectURL(testBlob)
      const testSize = `${Math.round(testBlob.size / 1024)}KB`
      updateStep("generate-pattern", {
        status: "completed",
        progress: 100,
        downloadUrl: testUrl,
        fileSize: testSize,
        duration: "1.0s",
      })

      // Step 2: Simulate AI enhancement
      setCurrentStep("simulate-enhance")
      updateStep("simulate-enhance", { status: "running", progress: 0 })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create enhanced version (simulate 2x upscaling)
      const enhancedCanvas = document.createElement("canvas")
      const enhancedCtx = enhancedCanvas.getContext("2d")!
      enhancedCanvas.width = 8192
      enhancedCanvas.height = 4096

      // Apply some enhancements
      enhancedCtx.imageSmoothingEnabled = true
      enhancedCtx.imageSmoothingQuality = "high"
      enhancedCtx.drawImage(testCanvas, 0, 0, 8192, 4096)

      // Add some sharpening effect
      enhancedCtx.filter = "contrast(1.1) saturate(1.05) brightness(1.02)"
      enhancedCtx.drawImage(enhancedCanvas, 0, 0)

      updateStep("simulate-enhance", { status: "running", progress: 70 })

      const enhancedBlob = await new Promise<Blob>((resolve, reject) => {
        enhancedCanvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Failed to create enhanced blob"))
        }, "image/png")
      })

      const enhancedUrl = URL.createObjectURL(enhancedBlob)
      const enhancedSize = `${Math.round(enhancedBlob.size / 1024)}KB`
      updateStep("simulate-enhance", {
        status: "completed",
        progress: 100,
        downloadUrl: enhancedUrl,
        fileSize: enhancedSize,
        duration: "2.5s",
      })

      // Step 3: Create 4K domemaster
      setCurrentStep("create-4k-dome")
      updateStep("create-4k-dome", { status: "running", progress: 0 })

      const dome4kOptions: DomemasterOptions = {
        size: 4096,
        bleedPercent: 3,
        overlay: true,
        projection: "equidistant",
      }

      updateStep("create-4k-dome", { status: "running", progress: 30 })

      const dome4k = await generateDomemaster(enhancedBlob, dome4kOptions)
      const dome4kUrl = URL.createObjectURL(dome4k)
      const dome4kSize = `${Math.round(dome4k.size / 1024)}KB`

      updateStep("create-4k-dome", {
        status: "completed",
        progress: 100,
        downloadUrl: dome4kUrl,
        fileSize: dome4kSize,
        duration: "3.2s",
      })

      // Step 4: Create 8K domemaster
      setCurrentStep("create-8k-dome")
      updateStep("create-8k-dome", { status: "running", progress: 0 })

      const dome8kOptions: DomemasterOptions = {
        size: 8192,
        bleedPercent: 3,
        overlay: true,
        projection: "equidistant",
      }

      updateStep("create-8k-dome", { status: "running", progress: 20 })

      const dome8k = await generateDomemaster(enhancedBlob, dome8kOptions)
      const dome8kUrl = URL.createObjectURL(dome8k)
      const dome8kSize = `${Math.round(dome8k.size / 1024)}KB`

      updateStep("create-8k-dome", {
        status: "completed",
        progress: 100,
        downloadUrl: dome8kUrl,
        fileSize: dome8kSize,
        duration: "8.7s",
      })

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`✅ Test workflow completed in ${totalTime}s`)
    } catch (error) {
      console.error("❌ Test workflow failed:", error)
      if (currentStep) {
        updateStep(currentStep, {
          status: "error",
          progress: 0,
        })
      }
    } finally {
      setIsRunning(false)
      setCurrentStep(null)
    }
  }

  const downloadAll = () => {
    steps.forEach((step) => {
      if (step.downloadUrl) {
        const a = document.createElement("a")
        a.href = step.downloadUrl
        a.download = `${step.id}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    })
  }

  const completedSteps = steps.filter((s) => s.status === "completed").length
  const hasCompletedSteps = completedSteps > 0
  const allCompleted = completedSteps === steps.length

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
                <p className="text-blue-200 text-sm">
                  Complete pipeline test: Pattern → Enhancement → 4K/8K Domemaster
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {hasCompletedSteps && (
                <Button
                  onClick={downloadAll}
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              )}
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
                    <TestTube className="w-4 h-4 mr-2" />
                    Run Test Workflow
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      {isRunning && (
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Overall Progress</h3>
              <span className="text-purple-300 text-sm">
                {completedSteps} of {steps.length} steps completed
              </span>
            </div>
            <Progress value={(completedSteps / steps.length) * 100} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Steps */}
      <div className="grid gap-6">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`transition-all duration-300 ${
              step.status === "running"
                ? "bg-blue-900/20 border-blue-500/50 shadow-lg shadow-blue-500/20"
                : step.status === "completed"
                  ? "bg-green-900/20 border-green-500/50"
                  : step.status === "error"
                    ? "bg-red-900/20 border-red-500/50"
                    : "bg-black/20 border-white/10"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      step.status === "running"
                        ? "bg-blue-600"
                        : step.status === "completed"
                          ? "bg-green-600"
                          : step.status === "error"
                            ? "bg-red-600"
                            : "bg-gray-600"
                    }`}
                  >
                    {step.status === "running" ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : step.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : step.status === "error" ? (
                      <X className="w-5 h-5 text-white" />
                    ) : (
                      getStepIcon(step.id)
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{step.name}</h3>
                    <p className="text-gray-300 text-sm">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {step.status === "completed" && step.duration && (
                    <Badge variant="outline" className="border-green-500/50 text-green-400">
                      {step.duration}
                    </Badge>
                  )}
                  {step.fileSize && (
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                      {step.fileSize}
                    </Badge>
                  )}
                  {step.downloadUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const a = document.createElement("a")
                        a.href = step.downloadUrl!
                        a.download = `${step.id}.png`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                      }}
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              {step.status === "running" && <Progress value={step.progress} className="h-2" />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results Summary */}
      {allCompleted && (
        <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-medium">Test Workflow Completed Successfully!</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-300">Test Pattern</div>
                <div className="text-white font-medium">4K Equirectangular</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-300">Enhanced</div>
                <div className="text-white font-medium">8K AI Upscaled</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-300">4K Domemaster</div>
                <div className="text-white font-medium">4096×4096 PNG</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-300">8K Domemaster</div>
                <div className="text-white font-medium">8192×8192 PNG</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Overview */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Domemaster Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Projection Types</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Equidistant (default) - Linear angle mapping</li>
                <li>• Equisolid - Equal area preservation</li>
                <li>• Orthographic - Parallel projection</li>
                <li>• Stereographic - Conformal mapping</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Output Options</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Multiple resolutions: 4K, 8K, 12K</li>
                <li>• Adjustable bleed margin (0-5%)</li>
                <li>• Optional overlay guides</li>
                <li>• PNG format with transparency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getStepIcon(stepId: string) {
  switch (stepId) {
    case "generate-pattern":
      return <FileImage className="w-5 h-5 text-white" />
    case "simulate-enhance":
      return <Zap className="w-5 h-5 text-white" />
    case "create-4k-dome":
    case "create-8k-dome":
      return <ImageIcon className="w-5 h-5 text-white" />
    default:
      return <Settings className="w-5 h-5 text-white" />
  }
}
