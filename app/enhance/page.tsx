"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Info,
} from "lucide-react"
import Image from "next/image"
import { compressImageForUpload } from "@/utils/image-processing"

interface EnhancedImage {
  id: string
  original: File
  enhanced: string
  originalPreview: string
  processingTime?: string
  model?: string
  settings?: EnhancementSettings
}

interface EnhancementSettings {
  model: string
  upscaleFactor: number
  creativity: number
  resemblance: number
  hdr: number
  prompt?: string
}

// Optimal presets that generated our best images
const OPTIMAL_PRESETS = {
  "indonesian-wedding": {
    name: "🤵👰 Indonesian Wedding",
    description: "Perfect for Javanese, Sundanese, Minang traditional weddings",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.35,
      resemblance: 0.75,
      hdr: 0,
      prompt: "professional photo, Indonesian wedding, traditional attire, cultural preservation",
    },
    features: ["Kebaya Detail", "Batik Preservation", "Face Protection", "Rich Colors"],
  },
  "modern-portrait": {
    name: "📸 Modern Portrait",
    description: "Contemporary portraits with natural ASEAN skin tones",
    settings: {
      model: "philz1337x/clarity-upscaler",
      upscaleFactor: 2,
      creativity: 0.35,
      resemblance: 0.8,
      hdr: 0,
      prompt: "professional portrait photo, natural lighting, Asian features",
    },
    features: ["Natural Skin", "Sharp Details", "Face Safe", "Studio Quality"],
  },
}

