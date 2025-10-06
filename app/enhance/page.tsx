"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Upload,
  Download,
  Sparkles,
  Zap,
  ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Palette,
  Eraser,
  Layers,
  Globe,
  Sliders,
  FileImage,
  Maximize2,
  Settings,
  Shield,
  Camera,
  Heart,
  Crown,
  Info,
  RotateCcw,
  Power,
} from "lucide-react"
import Image from "next/image"
import { compressImageForUpload } from "@/utils/image-processing"
import { ImageComparisonSlider } from "@/components/image-comparison-slider"
import { SmartRecommendations } from "@/components/smart-recommendations"

interface EnhancedImage {
  id: string
  original: File
  enhanced: string
  originalPreview: string
  processingTime?: string
  model?: string
  upscaleFactor?: number
  settings?: EnhancementSettings
}

interface EnhancementSettings {
  model: string
  upscaleFactor: number
  colorize: boolean
  removeScratches: boolean
  denoise: boolean
  sharpen: number
  preset?: string
  faceEnhancement: boolean
  backgroundEnhancement: boolean
  exportFormat: "png" | "jpg" | "webp"
  exportQuality: number
  preserveAsianFeatures: boolean
  colorBoost: number
  textureEnhancement: boolean
  vintageRestoration: boolean
}

const DEFAULT_SETTINGS: EnhancementSettings = {
  model: "clarity-upscaler-face-preserve",
  upscaleFactor: 2,
  colorize: false,
  removeScratches: false,
  denoise: false,
  sharpen: 0,
  faceEnhancement: false,
  preserveAsianFeatures: false,
  backgroundEnhancement: false,
  exportFormat: "png",
  exportQuality: 95,
  colorBoost: 0,
  textureEnhancement: false,
  vintageRestoration: false,
}

const CULTURAL_PRESETS = [
  {
    id: "indonesian-wedding",
    name: "Indonesian Wedding",
    description: "Kebaya, batik & traditional wedding photos with gold accent preservation",
    icon: "👰",
    gradient: "from-rose-500/20 to-amber-500/20",
    border: "border-rose-500/30",
    settings: {
      model: "clarity-upscaler-face-preserve",
      upscaleFactor: 4,
      colorize: true,
      faceEnhancement: false,
      preserveAsianFeatures: true,
      backgroundEnhancement: true,
      sharpen: 0.8,
      denoise: true,
      removeScratches: true,
      colorBoost: 0.7,
      textureEnhancement: true,
      vintageRestoration: true,
      exportFormat: "png" as const,
      exportQuality: 98,
    },
    features: [
      "🛡️ Ultra-safe Asian face preservation",
      "✨ Gold & traditional color restoration",
      "🎨 Batik pattern enhancement",
      "📸 Professional wedding quality",
    ],
  },
  {
    id: "asean-heritage",
    name: "ASEAN Heritage",
    description: "Colonial-era photos, family archives & cultural documentation",
    icon: "🏛️",
    gradient: "from-amber-500/20 to-yellow-500/20",
    border: "border-amber-500/30",
    settings: {
      model: "clarity-upscaler-face-preserve",
      upscaleFactor: 4,
      colorize: true,
      faceEnhancement: false,
      preserveAsianFeatures: true,
      backgroundEnhancement: true,
      removeScratches: true,
      sharpen: 0.7,
      denoise: true,
      colorBoost: 0.6,
      textureEnhancement: true,
      vintageRestoration: true,
      exportFormat: "png" as const,
      exportQuality: 95,
    },
    features: [
      "📜 Colonial-era photo restoration",
      "🛡️ Southeast Asian feature preservation",
      "🎨 Period-accurate colorization",
      "🔧 Advanced damage repair",
    ],
  },
  {
    id: "family-portrait",
    name: "Family Portrait",
    description: "Multi-generational photos with natural Asian skin tone preservation",
    icon: "👨‍👩‍👧‍👦",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    settings: {
      model: "clarity-upscaler-face-preserve",
      upscaleFactor: 3,
      colorize: false,
      faceEnhancement: false,
      preserveAsianFeatures: true,
      backgroundEnhancement: true,
      sharpen: 0.5,
      denoise: true,
      removeScratches: true,
      colorBoost: 0.3,
      textureEnhancement: false,
      vintageRestoration: false,
      exportFormat: "png" as const,
      exportQuality: 95,
    },
    features: [
      "👥 Multiple face preservation",
      "🌸 Natural Asian skin tones",
      "🎯 Gentle enhancement only",
      "❤️ Family memory safe",
    ],
  },
  {
    id: "old-document",
    name: "Historical Archive",
    description: "Documents, certificates, newspapers & vintage photographs",
    icon: "📜",
    gradient: "from-gray-500/20 to-slate-500/20",
    border: "border-gray-500/30",
    settings: {
      model: "clarity-upscaler-no-face",
      upscaleFactor: 4,
      colorize: false,
      faceEnhancement: false,
      preserveAsianFeatures: true,
      backgroundEnhancement: true,
      removeScratches: true,
      sharpen: 0.9,
      denoise: true,
      colorBoost: 0,
      textureEnhancement: true,
      vintageRestoration: true,
      exportFormat: "png" as const,
      exportQuality: 98,
    },
    features: [
      "📋 Document clarity enhancement",
      "🔍 Text sharpening",
      "🧹 Stain & fold removal",
      "📖 Archive-quality output",
    ],
  },
  {
    id: "batik-textile",
    name: "Batik & Textiles",
    description: "Traditional fabrics, songket, ikat & cultural patterns",
    icon: "🎨",
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    settings: {
      model: "real-esrgan-4x",
      upscaleFactor: 4,
      colorize: true,
      faceEnhancement: false,
      preserveAsianFeatures: false,
      backgroundEnhancement: false,
      sharpen: 1.0,
      denoise: false,
      removeScratches: false,
      colorBoost: 0.9,
      textureEnhancement: true,
      vintageRestoration: false,
      exportFormat: "png" as const,
      exportQuality: 100,
    },
    features: [
      "🧵 Pattern detail extraction",
      "🌈 Vibrant color restoration",
      "✨ Textile texture enhancement",
      "🎭 Cultural motif clarity",
    ],
  },
  {
    id: "vintage-photo",
    name: "Vintage Photo Pro",
    description: "1920s-1990s photos with era-specific restoration",
    icon: "📷",
    gradient: "from-sepia-500/20 to-amber-700/20",
    border: "border-amber-700/30",
    settings: {
      model: "clarity-upscaler-face-preserve",
      upscaleFactor: 3,
      colorize: true,
      faceEnhancement: false,
      preserveAsianFeatures: true,
      backgroundEnhancement: true,
      removeScratches: true,
      sharpen: 0.6,
      denoise: true,
      colorBoost: 0.5,
      textureEnhancement: true,
      vintageRestoration: true,
      exportFormat: "jpg" as const,
      exportQuality: 92,
    },
    features: [
      "⏰ Era-appropriate enhancement",
      "🎞️ Film grain preservation option",
      "🖼️ Professional restoration",
      "💾 Optimized file size",
    ],
  },
]

