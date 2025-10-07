"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Upload, Download, Sparkles, Loader2, AlertCircle, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Navbar } from "@/components/navbar"

interface EnhancedImage {
  id: string
  originalUrl: string
  enhancedUrl: string
  originalName: string
  status: "processing" | "complete" | "error"
  error?: string
}

interface EnhancementSettings {
  model: string
  upscaleFactor: number
  creativity: number
  resemblance: number
  fractality: number
  colorBoost: number
  enablePreProcessing: boolean
  enablePostProcessing: boolean
  outputFormat: "png" | "jpg" | "webp"
  outputQuality: number
}

// Cultural Heritage Presets
const CULTURAL_PRESETS = {
  "asean-portrait-safe": {
    name: "🛡️ ASEAN Portrait (Ultra-Safe)",
    description: "100% face preservation for Indonesian, Malaysian, Thai, Filipino, and ASEAN portraits",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.1,
      resemblance: 1.0,
      fractality: 0.1,
      colorBoost: 1.0,
      enablePreProcessing: false,
      enablePostProcessing: false,
      outputFormat: "png" as const,
      outputQuality: 98,
    },
    features: ["Face Protection", "Skin Tone Preservation", "Cultural Authenticity"],
  },
  "indonesian-wedding": {
    name: "🤵👰 Indonesian Wedding",
    description: "Perfect for Javanese, Sundanese, Minang wedding photos with traditional attire",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.2,
      resemblance: 0.9,
      fractality: 0.2,
      colorBoost: 1.2,
      enablePreProcessing: true,
      enablePostProcessing: true,
      outputFormat: "png" as const,
      outputQuality: 95,
    },
    features: ["Kebaya Enhancement", "Batik Detail Preservation", "Traditional Jewelry Clarity", "Rich Color Depth"],
  },
  "asean-heritage": {
    name: "🏛️ ASEAN Heritage",
    description: "Colonial-era photos, royal ceremonies, historical ASEAN documentation",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.3,
      resemblance: 0.85,
      fractality: 0.3,
      colorBoost: 1.1,
      enablePreProcessing: true,
      enablePostProcessing: true,
      outputFormat: "png" as const,
      outputQuality: 95,
    },
    features: ["Historical Accuracy", "Damage Repair", "Colorization Ready", "Archive Quality"],
  },
  "modern-portrait": {
    name: "📸 Modern Portrait",
    description: "Contemporary portraits with natural enhancement",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.35,
      resemblance: 0.8,
      fractality: 0.25,
      colorBoost: 1.15,
      enablePreProcessing: true,
      enablePostProcessing: true,
      outputFormat: "jpg" as const,
      outputQuality: 92,
    },
    features: ["Natural Skin", "Sharp Details", "Balanced Colors", "Studio Quality"],
  },
  professional: {
    name: "⚡ Professional",
    description: "Maximum quality for professional work",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 4,
      creativity: 0.5,
      resemblance: 0.75,
      fractality: 0.35,
      colorBoost: 1.25,
      enablePreProcessing: true,
      enablePostProcessing: true,
      outputFormat: "png" as const,
      outputQuality: 100,
    },
    features: ["4x Upscale", "Maximum Detail", "Pro Color Grading", "Print Ready"],
  },
}

