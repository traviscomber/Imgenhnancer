"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Sparkles,
  Download,
  ImageIcon,
  Loader2,
  Settings,
  Palette,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react"
import { SmartRecommendations } from "@/components/smart-recommendations"
import { BatchProcessorUI } from "@/components/batch-processor-ui"

interface EnhancedImage {
  id: string
  original: string
  enhanced: string
  timestamp: number
  settings: EnhancementSettings
}

interface EnhancementSettings {
  model: string
  upscaleFactor: number
  colorize: boolean
  removeScratches: boolean
  preserveFaces: boolean
  enhanceDetails: boolean
  colorBoost: number
  sharpness: number
  noiseReduction: boolean
}

const CULTURAL_PRESETS = {
  "indonesian-wedding": {
    name: "Indonesian Wedding",
    description: "Perfect for traditional wedding photos with kebaya or batik",
    icon: "💍",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 4,
      colorize: true,
      removeScratches: true,
      preserveFaces: true,
      enhanceDetails: true,
      colorBoost: 30,
      sharpness: 20,
      noiseReduction: true,
    },
  },
  "asean-heritage": {
    name: "ASEAN Heritage",
    description: "Optimized for vintage ASEAN family photos from 1920s-1980s",
    icon: "🏛️",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 4,
      colorize: true,
      removeScratches: true,
      preserveFaces: true,
      enhanceDetails: true,
      colorBoost: 25,
      sharpness: 15,
      noiseReduction: true,
    },
  },
  "family-portrait": {
    name: "Family Portrait",
    description: "Great for modern family photos with natural skin tones",
    icon: "👨‍👩‍👧‍👦",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 3,
      colorize: false,
      removeScratches: false,
      preserveFaces: true,
      enhanceDetails: true,
      colorBoost: 10,
      sharpness: 10,
      noiseReduction: false,
    },
  },
  "vintage-photo": {
    name: "Vintage Photo",
    description: "Best for aged color photos from 1960s-1990s",
    icon: "📷",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 4,
      colorize: true,
      removeScratches: true,
      preserveFaces: true,
      enhanceDetails: true,
      colorBoost: 20,
      sharpness: 15,
      noiseReduction: true,
    },
  },
  "batik-textile": {
    name: "Batik & Textiles",
    description: "Optimized for batik patterns and traditional textiles",
    icon: "🧵",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 4,
      colorize: true,
      removeScratches: true,
      preserveFaces: false,
      enhanceDetails: true,
      colorBoost: 35,
      sharpness: 25,
      noiseReduction: true,
    },
  },
  "old-document": {
    name: "Historical Document",
    description: "Perfect for old certificates, letters, and documents",
    icon: "📜",
    settings: {
      model: "clarity-upscaler",
      upscaleFactor: 3,
      colorize: false,
      removeScratches: true,
      preserveFaces: false,
      enhanceDetails: true,
      colorBoost: 0,
      sharpness: 30,
      noiseReduction: true,
    },
  },
}

const DEFAULT_SETTINGS: EnhancementSettings = {
  model: "clarity-upscaler",
  upscaleFactor: 2,
  colorize: false,
  removeScratches: false,
  preserveFaces: false,
  enhanceDetails: false,
  colorBoost: 0,
  sharpness: 0,
  noiseReduction: false,
}