export default function EnhancePage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTab, setCurrentTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const [settings, setSettings] = useState<EnhancementSettings>({
    model: "clarity-upscaler-face-preserve",
    upscaleFactor: 4,
    colorize: false,
    removeScratches: false,
    denoise: true,
    sharpen: 0.5,
    faceEnhancement: false,
    preserveAsianFeatures: true,
    backgroundEnhancement: true,
    exportFormat: "png",
    exportQuality: 95,
    colorBoost: 0.5,
    textureEnhancement: false,
    vintageRestoration: false,
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles])
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 15 * 1024 * 1024,
  })

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeEnhancedImage = (id: string) => {
    setEnhancedImages((prev) => prev.filter((img) => img.id !== id))
  }

  const applyPreset = (preset: (typeof CULTURAL_PRESETS)[0]) => {
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
      preset: preset.id,
    }))
    setSelectedPreset(preset.id)
  }

  const handleApplyRecommendation = (presetId: string) => {
    const preset = CULTURAL_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      applyPreset(preset)
    }
  }

  const resetAllFilters = () => {
    setSettings(DEFAULT_SETTINGS)
    setSelectedPreset(null)
  }

  const handleEnhance = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one image")
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress(0)
    setCurrentTab("enhanced")

    const totalFiles = uploadedFiles.length

    for (let i = 0; i < totalFiles; i++) {
      const file = uploadedFiles[i]

      try {
        console.log(`🔄 Processing file ${i + 1}/${totalFiles}: ${file.name}`)
        console.log(`📦 Original size: ${Math.round(file.size / 1024)}KB`)
        console.log("⚙️ Settings:", settings)

        let processedFile = file
        if (file.size > 1024 * 1024) {
          console.log("🔄 Compressing image...")
          processedFile = await compressImageForUpload(file, 1)
          console.log(`✅ Compressed to: ${Math.round(processedFile.size / 1024)}KB`)
        }

        const formData = new FormData()
        formData.append("file", processedFile)
        formData.append("settings", JSON.stringify(settings))

        console.log("📤 Sending to API...")

        const response = await fetch("/api/enhance-replicate", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()
        console.log("📥 API Response:", data)

        if (!response.ok) {
          throw new Error(data.error || `API error: ${response.status}`)
        }

        if (!data.success) {
          throw new Error(data.error || "Enhancement failed")
        }

        const enhancedUrl = data.downloadUrl

        if (!enhancedUrl) {
          throw new Error("No enhanced image URL received")
        }

        const originalPreview = URL.createObjectURL(file)

        const enhancedImage: EnhancedImage = {
          id: `${Date.now()}-${i}`,
          original: file,
          enhanced: enhancedUrl,
          originalPreview,
          processingTime: data.processingTime,
          model: data.model,
          upscaleFactor: data.upscaleFactor,
          settings: settings,
        }

        setEnhancedImages((prev) => [...prev, enhancedImage])
        console.log(`✅ Enhanced successfully: ${file.name}`)
      } catch (error: any) {
        console.error(`❌ Error processing ${file.name}:`, error)
        setError(`Failed to enhance ${file.name}: ${error.message}`)
      }

      setProgress(((i + 1) / totalFiles) * 100)
    }

    setIsProcessing(false)
    setUploadedFiles([])
  }

  const downloadImage = async (url: string, filename: string, format: string = settings.exportFormat) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `enhanced-${filename.replace(/\.[^/.]+$/, "")}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Download failed:", error)
      setError("Failed to download image")
    }
  }

  const downloadAll = async () => {
    for (const img of enhancedImages) {
      await downloadImage(img.enhanced, img.original.name)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  const isFiltersActive =
    selectedPreset !== null ||
    settings.colorize ||
    settings.removeScratches ||
    settings.textureEnhancement ||
    settings.vintageRestoration ||
    settings.colorBoost > 0 ||
    settings.sharpen > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-8 md:mb-12">
          <Badge className="bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-400 border-amber-500/30">
            <Crown className="w-4 h-4 mr-2 inline" />
            Professional ASEAN Heritage Restoration
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">Cultural Photo Enhancement</h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            AI-powered restoration specially trained for Southeast Asian heritage, weddings, and family memories
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="outline" className="bg-gray-900/50 border-amber-500/30 text-amber-400">
              <Shield className="w-3 h-3 mr-1" />
              ASEAN Face Safe
            </Badge>
            <Badge variant="outline" className="bg-gray-900/50 border-rose-500/30 text-rose-400">
              <Heart className="w-3 h-3 mr-1" />
              Wedding Optimized
            </Badge>
            <Badge variant="outline" className="bg-gray-900/50 border-purple-500/30 text-purple-400">
              <Palette className="w-3 h-3 mr-1" />
              Smart Colorization
            </Badge>
            <Badge variant="outline" className="bg-gray-900/50 border-blue-500/30 text-blue-400">
              <Camera className="w-3 h-3 mr-1" />
              Vintage Restoration
            </Badge>
          </div>
        </div>

        {/* Smart AI Recommendations */}
        {uploadedFiles.length > 0 && (
          <div className="mb-8">
            <SmartRecommendations
              files={uploadedFiles}
              onApplyRecommendation={handleApplyRecommendation}
              selectedPreset={selectedPreset}
            />
          </div>
        )}

        {/* Cultural Presets Section */}
        <Card className="mb-8 bg-gradient-to-br from-amber-500/5 to-rose-500/5 border-amber-500/20 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                  <Globe className="w-6 h-6 text-amber-400" />
                  Cultural Heritage Presets
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  One-click professional presets trained on Southeast Asian heritage photos
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {selectedPreset && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {CULTURAL_PRESETS.find((p) => p.id === selectedPreset)?.name} Active
                  </Badge>
                )}
                {isFiltersActive && (
                  <Button
                    onClick={resetAllFilters}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                  >
                    <Power className="w-4 h-4 mr-2" />
                    All Filters OFF
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CULTURAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`group relative p-5 rounded-xl border-2 transition-all text-left hover:scale-105 hover:shadow-xl ${
                    selectedPreset === preset.id
                      ? `${preset.border} bg-gradient-to-br ${preset.gradient} shadow-lg`
                      : "border-gray-700 bg-gray-900/50 hover:border-amber-500/50"
                  }`}
                >
                  {selectedPreset === preset.id && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    </div>
                  )}

                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{preset.icon}</div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {preset.name}
                  </h3>

                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{preset.description}</p>

                  <div className="space-y-1 mb-3">
                    {preset.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="text-xs text-gray-500 flex items-start gap-1">
                        <span className="mt-0.5">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-700">
                    <Badge variant="secondary" className="text-xs bg-gray-800/50 text-gray-400">
                      {preset.settings.upscaleFactor}x
                    </Badge>
                    {preset.settings.colorize && (
                      <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                        Color
                      </Badge>
                    )}
                    {preset.settings.removeScratches && (
                      <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">
                        Repair
                      </Badge>
                    )}
                    {preset.settings.preserveAsianFeatures && (
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-300">
                        ASEAN Safe
                      </Badge>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                </button>
              ))}
            </div>

            {selectedPreset && (
              <Card className="mt-6 bg-gradient-to-br from-amber-500/10 to-rose-500/10 border-amber-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{CULTURAL_PRESETS.find((p) => p.id === selectedPreset)?.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-2">
                        {CULTURAL_PRESETS.find((p) => p.id === selectedPreset)?.name} - Active Features:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {CULTURAL_PRESETS.find((p) => p.id === selectedPreset)?.features.map((feature, idx) => (
                          <div key={idx} className="text-xs text-gray-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Advanced Settings Panel */}
        <Card className="mb-8 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  Advanced Enhancement Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Fine-tune your enhancement beyond preset defaults
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                  <Info className="w-3 h-3 mr-1" />
                  AI-Optimized
                </Badge>
                {isFiltersActive && (
                  <Button
                    onClick={resetAllFilters}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:bg-gray-800 bg-transparent"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Default
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  AI Model
                </Label>
                <Select value={settings.model} onValueChange={(value) => setSettings({ ...settings, model: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="clarity-upscaler-face-preserve">🛡️ Clarity (ASEAN Face Preserve)</SelectItem>
                    <SelectItem value="clarity-upscaler">⚡ Clarity (Standard)</SelectItem>
                    <SelectItem value="clarity-upscaler-no-face">🖼️ Clarity (No Face)</SelectItem>
                    <SelectItem value="real-esrgan-2x">🔥 Real-ESRGAN 2x</SelectItem>
                    <SelectItem value="real-esrgan-4x">💎 Real-ESRGAN 4x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                  Upscale: {settings.upscaleFactor}x
                </Label>
                <Slider
                  value={[settings.upscaleFactor]}
                  onValueChange={(value) => setSettings({ ...settings, upscaleFactor: value[0] })}
                  min={2}
                  max={4}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Final: {settings.upscaleFactor * 100}% of original size</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Sharpness: {Math.round(settings.sharpen * 100)}%
                </Label>
                <Slider
                  value={[settings.sharpen * 100]}
                  onValueChange={(value) => setSettings({ ...settings, sharpen: value[0] / 100 })}
                  min={0}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  Color Boost: {Math.round(settings.colorBoost * 100)}%
                </Label>
                <Slider
                  value={[settings.colorBoost * 100]}
                  onValueChange={(value) => setSettings({ ...settings, colorBoost: value[0] / 100 })}
                  min={0}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-amber-400" />
                  Format
                </Label>
                <Select
                  value={settings.exportFormat}
                  onValueChange={(value: any) => setSettings({ ...settings, exportFormat: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="png">PNG (Best quality)</SelectItem>
                    <SelectItem value="jpg">JPG (Smaller size)</SelectItem>
                    <SelectItem value="webp">WebP (Modern)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Quality: {settings.exportQuality}%
                </Label>
                <Slider
                  value={[settings.exportQuality]}
                  onValueChange={(value) => setSettings({ ...settings, exportQuality: value[0] })}
                  min={60}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 col-span-1">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <Label className="text-xs text-gray-300">Colorize</Label>
                </div>
                <Switch
                  checked={settings.colorize}
                  onCheckedChange={(checked) => setSettings({ ...settings, colorize: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 col-span-1">
                <div className="flex items-center gap-2">
                  <Eraser className="w-4 h-4 text-blue-400" />
                  <Label className="text-xs text-gray-300">Repair</Label>
                </div>
                <Switch
                  checked={settings.removeScratches}
                  onCheckedChange={(checked) => setSettings({ ...settings, removeScratches: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 col-span-1">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <Label className="text-xs text-gray-300">Denoise</Label>
                </div>
                <Switch
                  checked={settings.denoise}
                  onCheckedChange={(checked) => setSettings({ ...settings, denoise: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 col-span-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <Label className="text-xs text-gray-300">ASEAN</Label>
                </div>
                <Switch
                  checked={settings.preserveAsianFeatures}
                  onCheckedChange={(checked) => setSettings({ ...settings, preserveAsianFeatures: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 col-span-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <Label className="text-xs text-gray-300">Texture</Label>
                </div>
                <Switch
                  checked={settings.textureEnhancement}
                  onCheckedChange={(checked) => setSettings({ ...settings, textureEnhancement: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 col-span-1">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <Label className="text-xs text-gray-300">Vintage</Label>
                </div>
                <Switch
                  checked={settings.vintageRestoration}
                  onCheckedChange={(checked) => setSettings({ ...settings, vintageRestoration: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 col-span-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <Label className="text-xs text-gray-300">BG</Label>
                </div>
                <Switch
                  checked={settings.backgroundEnhancement}
                  onCheckedChange={(checked) => setSettings({ ...settings, backgroundEnhancement: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-gray-800/50">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload ({uploadedFiles.length})
            </TabsTrigger>
            <TabsTrigger value="enhanced">
              <ImageIcon className="w-4 h-4 mr-2" />
              Enhanced ({enhancedImages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 border-2 border-dashed hover:border-amber-500/50 transition-colors">
              <CardContent className="p-8 md:p-12">
                <div
                  {...getRootProps()}
                  className={`text-center space-y-4 cursor-pointer ${isDragActive ? "opacity-50" : ""}`}
                >
                  <input {...getInputProps()} />
                  <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                    <Upload className="w-10 h-10 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white mb-2">
                      {isDragActive ? "Drop images here..." : "Drag & drop images here"}
                    </p>
                    <p className="text-base text-gray-400">or click to browse (PNG, JPG, WebP • Max 15MB)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="bg-red-500/10 border-red-500/50">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {uploadedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Ready to Enhance ({uploadedFiles.length})</h3>
                  <Button
                    onClick={handleEnhance}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold shadow-lg hover:shadow-amber-500/50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Enhance All Images
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <Card key={index} className="bg-gray-900/50 border-gray-800 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="aspect-video relative bg-gray-800 rounded-lg overflow-hidden mb-3">
                          <Image
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={file.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {isProcessing && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                      <p className="text-white font-medium">
                        Enhancing with{" "}
                        {selectedPreset
                          ? CULTURAL_PRESETS.find((p) => p.id === selectedPreset)?.name
                          : "custom settings"}
                        ...
                      </p>
                    </div>
                    <p className="text-amber-400 font-mono text-lg font-bold">{Math.round(progress)}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-400">
                    Processing your images with AI. This may take 30-90 seconds per image depending on complexity.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-6">
            {enhancedImages.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-12 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-lg text-gray-400 mb-2">No enhanced images yet</p>
                  <p className="text-sm text-gray-500">Upload and enhance images to see results here</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Enhanced Images ({enhancedImages.length})</h3>
                  <Button
                    onClick={downloadAll}
                    variant="outline"
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {enhancedImages.map((img) => (
                    <Card key={img.id} className="bg-gray-900/50 border-gray-800">
                      <CardContent className="p-4 space-y-4">
                        <div className="relative rounded-lg overflow-hidden bg-gray-800">
                          <ImageComparisonSlider
                            beforeImage={img.originalPreview}
                            afterImage={img.enhanced}
                            beforeLabel="Original"
                            afterLabel="Enhanced"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              <span className="truncate">{img.original.name}</span>
                            </div>
                            {img.processingTime && (
                              <Badge variant="outline" className="text-xs">
                                ⚡ {img.processingTime}
                              </Badge>
                            )}
                          </div>

                          {img.settings && (
                            <div className="flex flex-wrap gap-1">
                              {img.settings.preset && (
                                <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-300">
                                  {CULTURAL_PRESETS.find((p) => p.id === img.settings?.preset)?.icon}{" "}
                                  {CULTURAL_PRESETS.find((p) => p.id === img.settings?.preset)?.name}
                                </Badge>
                              )}
                              {img.settings.colorize && (
                                <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                                  Colorized
                                </Badge>
                              )}
                              {img.settings.removeScratches && (
                                <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">
                                  Repaired
                                </Badge>
                              )}
                              {img.settings.preserveAsianFeatures && (
                                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-300">
                                  ASEAN Safe
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => downloadImage(img.enhanced, img.original.name)}
                            className="flex-1 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-400 border border-amber-500/30"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEnhancedImage(img.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