export default function EnhancePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof CULTURAL_PRESETS | "custom">("asean-portrait-safe")
  const [settings, setSettings] = useState<EnhancementSettings>(CULTURAL_PRESETS["asean-portrait-safe"].settings)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter((file) => {
      const isValid = file.type.startsWith("image/")
      if (!isValid) {
        setError(`${file.name} is not a valid image file`)
      }
      return isValid
    })

    setSelectedFiles((prev) => [...prev, ...validFiles])
    setError(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const applyPreset = (presetKey: keyof typeof CULTURAL_PRESETS) => {
    setSelectedPreset(presetKey)
    setSettings(CULTURAL_PRESETS[presetKey].settings)
    setShowAdvanced(false)
  }

  const handleSettingChange = (key: keyof EnhancementSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSelectedPreset("custom")
  }

  const handleEnhance = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one image")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const tempId = `temp-${Date.now()}-${i}`

        console.log(`🚀 Processing file ${i + 1}/${selectedFiles.length}: ${file.name}`)

        // Add to enhanced images list
        const originalUrl = URL.createObjectURL(file)
        setEnhancedImages((prev) => [
          ...prev,
          {
            id: tempId,
            originalUrl,
            enhancedUrl: "",
            originalName: file.name,
            status: "processing",
          },
        ])

        // Create form data with correct keys matching API
        const formData = new FormData()
        formData.append("image", file) // API checks for both "image" and "file"
        formData.append("model", settings.model)
        formData.append("upscale_factor", settings.upscaleFactor.toString())
        formData.append("creativity", settings.creativity.toString())
        formData.append("resemblance", settings.resemblance.toString())
        formData.append("output_format", settings.outputFormat)

        console.log("📤 Sending FormData with keys:", Array.from(formData.keys()))

        // Call API
        const response = await fetch("/api/enhance-replicate", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()
        console.log("📥 API Response:", data)

        if (!response.ok) {
          throw new Error(data.error || `Enhancement failed: ${response.status}`)
        }

        if (!data.success || !data.output) {
          throw new Error(data.error || "No output URL received")
        }

        // Update with enhanced image
        setEnhancedImages((prev) =>
          prev.map((img) =>
            img.id === tempId
              ? {
                  ...img,
                  enhancedUrl: data.output,
                  status: "complete" as const,
                }
              : img,
          ),
        )

        // Update progress
        setProgress(((i + 1) / selectedFiles.length) * 100)
        console.log(`✅ Completed ${i + 1}/${selectedFiles.length}`)
      }

      console.log("🎉 All images enhanced successfully!")
    } catch (err) {
      console.error("❌ Enhancement error:", err)
      const errorMessage = err instanceof Error ? err.message : "Enhancement failed"
      setError(errorMessage)

      // Mark last processing image as error
      setEnhancedImages((prev) =>
        prev.map((img) =>
          img.status === "processing"
            ? {
                ...img,
                status: "error" as const,
                error: errorMessage,
              }
            : img,
        ),
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `enhanced-${filename}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error("Download error:", err)
      setError("Failed to download image")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Image Enhancer</h1>
          <p className="text-gray-400">Transform your photos with ASEAN-optimized AI technology</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Upload Images</CardTitle>
                <CardDescription className="text-gray-400">Drag and drop or click to select images</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-amber-500 transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Drop images here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, WebP (max 10MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-400">{selectedFiles.length} file(s) selected</p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                        <span className="text-sm text-gray-300 truncate flex-1">{file.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preset Selection */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Enhancement Presets</CardTitle>
                <CardDescription className="text-gray-400">Choose a preset optimized for ASEAN photos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(CULTURAL_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key as keyof typeof CULTURAL_PRESETS)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedPreset === key
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-600 bg-gray-700/30 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white mb-1">{preset.name}</div>
                        <div className="text-xs text-gray-400 mb-2">{preset.description}</div>
                        <div className="flex flex-wrap gap-1">
                          {preset.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedPreset === key && <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 ml-2" />}
                    </div>
                  </button>
                ))}

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setShowAdvanced(!showAdvanced)
                    setSelectedPreset("custom")
                  }}
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Settings
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            {showAdvanced && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Upscale Factor: {settings.upscaleFactor}x</Label>
                    <Slider
                      value={[settings.upscaleFactor]}
                      onValueChange={([value]) => handleSettingChange("upscaleFactor", value)}
                      min={1}
                      max={4}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Creativity: {settings.creativity.toFixed(2)}</Label>
                    <Slider
                      value={[settings.creativity]}
                      onValueChange={([value]) => handleSettingChange("creativity", value)}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Resemblance: {settings.resemblance.toFixed(2)}</Label>
                    <Slider
                      value={[settings.resemblance]}
                      onValueChange={([value]) => handleSettingChange("resemblance", value)}
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Output Format</Label>
                    <Select
                      value={settings.outputFormat}
                      onValueChange={(value: "png" | "jpg" | "webp") => handleSettingChange("outputFormat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG (Best Quality)</SelectItem>
                        <SelectItem value="jpg">JPG (Smaller Size)</SelectItem>
                        <SelectItem value="webp">WebP (Modern)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Pre-processing</Label>
                    <Switch
                      checked={settings.enablePreProcessing}
                      onCheckedChange={(checked) => handleSettingChange("enablePreProcessing", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Post-processing</Label>
                    <Switch
                      checked={settings.enablePostProcessing}
                      onCheckedChange={(checked) => handleSettingChange("enablePostProcessing", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhance Button */}
            <Button
              onClick={handleEnhance}
              disabled={selectedFiles.length === 0 || isProcessing}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Enhance Images
                </>
              )}
            </Button>

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-gray-400">{Math.round(progress)}% Complete</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Enhanced Images</CardTitle>
                <CardDescription className="text-gray-400">
                  {enhancedImages.length === 0
                    ? "Your enhanced images will appear here"
                    : `${enhancedImages.filter((img) => img.status === "complete").length} of ${enhancedImages.length} complete`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enhancedImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No images enhanced yet</p>
                    <p className="text-sm mt-2">Upload and enhance images to see results here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enhancedImages.map((image) => (
                      <div key={image.id} className="space-y-2">
                        <Tabs defaultValue="enhanced" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="original">Original</TabsTrigger>
                            <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
                          </TabsList>
                          <TabsContent value="original" className="mt-2">
                            <img
                              src={image.originalUrl || "/placeholder.svg"}
                              alt="Original"
                              className="w-full h-64 object-contain bg-gray-900 rounded"
                            />
                          </TabsContent>
                          <TabsContent value="enhanced" className="mt-2">
                            {image.status === "processing" ? (
                              <div className="w-full h-64 flex items-center justify-center bg-gray-900 rounded">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                              </div>
                            ) : image.status === "error" ? (
                              <div className="w-full h-64 flex items-center justify-center bg-gray-900 rounded">
                                <div className="text-center text-red-400">
                                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                  <p className="text-sm">{image.error || "Enhancement failed"}</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={image.enhancedUrl || "/placeholder.svg"}
                                alt="Enhanced"
                                className="w-full h-64 object-contain bg-gray-900 rounded"
                              />
                            )}
                          </TabsContent>
                        </Tabs>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400 truncate flex-1">{image.originalName}</span>
                          {image.status === "complete" && (
                            <Button
                              size="sm"
                              onClick={() => downloadImage(image.enhancedUrl, image.originalName)}
                              className="ml-2"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Panel */}
            {selectedPreset !== "custom" && selectedPreset && (
              <Card className="mt-6 bg-blue-900/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" />
                    About {CULTURAL_PRESETS[selectedPreset].name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">{CULTURAL_PRESETS[selectedPreset].description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-200">Features:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                      {CULTURAL_PRESETS[selectedPreset].features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