export default function EnhancePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([])
  const [error, setError] = useState<string>("")
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [settings, setSettings] = useState<EnhancementSettings>(DEFAULT_SETTINGS)
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single")

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError("")
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError("")
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const applyPreset = useCallback((presetKey: string) => {
    const preset = CULTURAL_PRESETS[presetKey as keyof typeof CULTURAL_PRESETS]
    if (!preset) return

    setSettings(preset.settings)
    setSelectedPreset(presetKey)
  }, [])

  const resetAllFilters = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    setSelectedPreset(null)
  }, [])

  const hasActiveFilters = () => {
    return (
      settings.colorize ||
      settings.removeScratches ||
      settings.preserveFaces ||
      settings.enhanceDetails ||
      settings.colorBoost > 0 ||
      settings.sharpness > 0 ||
      settings.noiseReduction ||
      settings.upscaleFactor > 2
    )
  }

  const handleEnhance = async () => {
    if (!uploadedFile) {
      setError("Please upload an image first")
      return
    }

    setIsEnhancing(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)
      formData.append("settings", JSON.stringify(settings))

      console.log("🚀 Starting enhancement with settings:", settings)

      const response = await fetch("/api/enhance-replicate", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Enhancement failed")
      }

      console.log("✅ Enhancement complete:", data)

      const newImage: EnhancedImage = {
        id: Date.now().toString(),
        original: previewUrl,
        enhanced: data.downloadUrl,
        timestamp: Date.now(),
        settings: { ...settings },
      }

      setEnhancedImages((prev) => [newImage, ...prev])
    } catch (err) {
      console.error("❌ Enhancement error:", err)
      setError(err instanceof Error ? err.message : "Failed to enhance image")
    } finally {
      setIsEnhancing(false)
    }
  }

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `enhanced-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">AI Image Enhancement</h1>
          <p className="text-gray-400 text-lg">Upload your photos and let AI restore them to glory</p>
        </div>

        {/* Mode Selector */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={activeTab === "single" ? "default" : "outline"}
                onClick={() => setActiveTab("single")}
                className={activeTab === "single" ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                <Upload className="w-4 h-4 mr-2" />
                Single Image
              </Button>
              <Button
                variant={activeTab === "batch" ? "default" : "outline"}
                onClick={() => setActiveTab("batch")}
                className={activeTab === "batch" ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                <Package className="w-4 h-4 mr-2" />
                Batch Processing
                <Badge className="ml-2 bg-green-500">NEW</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Single Image Mode */}
        {activeTab === "single" && (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="upload" className="data-[state=active]:bg-amber-500">
                <Upload className="w-4 h-4 mr-2" />
                Upload & Enhance
              </TabsTrigger>
              <TabsTrigger value="enhanced" className="data-[state=active]:bg-amber-500">
                <ImageIcon className="w-4 h-4 mr-2" />
                Enhanced Images ({enhancedImages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6 mt-6">
              {/* Upload Area */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Upload Image</CardTitle>
                  <CardDescription>Drag and drop or click to upload your photo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-amber-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Drag & drop your image here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>

                  {previewUrl && (
                    <div className="mt-6">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="max-w-full h-auto rounded-lg mx-auto max-h-96 object-contain"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              {uploadedFile && (
                <SmartRecommendations
                  uploadedFile={uploadedFile}
                  onApplyRecommendation={applyPreset}
                  currentPreset={selectedPreset}
                />
              )}

              {/* Cultural Presets */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Cultural Presets
                    </CardTitle>
                    <CardDescription>One-click presets optimized for ASEAN heritage photos</CardDescription>
                  </div>
                  {hasActiveFilters() && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={resetAllFilters}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      All Filters OFF
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(CULTURAL_PRESETS).map(([key, preset]) => (
                      <Card
                        key={key}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          selectedPreset === key
                            ? "bg-gradient-to-br from-amber-500/20 to-rose-500/20 border-amber-500"
                            : "bg-gray-800 border-gray-700 hover:border-amber-500"
                        }`}
                        onClick={() => applyPreset(key)}
                      >
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="text-3xl">{preset.icon}</span>
                            {selectedPreset === key && (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-white">{preset.name}</h3>
                          <p className="text-sm text-gray-400">{preset.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Advanced Settings
                    </CardTitle>
                    <CardDescription>Fine-tune your enhancement parameters</CardDescription>
                  </div>
                  {hasActiveFilters() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetAllFilters}
                      className="border-gray-600 hover:bg-gray-800 bg-transparent"
                    >
                      Reset to Default
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label className="text-white">AI Model</Label>
                    <Select
                      value={settings.model}
                      onValueChange={(value) => setSettings({ ...settings, model: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="clarity-upscaler">Clarity (ASEAN Face Preserve)</SelectItem>
                        <SelectItem value="real-esrgan">Real-ESRGAN (Best Quality)</SelectItem>
                        <SelectItem value="esrgan">ESRGAN (Balanced)</SelectItem>
                        <SelectItem value="gfpgan">GFPGAN (Face Focus)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Upscale Factor */}
                  <div className="space-y-2">
                    <Label className="text-white">Upscale Factor: {settings.upscaleFactor}x</Label>
                    <Slider
                      value={[settings.upscaleFactor]}
                      onValueChange={(value) => setSettings({ ...settings, upscaleFactor: value[0] })}
                      min={2}
                      max={4}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  {/* Enhancement Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                      <div>
                        <Label className="text-white">Colorize B&W</Label>
                        <p className="text-xs text-gray-400">Add color to black & white photos</p>
                      </div>
                      <Switch
                        checked={settings.colorize}
                        onCheckedChange={(checked) => setSettings({ ...settings, colorize: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                      <div>
                        <Label className="text-white">Remove Scratches</Label>
                        <p className="text-xs text-gray-400">Fix damage and artifacts</p>
                      </div>
                      <Switch
                        checked={settings.removeScratches}
                        onCheckedChange={(checked) => setSettings({ ...settings, removeScratches: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                      <div>
                        <Label className="text-white">ASEAN Face Safe</Label>
                        <p className="text-xs text-gray-400">Preserve Asian facial features</p>
                      </div>
                      <Switch
                        checked={settings.preserveFaces}
                        onCheckedChange={(checked) => setSettings({ ...settings, preserveFaces: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                      <div>
                        <Label className="text-white">Enhance Details</Label>
                        <p className="text-xs text-gray-400">Sharpen fine details</p>
                      </div>
                      <Switch
                        checked={settings.enhanceDetails}
                        onCheckedChange={(checked) => setSettings({ ...settings, enhanceDetails: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                      <div>
                        <Label className="text-white">Noise Reduction</Label>
                        <p className="text-xs text-gray-400">Remove grain and noise</p>
                      </div>
                      <Switch
                        checked={settings.noiseReduction}
                        onCheckedChange={(checked) => setSettings({ ...settings, noiseReduction: checked })}
                      />
                    </div>
                  </div>

                  {/* Fine-tuning Sliders */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Color Boost: {settings.colorBoost}%</Label>
                      <Slider
                        value={[settings.colorBoost]}
                        onValueChange={(value) => setSettings({ ...settings, colorBoost: value[0] })}
                        min={0}
                        max={50}
                        step={5}
                        className="py-4"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Sharpness: {settings.sharpness}%</Label>
                      <Slider
                        value={[settings.sharpness]}
                        onValueChange={(value) => setSettings({ ...settings, sharpness: value[0] })}
                        min={0}
                        max={50}
                        step={5}
                        className="py-4"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhance Button */}
              <Card className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/30">
                <CardContent className="p-6">
                  {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleEnhance}
                    disabled={!uploadedFile || isEnhancing}
                    className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold py-6 text-lg"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Enhance Image
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enhanced" className="space-y-6 mt-6">
              {enhancedImages.length === 0 ? (
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-12 text-center">
                    <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No enhanced images yet</p>
                    <p className="text-sm text-gray-500 mt-2">Upload and enhance images to see them here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {enhancedImages.map((image) => (
                    <Card key={image.id} className="bg-gray-900 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">
                          Enhanced {new Date(image.timestamp).toLocaleString()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Original</p>
                            <img
                              src={image.original || "/placeholder.svg"}
                              alt="Original"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Enhanced</p>
                            <img
                              src={image.enhanced || "/placeholder.svg"}
                              alt="Enhanced"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={() => downloadImage(image.enhanced)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Enhanced Image
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Batch Processing Mode */}
        {activeTab === "batch" && (
          <BatchProcessorUI
            settings={settings}
            onComplete={(results) => {
              console.log("✅ Batch complete:", results)
              // Optionally add to enhanced images
              const newImages = results
                .filter((r) => r.status === "completed" && r.result)
                .map((r) => ({
                  id: r.id,
                  original: r.result!.original,
                  enhanced: r.result!.enhanced,
                  timestamp: Date.now(),
                  settings: { ...settings },
                }))
              setEnhancedImages((prev) => [...newImages, ...prev])
            }}
          />
        )}
      </div>
    </div>
  )
}
