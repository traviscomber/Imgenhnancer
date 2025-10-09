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
  Wand2,
} from "lucide-react"
import Image from "next/image"
import { compressImageForUpload } from "@/utils/image-processing"
import { ALL_PRESETS, getPresetsByCategory, type PresetCategory } from "@/lib/presets"
import {
  trackImageUpload,
  trackPresetSelection,
  trackCategorySwitch,
  trackEnhancementStart,
  trackEnhancementComplete,
  trackEnhancementFailure,
  trackImageDownload,
  trackAdvancedSettings,
} from "@/lib/analytics"

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

export default function EnhancePage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTab, setCurrentTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>("faces")
  const [selectedPresetId, setSelectedPresetId] = useState<string>("indonesian-wedding")
  const [settings, setSettings] = useState<EnhancementSettings>(ALL_PRESETS["indonesian-wedding"].settings)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles])
    setError(null)
    const totalSize = acceptedFiles.reduce((sum, file) => sum + file.size, 0)
    trackImageUpload(acceptedFiles.length, totalSize)
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

  const applyPreset = (presetId: string) => {
    const preset = ALL_PRESETS[presetId]
    if (preset) {
      setSelectedPresetId(presetId)
      setSelectedCategory(preset.category)
      setSettings(preset.settings)
      setShowAdvanced(false)
      trackPresetSelection(presetId, preset.category)
    }
  }

  const switchCategory = (category: PresetCategory) => {
    trackCategorySwitch(selectedCategory, category)
    setSelectedCategory(category)
    const presetsInCategory = getPresetsByCategory(category)
    if (presetsInCategory.length > 0) {
      applyPreset(presetsInCategory[0].id)
    }
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
    const startTime = Date.now()

    trackEnhancementStart({
      model: settings.model,
      upscaleFactor: settings.upscaleFactor,
      creativity: settings.creativity,
      resemblance: settings.resemblance,
      category: selectedCategory,
      presetId: selectedPresetId,
    })

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

        const contentType = response.headers.get("content-type")
        let data: any

        if (contentType?.includes("application/json")) {
          data = await response.json()
        } else {
          // Handle plain text error responses
          const text = await response.text()
          console.error("❌ Non-JSON response:", text)
          throw new Error(text || `Server error: ${response.status}`)
        }

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
        trackEnhancementFailure(error.message, {
          model: settings.model,
          category: selectedCategory,
          presetId: selectedPresetId,
        })
      }

      // Update progress
      setProgress(((i + 1) / totalFiles) * 100)
    }

    const endTime = Date.now()
    const processingTime = ((endTime - startTime) / 1000).toFixed(2)
    trackEnhancementComplete(processingTime, totalFiles, {
      model: settings.model,
      upscaleFactor: settings.upscaleFactor,
      category: selectedCategory,
    })

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

      trackImageDownload(filename, {
        model: settings.model,
        category: selectedCategory,
        presetId: selectedPresetId,
      })
    } catch (error) {
      console.error("Download failed:", error)
      setError("Failed to download image")
    }
  }

  const generatePrompt = () => {
    setIsGeneratingPrompt(true)

    // Get current preset info
    const currentPreset = ALL_PRESETS[selectedPresetId]
    const creativity = settings.creativity

    // Generate contextual prompts based on category and creativity
    let prompts: string[] = []

    if (selectedCategory === "faces") {
      // Preset-specific prompts for more targeted suggestions
      if (selectedPresetId === "indonesian-wedding") {
        prompts = [
          "traditional Indonesian wedding portrait with vibrant kebaya details and authentic cultural jewelry",
          "elegant Javanese wedding photo with rich batik patterns and ceremonial attire",
          "beautiful Indonesian bride and groom with enhanced traditional costume textures and gold accents",
          "cultural wedding portrait with preserved ethnic features and vibrant traditional fabrics",
          "authentic Indonesian wedding scene with enhanced ceremonial details and natural expressions",
          "traditional Sundanese wedding photo with intricate cultural elements and warm lighting",
          "elegant Indonesian wedding portrait with enhanced traditional makeup and authentic accessories",
        ]
      } else if (selectedPresetId === "modern-portrait") {
        prompts = [
          "contemporary professional portrait with natural skin tones and soft studio lighting",
          "modern headshot with crisp details and authentic facial features",
          "clean professional photo with enhanced clarity and natural color grading",
          "stylish portrait with preserved character and improved sharpness",
          "professional modern portrait with refined details and true-to-life appearance",
          "contemporary photo with enhanced textures and natural depth",
          "polished professional portrait with authentic expressions and balanced lighting",
        ]
      } else if (selectedPresetId === "vintage-restoration") {
        prompts = [
          "restored vintage portrait with preserved historical character and improved clarity",
          "classic family photo with enhanced details while maintaining authentic period feel",
          "antique portrait restoration with natural aging preserved and clarity improved",
          "historical photograph with enhanced definition and authentic vintage tones",
          "restored old photo with preserved original character and reduced damage",
          "vintage portrait with improved sharpness while keeping authentic period atmosphere",
          "classic photograph restoration with enhanced faces and preserved historical authenticity",
        ]
      } else if (selectedPresetId === "group-photo") {
        prompts = [
          "group portrait with all faces clearly defined and natural expressions preserved",
          "family photo with enhanced clarity for each person and balanced lighting",
          "team photograph with improved sharpness and authentic group dynamics",
          "group shot with enhanced details for all subjects and natural interactions",
          "multi-person portrait with clear facial features and preserved authentic moments",
          "family gathering photo with improved definition and natural group composition",
          "group portrait with enhanced clarity for distant faces and preserved candid expressions",
        ]
      } else if (selectedPresetId === "professional-headshot") {
        prompts = [
          "corporate headshot with professional polish and natural confidence",
          "business portrait with enhanced professionalism and authentic presence",
          "executive photo with refined details and commanding yet approachable appearance",
          "professional headshot with crisp clarity and natural business demeanor",
          "corporate portrait with enhanced sharpness and authentic professional character",
          "business headshot with polished appearance and genuine expression",
          "professional photo with enhanced details and natural executive presence",
        ]
      } else if (selectedPresetId === "quality-boost") {
        prompts = [
          "enhanced image quality with preserved original features and improved clarity",
          "sharpened portrait with natural details and authentic appearance maintained",
          "quality improvement with no facial alterations, only enhanced definition",
          "refined photo with improved sharpness while preserving all original characteristics",
          "enhanced clarity and resolution without modifying facial features",
          "quality boost with preserved authenticity and improved technical excellence",
          "sharpened image with natural enhancement and zero facial modifications",
        ]
      } else {
        // Generic face enhancement prompts based on creativity level
        if (creativity < 0.3) {
          prompts = [
            "professional portrait with natural skin tones and sharp details",
            "high-quality photo with preserved facial features and authentic colors",
            "clear portrait with enhanced clarity and natural lighting",
            "professional headshot with crisp details and true-to-life appearance",
            "refined portrait maintaining original character and features",
            "natural photo enhancement with improved sharpness and authentic tones",
            "professional quality portrait with preserved facial authenticity",
          ]
        } else if (creativity < 0.5) {
          prompts = [
            "elegant portrait with enhanced details and vibrant cultural attire",
            "professional photo with rich colors and traditional wedding elements",
            "beautiful portrait with enhanced textures and authentic cultural details",
            "refined image with improved clarity and preserved ethnic features",
            "high-quality portrait with enhanced fabrics and natural expressions",
            "cultural portrait with vibrant traditional elements and authentic features",
            "elegant photo with enhanced ceremonial details and natural beauty",
          ]
        } else {
          prompts = [
            "artistic portrait with enhanced dramatic lighting and rich tones",
            "creative interpretation with improved details and atmospheric mood",
            "stylized portrait with enhanced colors and professional finish",
            "expressive photo with improved contrast and artistic enhancement",
            "refined portrait with creative color grading and enhanced depth",
            "dramatic portrait with artistic lighting and enhanced emotional impact",
            "creative photo with enhanced atmosphere and professional artistic touch",
          ]
        }
      }
    } else {
      // Creative enhancement prompts - allow more artistic freedom
      if (creativity < 0.4) {
        prompts = [
          "sharp landscape with enhanced natural details and true colors",
          "clear architectural photo with improved textures and definition",
          "high-resolution image with enhanced clarity and natural tones",
          "detailed product photo with crisp edges and accurate colors",
          "refined image with improved sharpness and natural enhancement",
        ]
      } else if (creativity < 0.7) {
        prompts = [
          "vibrant landscape with enhanced colors and dramatic sky details",
          "artistic scene with improved contrast and rich atmospheric depth",
          "creative interpretation with enhanced textures and bold colors",
          "dynamic composition with improved lighting and vivid details",
          "expressive image with enhanced mood and artistic color grading",
        ]
      } else {
        prompts = [
          "dramatic artistic interpretation with bold colors and creative enhancement",
          "abstract composition with vivid details and expressive color palette",
          "creative masterpiece with enhanced textures and artistic vision",
          "stylized artwork with dramatic lighting and imaginative details",
          "bold artistic rendering with enhanced contrast and creative flair",
        ]
      }
    }

    // Select a random prompt from the appropriate category
    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)]

    // Simulate brief loading for better UX
    setTimeout(() => {
      setSettings((prev) => ({ ...prev, prompt: selectedPrompt }))
      setIsGeneratingPrompt(false)
    }, 500)
  }

  const currentPresets = getPresetsByCategory(selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-8 md:mb-12">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            AI-Powered Enhancement
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">Enhance Your Images</h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Choose between face-preserving or creative enhancement modes
          </p>
        </div>

        <Card className="mb-6 bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => switchCategory("faces")}
                variant={selectedCategory === "faces" ? "default" : "outline"}
                className={
                  selectedCategory === "faces"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black"
                    : "bg-transparent border-gray-700 text-gray-300 hover:border-amber-500/50"
                }
              >
                👤 Face Enhancement
              </Button>
              <Button
                onClick={() => switchCategory("abstract")}
                variant={selectedCategory === "abstract" ? "default" : "outline"}
                className={
                  selectedCategory === "abstract"
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                    : "bg-transparent border-gray-700 text-gray-300 hover:border-purple-500/50"
                }
              >
                🎨 Creative Enhancement
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`mb-8 ${
            selectedCategory === "faces"
              ? "bg-gradient-to-br from-amber-500/5 to-rose-500/5 border-amber-500/20"
              : "bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20"
          }`}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${selectedCategory === "faces" ? "text-amber-400" : "text-purple-400"}`} />
              {selectedCategory === "faces" ? "Face Enhancement Presets" : "Creative Enhancement Presets"}
            </CardTitle>
            <p className="text-sm text-gray-400">
              {selectedCategory === "faces"
                ? "Optimized for portraits, weddings, and people photos"
                : "Optimized for landscapes, products, and artistic images"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedPresetId === preset.id
                      ? selectedCategory === "faces"
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                        : "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{preset.icon}</span>
                        <h3 className="text-lg font-bold text-white">{preset.name}</h3>
                      </div>
                      {selectedPresetId === preset.id && (
                        <CheckCircle2
                          className={`w-6 h-6 ${selectedCategory === "faces" ? "text-amber-400" : "text-purple-400"}`}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-300">{preset.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {preset.features.map((feature, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className={
                            selectedCategory === "faces"
                              ? "bg-amber-500/20 text-amber-300 text-xs"
                              : "bg-purple-500/20 text-purple-300 text-xs"
                          }
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    {selectedPresetId === preset.id && (
                      <div
                        className={`mt-3 pt-3 border-t ${selectedCategory === "faces" ? "border-amber-500/20" : "border-purple-500/20"}`}
                      >
                        <div
                          className={`text-xs space-y-1 ${selectedCategory === "faces" ? "text-amber-400" : "text-purple-400"}`}
                        >
                          <div>Creativity: {preset.settings.creativity}</div>
                          <div>Resemblance: {preset.settings.resemblance}</div>
                          <div>Upscale: {preset.settings.upscaleFactor}x</div>
                          {preset.settings.hdr > 0 && <div>HDR: {preset.settings.hdr}</div>}
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
              onClick={() => {
                setShowAdvanced(!showAdvanced)
                trackAdvancedSettings(!showAdvanced)
              }}
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
                  <p className="text-xs text-gray-500">
                    {selectedCategory === "faces" ? "0.25-0.4 for faces" : "0.5-0.85 for creative"}
                  </p>
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
                  <p className="text-xs text-gray-500">
                    {selectedCategory === "faces" ? "0.75-0.85 preserves features" : "0.4-0.7 for creativity"}
                  </p>
                </div>

                {/* HDR */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                    <span>HDR Strength</span>
                    <span className="text-amber-400">{settings.hdr.toFixed(1)}</span>
                  </label>
                  <Slider
                    value={[settings.hdr]}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, hdr: value[0] }))}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    {selectedCategory === "faces" ? "0-0.1 for portraits" : "0.3-0.5 for landscapes"}
                  </p>
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
                    <SelectItem value="philz1337x/clarity-upscaler">Clarity Upscaler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Enhancement Prompt (Optional)</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generatePrompt}
                    disabled={isGeneratingPrompt}
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 text-purple-300"
                  >
                    {isGeneratingPrompt ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3 h-3 mr-2" />
                        Generate AI Prompt
                      </>
                    )}
                  </Button>
                </div>
                <textarea
                  value={settings.prompt || ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, prompt: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none focus:border-amber-500 focus:outline-none"
                  rows={3}
                  placeholder="Click 'Generate AI Prompt' for creative suggestions, or write your own..."
                />
                <p className="text-xs text-gray-500">
                  {selectedCategory === "faces"
                    ? "AI will generate prompts that preserve facial features and cultural details"
                    : "AI will generate creative prompts based on your creativity level"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Card
          className={
            selectedCategory === "faces"
              ? "mb-8 bg-blue-500/5 border-blue-500/20"
              : "mb-8 bg-purple-500/5 border-purple-500/20"
          }
        >
          <CardContent className="p-4 flex items-start gap-3">
            <Info
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${selectedCategory === "faces" ? "text-blue-400" : "text-purple-400"}`}
            />
            <div className="text-sm">
              {selectedCategory === "faces" ? (
                <>
                  <p
                    className={`font-medium mb-1 ${selectedCategory === "faces" ? "text-blue-300" : "text-purple-300"}`}
                  >
                    Face Preservation Active
                  </p>
                  <p className={selectedCategory === "faces" ? "text-blue-400/80" : "text-purple-400/80"}>
                    These settings preserve facial features, skin tones, and cultural details without modification.
                    Perfect for portraits, weddings, and family photos.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1 text-purple-300">Creative Enhancement Mode</p>
                  <p className="text-purple-400/80">
                    Higher creativity settings allow for artistic interpretation and dramatic improvements. Perfect for
                    landscapes, products, and abstract images.
                  </p>
                </>
              )}
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
                    <p className="text-white font-medium">
                      {selectedCategory === "faces"
                        ? "Processing with face preservation..."
                        : "Processing creatively..."}
                    </p>
                    <p className="text-amber-400">{Math.round(progress)}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-400">
                    {selectedCategory === "faces"
                      ? "Preserving facial features and cultural details..."
                      : "Applying creative enhancements..."}
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
                            {img.settings.hdr > 0 && <div>HDR: {img.settings.hdr}</div>}
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

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">10 Specialized Presets</h3>
              <p className="text-sm text-gray-400">
                5 for faces, 5 for creative work - each optimized for specific use cases
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Smart Enhancement</h3>
              <p className="text-sm text-gray-400">
                Face mode preserves features, Creative mode allows artistic freedom
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Professional Quality</h3>
              <p className="text-sm text-gray-400">2-4x upscale with AI-powered detail enhancement</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
