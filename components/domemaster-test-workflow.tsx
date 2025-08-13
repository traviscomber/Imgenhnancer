"use client"

import { useState } from "react"
import { TestTube, Download, CheckCircle, Loader2, AlertCircle, Sparkles, Target } from "lucide-react"
import { generateDomemaster } from "@/utils/domemaster"

interface TestStep {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "completed" | "error"
  progress?: number
  result?: any
  error?: string
}

export function DomemasterTestWorkflow() {
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "generate-test-image",
      name: "Generate Test Image",
      description: "Create synthetic equirectangular test pattern",
      status: "pending",
    },
    {
      id: "ai-enhancement",
      name: "AI Enhancement Simulation",
      description: "Simulate Clarity Upscaler process",
      status: "pending",
    },
    {
      id: "generate-4k-dome",
      name: "Generate 4K Domemaster",
      description: "Create 4K domemaster with guide overlays",
      status: "pending",
    },
    {
      id: "generate-8k-dome",
      name: "Generate 8K Domemaster",
      description: "Create 8K domemaster for planetarium use",
      status: "pending",
    },
  ])

  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({})

  const updateStep = (stepId: string, updates: Partial<TestStep>) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step)))
  }

  const generateTestImage = async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      // Create 2048x1024 equirectangular test pattern
      canvas.width = 2048
      canvas.height = 1024

      // Fill with gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, "#1e3a8a")
      gradient.addColorStop(0.5, "#3b82f6")
      gradient.addColorStop(1, "#1e3a8a")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
      ctx.lineWidth = 2

      // Longitude lines (vertical)
      for (let x = 0; x <= canvas.width; x += canvas.width / 12) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Latitude lines (horizontal)
      for (let y = 0; y <= canvas.height; y += canvas.height / 6) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Add labels
      ctx.fillStyle = "white"
      ctx.font = "24px Arial"
      ctx.textAlign = "center"
      ctx.fillText("EQUIRECTANGULAR TEST PATTERN", canvas.width / 2, 50)
      ctx.fillText("360° × 180° Coverage", canvas.width / 2, 80)

      // Add directional markers
      ctx.font = "18px Arial"
      ctx.fillText("0°", canvas.width / 2, canvas.height / 2)
      ctx.fillText("90°", canvas.width * 0.75, canvas.height / 2)
      ctx.fillText("180°", canvas.width - 50, canvas.height / 2)
      ctx.fillText("270°", canvas.width * 0.25, canvas.height / 2)

      canvas.toBlob((blob) => {
        resolve(blob!)
      }, "image/png")
    })
  }

  const simulateAIEnhancement = async (blob: Blob): Promise<Blob> => {
    // Simulate AI enhancement by applying some basic filters
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        // Upscale by 2x
        canvas.width = img.width * 2
        canvas.height = img.height * 2

        // Use image smoothing for basic upscaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Apply slight sharpening effect
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Simple sharpening kernel
        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast slightly
          data[i] = Math.min(255, data[i] * 1.1) // R
          data[i + 1] = Math.min(255, data[i + 1] * 1.1) // G
          data[i + 2] = Math.min(255, data[i + 2] * 1.1) // B
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob((enhancedBlob) => {
          resolve(enhancedBlob!)
        }, "image/png")
      }

      img.src = URL.createObjectURL(blob)
    })
  }

  const runFullWorkflow = async () => {
    setIsRunning(true)
    setDownloadUrls({})

    try {
      // Step 1: Generate test image
      updateStep("generate-test-image", { status: "running", progress: 0 })
      const testImage = await generateTestImage()
      updateStep("generate-test-image", {
        status: "completed",
        progress: 100,
        result: { size: Math.round(testImage.size / 1024) + "KB" },
      })

      // Step 2: AI Enhancement simulation
      updateStep("ai-enhancement", { status: "running", progress: 0 })
      // Simulate processing time
      for (let i = 0; i <= 100; i += 10) {
        updateStep("ai-enhancement", { status: "running", progress: i })
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      const enhancedImage = await simulateAIEnhancement(testImage)
      updateStep("ai-enhancement", {
        status: "completed",
        progress: 100,
        result: {
          size: Math.round(enhancedImage.size / 1024) + "KB",
          upscale: "2x",
        },
      })

      // Step 3: Generate 4K Domemaster
      updateStep("generate-4k-dome", { status: "running", progress: 0 })
      const dome4K = await generateDomemaster(enhancedImage, {
        size: 4096,
        bleedPercent: 3,
        overlay: true,
        projection: "equidistant",
      })
      const dome4KUrl = URL.createObjectURL(dome4K)
      setDownloadUrls((prev) => ({ ...prev, dome4k: dome4KUrl }))
      updateStep("generate-4k-dome", {
        status: "completed",
        progress: 100,
        result: {
          size: Math.round(dome4K.size / 1024) + "KB",
          resolution: "4096x4096",
        },
      })

      // Step 4: Generate 8K Domemaster
      updateStep("generate-8k-dome", { status: "running", progress: 0 })
      const dome8K = await generateDomemaster(enhancedImage, {
        size: 8192,
        bleedPercent: 3,
        overlay: true,
        projection: "equidistant",
      })
      const dome8KUrl = URL.createObjectURL(dome8K)
      setDownloadUrls((prev) => ({ ...prev, dome8k: dome8KUrl }))
      updateStep("generate-8k-dome", {
        status: "completed",
        progress: 100,
        result: {
          size: Math.round(dome8K.size / 1024) + "KB",
          resolution: "8192x8192",
        },
      })
    } catch (error) {
      console.error("Workflow error:", error)
      const currentStep = steps.find((s) => s.status === "running")
      if (currentStep) {
        updateStep(currentStep.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
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
        progress: undefined,
        result: undefined,
        error: undefined,
      })),
    )
    setDownloadUrls({})
  }

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TestTube className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Domemaster Test Workflow</h2>
              <p className="text-gray-300">Complete pipeline test from image generation to domemaster export</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetWorkflow}
              disabled={isRunning}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={runFullWorkflow}
              disabled={isRunning}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg transition-all flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Full Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="grid gap-6">
        {steps.map((step, index) => (
          <div key={step.id} className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === "completed"
                      ? "bg-green-600"
                      : step.status === "running"
                        ? "bg-blue-600"
                        : step.status === "error"
                          ? "bg-red-600"
                          : "bg-gray-600"
                  }`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : step.status === "running" ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : step.status === "error" ? (
                    <AlertCircle className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{step.name}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </div>

              {step.status === "running" && step.progress !== undefined && (
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-300">{step.progress}%</span>
                </div>
              )}
            </div>

            {/* Results */}
            {step.result && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {Object.entries(step.result).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                      <span className="text-green-400 ml-2 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {step.error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{step.error}</p>
              </div>
            )}

            {/* Download buttons */}
            {step.id === "generate-4k-dome" && downloadUrls.dome4k && (
              <div className="mt-4">
                <button
                  onClick={() => downloadFile(downloadUrls.dome4k, "test_domemaster_4K.png")}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 4K Domemaster</span>
                </button>
              </div>
            )}

            {step.id === "generate-8k-dome" && downloadUrls.dome8k && (
              <div className="mt-4">
                <button
                  onClick={() => downloadFile(downloadUrls.dome8k, "test_domemaster_8K.png")}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 8K Domemaster</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Feature Overview */}
      <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-purple-400" />
          <span>Domemaster Features Tested</span>
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Equidistant Projection",
              icon: "🌐",
              description: "Proper fisheye conversion from equirectangular",
            },
            { name: "Guide Overlays", icon: "📐", description: "Crosshairs, elevation circles, azimuth lines" },
            { name: "Multiple Resolutions", icon: "📏", description: "4K and 8K generation with different settings" },
            { name: "Bleed Margins", icon: "⚫", description: "Configurable black borders around fisheye circle" },
            { name: "Bilinear Interpolation", icon: "🔍", description: "Smooth pixel sampling for high quality" },
            { name: "Test Pattern Generation", icon: "🎯", description: "Synthetic equirectangular test images" },
          ].map((feature) => (
            <div key={feature.name} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
              <span className="text-xl">{feature.icon}</span>
              <div>
                <h4 className="text-white font-medium text-sm">{feature.name}</h4>
                <p className="text-gray-400 text-xs">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Information */}
      <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Available Domemaster Presets</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "4K Preview", size: "4096×4096", time: "~15s", use: "Testing & preview" },
            { name: "8K Standard", size: "8192×8192", time: "~45s", use: "Most planetariums" },
            { name: "12K High Detail", size: "12288×12288", time: "~90s", use: "Premium installations" },
          ].map((preset) => (
            <div key={preset.name} className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2">{preset.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Resolution:</span>
                  <span className="text-blue-400">{preset.size}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Est. Time:</span>
                  <span className="text-purple-400">{preset.time}</span>
                </div>
                <div className="text-gray-400 text-xs mt-2">{preset.use}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