export default function EnhancePage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTab, setCurrentTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof OPTIMAL_PRESETS>("indonesian-wedding")
  const [settings, setSettings] = useState<EnhancementSettings>(OPTIMAL_PRESETS["indonesian-wedding"].settings)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles])
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 15 * 1024 * 1024, // 15MB
  })

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeEnhancedImage = (id: string) => {
    setEnhancedImages((prev) => prev.filter((img) => img.id !== id))
  }

  const applyPreset = (presetKey: keyof typeof OPTIMAL_PRESETS) => {
    setSelectedPreset(presetKey)
    setSettings(OPTIMAL_PRESETS[presetKey].settings)
    setShowAdvanced(false)
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
        console.log(`⚙️ Settings:`, settings)

        // Compress image if needed
        let processedFile = file
        if (file.size > 1024 * 1024) {
          console.log("🔄 Compressing image...")
          processedFile = await compressImageForUpload(file, 1)
          console.log(`✅ Compressed to: ${Math.round(processedFile.size / 1024)}KB`)
        }

        // Create FormData
        const formData = new FormData()
        formData.append("image", processedFile)
        formData.append("model", settings.model)
        formData.append("scale_factor", settings.upscaleFactor.toString())
        formData.append("dynamic", settings.creativity.toString())
        formData.append("creativity", settings.creativity.toString())
        formData.append("resemblance", settings.resemblance.toString())
        formData.append("hdr", settings.hdr.toString())
        if (settings.prompt) {
          formData.append("prompt", settings.prompt)
        }

        console.log("📤 Sending to API with settings:", {
          model: settings.model,
          upscaleFactor: settings.upscaleFactor,
          creativity: settings.creativity,
          resemblance: settings.resemblance,
          hdr: settings.hdr,
          prompt: settings.prompt,
        })

        // Send to API
        const response = await fetch("/api/enhance-replicate", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()
        console.log("📥 API Response:", data)

        if (!response.ok) {
          throw new Error(data.error || `API error: ${response.status}`)
        }

        if (!data.success || !data.output) {
          throw new Error(data.error || "Enhancement failed")
        }

        // Create preview URL for original
        const originalPreview = URL.createObjectURL(file)

        // Add to enhanced images
        const enhancedImage: EnhancedImage = {
          id: `${Date.now()}-${i}`,
          original: file,
          enhanced: data.output,
          originalPreview,
          processingTime: data.processingTime,
          model: settings.model,
          settings: { ...settings },
        }

        setEnhancedImages((prev) => [...prev, enhancedImage])

        console.log(`✅ Enhanced successfully: ${file.name}`)
      } catch (error: any) {
        console.error(`❌ Error processing ${file.name}:`, error)
        setError(`Failed to enhance ${file.name}: ${error.message}`)
      }

      // Update progress
      setProgress(((i + 1) / totalFiles) * 100)
    }

    setIsProcessing(false)
    setUploadedFiles([]) // Clear uploaded files after processing
  }

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `enhanced-${filename}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Download failed:", error)
      setError("Failed to download image")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-8 md:mb-12">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            ASEAN-Optimized AI Enhancement
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">Enhance Your Images</h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Professional-grade enhancement with Southeast Asian facial feature preservation
          </p>
        </div>

        {/* Presets - Prominent Display */}
        <Card className="mb-8 bg-gradient-to-br from-amber-500/5 to-rose-500/5 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Enhancement Presets
            </CardTitle>
            <p className="text-sm text-gray-400">Choose the preset that created our best results</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(OPTIMAL_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key as keyof typeof OPTIMAL_PRESETS)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedPreset === key
                      ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                      : "border-gray-700 bg-gray-800/50 hover:border-amber-500/50"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">{preset.name}</h3>
                      {selectedPreset === key && <CheckCircle2 className="w-6 h-6 text-amber-400" />}
                    </div>
                    <p className="text-sm text-gray-300">{preset.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {preset.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-amber-500/20 text-amber-300 text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    {selectedPreset === key && (
                      <div className="mt-3 pt-3 border-t border-amber-500/20">
                        <div className="text-xs text-amber-400 space-y-1">
                          <div>Creativity: {preset.settings.creativity}</div>
                          <div>Resemblance: {preset.settings.resemblance}</div>
                          <div>Upscale: {preset.settings.upscaleFactor}x</div>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4 bg-transparent border-gray-700 hover:border-amber-500/50"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide" : "Show"} Advanced Settings
            </Button>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        {showAdvanced && (
          <Card className="mb-8 bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Advanced Settings
              </CardTitle>
              <p className="text-sm text-gray-400">Fine-tune the enhancement parameters</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upscale Factor */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                    <span>Upscale Factor</span>
                    <span className="text-amber-400">{settings.upscaleFactor}x</span>
                  </label>
                  <Slider
                    value={[settings.upscaleFactor]}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, upscaleFactor: value[0] }))}
                    min={2}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Higher = larger output (slower)</p>
                </div>

                {/* Creativity */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                    <span>Creativity</span>
                    <span className="text-amber-400">{settings.creativity.toFixed(2)}</span>
                  </label>
                  <Slider
                    value={[settings.creativity]}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, creativity: value[0] }))}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">0.35 optimal for faces</p>
                </div>

                {/* Resemblance */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                    <span>Resemblance</span>
                    <span className="text-amber-400">{settings.resemblance.toFixed(2)}</span>
                  </label>
                  <Slider
                    value={[settings.resemblance]}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, resemblance: value[0] }))}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">0.75-0.8 preserves ASEAN features</p>
                </div>

                {/* HDR */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                    <span>HDR Strength</span>
                    <span className="text-amber-400">{settings.hdr}</span>
                  </label>
                  <Slider
                    value={[settings.hdr]}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, hdr: value[0] }))}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">0 recommended for portraits</p>
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">AI Model</label>
                <Select
                  value={settings.model}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, model: value }))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="philz1337x/clarity-upscaler">Clarity Upscaler (Best for ASEAN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Enhancement Prompt (Optional)</label>
                <textarea
                  value={settings.prompt || ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, prompt: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none focus:border-amber-500 focus:outline-none"
                  rows={2}
                  placeholder="e.g., professional photo, cultural attire, natural lighting"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card className="mb-8 bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">ASEAN Face Preservation Active</p>
              <p className="text-blue-400/80">
                These settings (Creativity: 0.35, Resemblance: 0.75-0.8) have been optimized to preserve Indonesian,
                Malaysian, Thai, Filipino, and other Southeast Asian facial features without modification.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-gray-800/50">
            <TabsTrigger value="upload" className="text-sm md:text-base">
              <Upload className="w-4 h-4 mr-2" />
              Upload ({uploadedFiles.length})
            </TabsTrigger>
            <TabsTrigger value="enhanced" className="text-sm md:text-base">
              <ImageIcon className="w-4 h-4 mr-2" />
              Enhanced ({enhancedImages.length})
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            {/* Dropzone */}
            <Card className="bg-gray-900/50 border-gray-800 border-2 border-dashed hover:border-amber-500/50 transition-colors">
              <CardContent className="p-8 md:p-12">
                <div
                  {...getRootProps()}
                  className={`text-center space-y-4 cursor-pointer ${isDragActive ? "opacity-50" : ""}`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-semibold text-white mb-2">
                      {isDragActive ? "Drop images here..." : "Drag & drop images here"}
                    </p>
                    <p className="text-sm md:text-base text-gray-400">or click to browse (PNG, JPG, WebP • Max 15MB)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="bg-red-500/10 border-red-500/50">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Uploaded Files ({uploadedFiles.length})</h3>
                  <Button
                    onClick={handleEnhance}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Enhance All
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <Card key={index} className="bg-gray-900/50 border-gray-800">
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

            {/* Processing Progress */}
            {isProcessing && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium">Processing with ASEAN preservation...</p>
                    <p className="text-amber-400">{Math.round(progress)}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-400">
                    This may take a few minutes. Preserving facial features and cultural details...
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Enhanced Tab */}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enhancedImages.map((img) => (
                  <Card key={img.id} className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-4 space-y-4">
                      {/* Before/After Comparison */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-400">Original</p>
                          <div className="aspect-video relative bg-gray-800 rounded-lg overflow-hidden">
                            <Image
                              src={img.originalPreview || "/placeholder.svg"}
                              alt="Original"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-amber-400">Enhanced</p>
                          <div className="aspect-video relative bg-gray-800 rounded-lg overflow-hidden">
                            <Image
                              src={img.enhanced || "/placeholder.svg"}
                              alt="Enhanced"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span>{img.original.name}</span>
                        </div>
                        {img.settings && (
                          <div className="bg-gray-800/50 rounded p-2 space-y-1">
                            <div>Creativity: {img.settings.creativity}</div>
                            <div>Resemblance: {img.settings.resemblance}</div>
                            <div>Upscale: {img.settings.upscaleFactor}x</div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => downloadImage(img.enhanced, img.original.name)}
                          className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
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
            )}
          </TabsContent>
        </Tabs>

        {/* Features Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">ASEAN Optimized</h3>
              <p className="text-sm text-gray-400">
                Creativity 0.35 + Resemblance 0.75-0.8 = Perfect Southeast Asian feature preservation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Proven Results</h3>
              <p className="text-sm text-gray-400">These exact settings created all our showcase images</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Professional Quality</h3>
              <p className="text-sm text-gray-400">2-4x upscale with museum-quality cultural preservation</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
