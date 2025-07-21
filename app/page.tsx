"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Upload,
  ImageIcon,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  Award,
  Globe,
  Smartphone,
  Camera,
  Palette,
  Wand2,
  Crown,
  Rocket,
} from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { UserMenu } from "@/components/auth/user-menu"

const AIImageEnhancementPortal = () => {
  // Authentication state
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState("login") // "login" | "signup"
  const [showAuth, setShowAuth] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Existing state
  const [selectedFiles, setSelectedFiles] = useState([])
  const [processingQueue, setProcessingQueue] = useState([])
  const [completedJobs, setCompletedJobs] = useState([])
  const [activeTab, setActiveTab] = useState("home")
  const [adminSubTab, setAdminSubTab] = useState("config")
  const [discoveryResults, setDiscoveryResults] = useState(null)
  const [configResults, setConfigResults] = useState(null)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [enhancementSettings, setEnhancementSettings] = useState({
    model: "real-esrgan-4x",
    upscaleFactor: 2,
    targetUse: "display",
    colorSpace: "RGB",
    format: "PNG",
    quality: 95,
    denoise: true,
    sharpen: false,
    faceEnhance: false,
  })
  const fileInputRef = useRef(null)

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("ai-enhancer-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem("ai-enhancer-user")
      }
    }
  }, [])

  // Authentication handlers
  const handleLogin = (userData) => {
    setIsAuthLoading(true)
    setTimeout(() => {
      setUser(userData)
      localStorage.setItem("ai-enhancer-user", JSON.stringify(userData))
      setShowAuth(false)
      setIsAuthLoading(false)
    }, 1000)
  }

  const handleSignup = (userData) => {
    setIsAuthLoading(true)
    setTimeout(() => {
      setUser(userData)
      localStorage.setItem("ai-enhancer-user", JSON.stringify(userData))
      setShowAuth(false)
      setIsAuthLoading(false)
    }, 1000)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("ai-enhancer-user")
    setActiveTab("home")
    setSelectedFiles([])
    setProcessingQueue([])
    setCompletedJobs([])
  }

  const handleUpdateProfile = (updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("ai-enhancer-user", JSON.stringify(updatedUser))
  }

  // Check if user is admin (simple check for demo)
  const isAdmin = user?.email === "admin@example.com" || user?.email === "demo@example.com"

  // Updated with discovered working models and file size limits
  const enhancementModels = [
    {
      id: "real-esrgan-4x",
      name: "Real-ESRGAN 4x",
      description: "Professional upscaling for photos and artwork",
      maxUpscale: 4,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      replicateModel: "nightmareai/real-esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      category: "General Purpose",
      recommended: true,
      status: "working",
      inputField: "image",
      processingTime: "30-60s",
      bestFor: "Photos, artwork, general images",
      icon: ImageIcon,
    },
    {
      id: "gfpgan-face",
      name: "GFPGAN",
      description: "Specialized face restoration and enhancement",
      maxUpscale: 4,
      maxFileSize: 3 * 1024 * 1024, // 3MB
      replicateModel: "tencentarc/gfpgan",
      version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
      category: "Face Enhancement",
      recommended: false,
      status: "working",
      inputField: "img",
      processingTime: "45-90s",
      bestFor: "Portrait photos, face restoration",
      icon: Camera,
    },
    {
      id: "codeformer-face",
      name: "CodeFormer",
      description: "Advanced face restoration with fidelity control",
      maxUpscale: 4,
      maxFileSize: 3 * 1024 * 1024, // 3MB
      replicateModel: "sczhou/codeformer",
      version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
      category: "Portrait Enhancement",
      recommended: false,
      status: "working",
      inputField: "image",
      processingTime: "60-120s",
      bestFor: "Professional portraits, headshots",
      icon: Palette,
    },
    {
      id: "clarity-upscaler",
      name: "Clarity Upscaler",
      description: "High-quality upscaling with clarity enhancement",
      maxUpscale: 4,
      maxFileSize: 4 * 1024 * 1024, // 4MB
      replicateModel: "philz1337x/clarity-upscaler",
      version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
      category: "Professional",
      recommended: false,
      status: "working",
      inputField: "image",
      processingTime: "45-75s",
      bestFor: "Professional photography, print",
      icon: Wand2,
    },
  ]

  // Image compression helper
  const compressImage = async (file, targetSize = 2 * 1024 * 1024) => {
    if (file.size <= targetSize) {
      return file // No compression needed
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("targetSize", targetSize.toString())
      formData.append("quality", "80")

      const response = await fetch("/api/compress-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Convert data URL back to File object
        const response = await fetch(result.dataUrl)
        const blob = await response.blob()
        const compressedFile = new File([blob], file.name, { type: "image/jpeg" })
        
        console.log("✅ Image compressed:", {
          original: formatFileSize(file.size),
          compressed: formatFileSize(compressedFile.size),
          reduction: result.reduction + "%",
        })
        
        return compressedFile
      } else {
        console.warn("⚠️ Compression failed, using original file")
        return file
      }
    } catch (error) {
      console.warn("⚠️ Compression error, using original file:", error)
      return file
    }
  }

  const handleFileSelect = useCallback(
    async (files) => {
      if (!user) {
        setShowAuth(true)
        return
      }

      const newFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          // Check file size and compress if needed
          const selectedModel = enhancementModels.find((m) => m.id === enhancementSettings.model)
          const maxSize = selectedModel?.maxFileSize || 5 * 1024 * 1024
          
          let processedFile = file
          let compressionApplied = false
          
          if (file.size > maxSize) {
            console.log(`🗜️ File ${file.name} is ${formatFileSize(file.size)}, compressing to fit ${selectedModel?.name} limit of ${formatFileSize(maxSize)}`)
            processedFile = await compressImage(file, maxSize * 0.8) // Compress to 80% of limit for safety
            compressionApplied = true
          }

          return {
            id: Date.now() + Math.random(),
            file: processedFile,
            originalFile: file,
            name: file.name,
            size: processedFile.size,
            originalSize: file.size,
            preview: URL.createObjectURL(processedFile),
            status: "ready",
            error: null,
            compressionApplied,
            compressionSavings: compressionApplied ? Math.round((1 - processedFile.size / file.size) * 100) : 0,
          }
        })
      )
      
      setSelectedFiles((prev) => [...prev, ...newFiles])
    },
    [user, enhancementSettings.model],
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const startProcessing = async (fileId) => {
    if (!user) {
      setShowAuth(true)
      return
    }

    console.log("🚀 Starting processing for file ID:", fileId)

    const fileToProcess = selectedFiles.find((f) => f.id === fileId)
    if (!fileToProcess) {
      console.error("❌ File not found:", fileId)
      return
    }

    console.log("📁 Processing file:", fileToProcess.name)

    // Move file from selected to processing queue
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId))
    const job = {
      id: fileToProcess.id,
      file: fileToProcess,
      settings: { ...enhancementSettings },
      status: "processing",
      startTime: Date.now(),
      progress: "Preparing image...",
    }
    setProcessingQueue((prev) => [...prev, job])

    try {
      // Validate file before sending
      if (!fileToProcess.file) {
        throw new Error("No file object found")
      }

      if (!fileToProcess.file.type.startsWith("image/")) {
        throw new Error(`Invalid file type: ${fileToProcess.file.type}`)
      }

      const selectedModel = enhancementModels.find((m) => m.id === enhancementSettings.model)
      const maxSize = selectedModel?.maxFileSize || 5 * 1024 * 1024

      if (fileToProcess.file.size > maxSize) {
        throw new Error(`File too large: ${formatFileSize(fileToProcess.file.size)} (max: ${formatFileSize(maxSize)} for ${selectedModel?.name})`)
      }

      console.log("✅ File validation passed")

      // Create form data
      const formData = new FormData()
      formData.append("file", fileToProcess.file)
      formData.append("settings", JSON.stringify(enhancementSettings))

      console.log("📤 Form data created with keys:", Array.from(formData.keys()))
      console.log("📤 Settings being sent:", enhancementSettings)

      const modelName = selectedModel?.replicateModel || "nightmareai/real-esrgan"

      // Update progress
      setProcessingQueue((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, progress: `Uploading to ${modelName}...` } : j)),
      )

      console.log("🌐 Sending request to /api/enhance-replicate...")

      // Send request with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000) // 10 minute timeout

      const response = await fetch("/api/enhance-replicate", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("📥 Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      })

      // Handle response
      let result
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        try {
          result = await response.json()
          console.log("📊 JSON response parsed:", result)
        } catch (parseError) {
          console.error("❌ Failed to parse JSON response:", parseError)
          const text = await response.text()
          console.error("❌ Raw response text:", text)
          throw new Error(`Failed to parse response: ${parseError.message}`)
        }
      } else {
        const text = await response.text()
        console.error("❌ Non-JSON response:", text)
        result = {
          success: false,
          error: text || `HTTP ${response.status} ${response.statusText}`,
          step: "response_parsing",
        }
      }

      // Remove from processing queue
      setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id))

      if (result.success) {
        console.log("✅ Enhancement successful:", result)

        setCompletedJobs((prev) => [
          ...prev,
          {
            id: job.id,
            status: "completed",
            completedAt: Date.now(),
            originalSize: `${fileToProcess.file.name} (${formatFileSize(fileToProcess.file.size)})`,
            enhancedSize: result.enhancedSize || "Enhanced",
            fileSize: result.fileSize || "Unknown size",
            downloadUrl: result.downloadUrl,
            originalFileName: fileToProcess.name,
            model: result.model || enhancementSettings.model,
            method: result.method || "replicate",
            upscaleFactor: enhancementSettings.upscaleFactor,
            processingTime: result.processingTime || "Unknown",
            predictionId: result.predictionId,
            compressionApplied: fileToProcess.compressionApplied,
            compressionSavings: fileToProcess.compressionSavings,
          },
        ])
      } else {
        console.error("❌ Enhancement failed:", result)

        // Return file to selected files with error
        setSelectedFiles((prev) => [
          ...prev,
          {
            ...fileToProcess,
            status: "failed",
            error: result.error || "Unknown error",
            details: result.details || null,
            step: result.step || "unknown",
            suggestions: result.suggestions || [],
          },
        ])
      }
    } catch (error) {
      console.error("❌ Processing error:", error)

      // Remove from processing queue
      setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id))

      // Return file to selected files with error
      setSelectedFiles((prev) => [
        ...prev,
        {
          ...fileToProcess,
          status: "failed",
          error: error.message || "Network error",
          details: error.name || null,
          step: "client_error",
        },
      ])
    }
  }

  const testReplicateConfig = async () => {
    if (!user) {
      setShowAuth(true)
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch("/api/test-replicate-config")
      const result = await response.json()
      setConfigResults(result)
      console.log("🧪 Replicate Config Test Results:", result)
    } catch (error) {
      console.error("Config test failed:", error)
      setConfigResults({ error: error.message })
    } finally {
      setIsTesting(false)
    }
  }

  const runReplicateDiscovery = async () => {
    if (!user) {
      setShowAuth(true)
      return
    }

    setIsDiscovering(true)
    try {
      const response = await fetch("/api/replicate-discovery")
      const result = await response.json()
      setDiscoveryResults(result)
      console.log("🔍 Replicate Discovery Results:", result)
    } catch (error) {
      console.error("Discovery failed:", error)
      setDiscoveryResults({ error: error.message })
    } finally {
      setIsDiscovering(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getTargetResolution = () => {
    const baseResolutions = {
      dome: "8192x8192",
      print: "16384x12288",
      display: "3840x2160",
    }
    return baseResolutions[enhancementSettings.targetUse] || "4K"
  }

  const getMaxUpscale = () => {
    const selectedModel = enhancementModels.find((m) => m.id === enhancementSettings.model)
    return selectedModel?.maxUpscale || 4
  }

  const getMaxFileSize = () => {
    const selectedModel = enhancementModels.find((m) => m.id === enhancementSettings.model)
    return selectedModel?.maxFileSize || 5 * 1024 * 1024
  }

  // Show authentication modal if not logged in
  if (!user && showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        {authMode === "login" ? (
          <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setAuthMode("signup")} isLoading={isAuthLoading} />
        ) : (
          <SignupForm onSignup={handleSignup} onSwitchToLogin={() => setAuthMode("login")} isLoading={isAuthLoading} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Professional Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Enhancer Pro</h1>
                <p className="text-sm text-blue-200">Professional Image Enhancement Platform</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab("home")}
                className={`text-sm font-medium transition-colors ${
                  activeTab === "home" ? "text-white" : "text-blue-200 hover:text-white"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    setShowAuth(true)
                    return
                  }
                  setActiveTab("enhance")
                }}
                className={`text-sm font-medium transition-colors ${
                  activeTab === "enhance" ? "text-white" : "text-blue-200 hover:text-white"
                }`}
              >
                Enhance
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    setShowAuth(true)
                    return
                  }
                  setActiveTab("results")
                }}
                className={`text-sm font-medium transition-colors ${
                  activeTab === "results" ? "text-white" : "text-blue-200 hover:text-white"
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`text-sm font-medium transition-colors ${
                  activeTab === "pricing" ? "text-white" : "text-blue-200 hover:text-white"
                }`}
              >
                Pricing
              </button>
            </nav>

            {/* User Area */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-400">
                  {enhancementModels.filter((m) => m.status === "working").length} AI Models Ready
                </span>
              </div>

              {user ? (
                <UserMenu
                  user={user}
                  onLogout={handleLogout}
                  onOpenProfile={() => setShowProfile(true)}
                  isAdmin={isAdmin}
                />
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAuth(true)}
                    className="text-blue-200 hover:text-white transition-colors text-sm font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode("signup")
                      setShowAuth(true)
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-lg"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6">
        {activeTab === "home" && (
          <div className="space-y-20 py-12">
            {/* Hero Section */}
            <section className="text-center py-20">
              <div className="max-w-4xl mx-auto">
                <div className="inline-flex items-center space-x-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-blue-200">Trusted by 10,000+ professionals</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Professional AI
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {" "}
                    Image Enhancement
                  </span>
                </h1>

                <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Transform your images with cutting-edge AI models. Upscale, enhance clarity, and restore photos with
                  professional quality results in seconds.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
                  <button
                    onClick={() => {
                      if (!user) {
                        setShowAuth(true)
                        return
                      }
                      setActiveTab("enhance")
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Rocket className="w-5 h-5" />
                    <span>Start Enhancing Free</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("pricing")}
                    className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center space-x-2"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>View Pricing</span>
                  </button>
                </div>

                {/* Before/After Preview with Real Images */}
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8 max-w-4xl mx-auto">
                  <h3 className="text-2xl font-semibold text-white mb-6">See the Difference</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                        <h4 className="text-red-400 font-medium mb-4">Before Enhancement</h4>
                        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
                          <img
                            src="/before-example.png"
                            alt="Low resolution image before AI enhancement"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-sm text-gray-400">Original: 480x320 • Blurry & Low Detail</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                        <h4 className="text-green-400 font-medium mb-4">After AI Enhancement</h4>
                        <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg overflow-hidden">
                          <img
                            src="/after-example.png"
                            alt="High resolution image after AI enhancement"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-sm text-blue-400">Enhanced: 1920x1280 • Sharp & Detailed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center space-x-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-200">4x upscaling with Real-ESRGAN AI model</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Models Section */}
            <section className="py-20">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-6">Powered by Advanced AI Models</h2>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  Choose from multiple specialized AI models, each optimized for different types of image enhancement
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {enhancementModels.map((model) => (
                  <div
                    key={model.id}
                    className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <model.icon className="w-6 h-6 text-white" />
                      </div>
                      {model.recommended && (
                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1">
                          <span className="text-yellow-400 text-xs font-medium">Recommended</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">{model.name}</h3>
                    <p className="text-blue-200 text-sm mb-4">{model.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Category:</span>
                        <span className="text-blue-400">{model.category}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Max Upscale:</span>
                        <span className="text-green-400">{model.maxUpscale}x</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Max File Size:</span>
                        <span className="text-orange-400">{formatFileSize(model.maxFileSize)}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Processing:</span>
                        <span className="text-purple-400">{model.processingTime}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Best For:</span>
                        <span className="text-yellow-400 text-xs">{model.bestFor}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-green-400 text-sm font-medium">Ready to Use</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-6">Why Choose AI Enhancer Pro?</h2>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  Professional-grade features designed for photographers, designers, and content creators
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Zap,
                    title: "Lightning Fast",
                    description: "Process images in 30-120 seconds with our optimized AI pipeline",
                    color: "from-yellow-500 to-orange-500",
                  },
                  {
                    icon: Award,
                    title: "Professional Quality",
                    description: "Industry-leading AI models used by top photographers and agencies",
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    icon: Globe,
                    title: "Multiple Formats",
                    description: "Support for JPEG, PNG, TIFF, WebP with flexible output options",
                    color: "from-green-500 to-blue-500",
                  },
                  {
                    icon: Smartphone,
                    title: "Mobile Optimized",
                    description: "Perfect experience on desktop, tablet, and mobile devices",
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    icon: Shield,
                    title: "Secure & Private",
                    description: "Your images are processed securely and never stored permanently",
                    color: "from-red-500 to-pink-500",
                  },
                  {
                    icon: Crown,
                    title: "Smart Compression",
                    description: "Automatic image optimization to fit model requirements",
                    color: "from-indigo-500 to-purple-500",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8 hover:border-blue-500/30 transition-all group"
                  >
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                    <p className="text-blue-200 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-lg rounded-3xl border border-blue-500/20 p-12 text-center">
                <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Images?</h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals who trust AI Enhancer Pro for their image enhancement needs
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <button
                    onClick={() => {
                      if (!user) {
                        setShowAuth(true)
                        return
                      }
                      setActiveTab("enhance")
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Start Free Trial</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("pricing")}
                    className="border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center space-x-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>View Plans</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">Choose Your Plan</h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Professional image enhancement for every need and budget
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8 relative">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    $0<span className="text-lg text-gray-400">/month</span>
                  </div>
                  <p className="text-blue-200">Perfect for trying out our service</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "5 images per month",
                    "Up to 2MP resolution",
                    "Basic AI models",
                    "Standard processing speed",
                    "JPEG & PNG output",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (!user) {
                      setShowAuth(true)
                      return
                    }
                    setActiveTab("enhance")
                  }}
                  className="w-full border border-white/20 text-white py-3 rounded-lg hover:bg-white/10 transition-all font-medium"
                >
                  Get Started Free
                </button>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-b from-blue-900/20 to-purple-900/20 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-8 relative transform scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    $19<span className="text-lg text-gray-400">/month</span>
                  </div>
                  <p className="text-blue-200">For professional photographers</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "200 images per month",
                    "Up to 8MP resolution",
                    "All AI models",
                    "Priority processing",
                    "All output formats",
                    "Batch processing",
                    "API access",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg transition-all font-medium">
                  Start Pro Trial
                </button>
              </div>

              {/* Business Plan */}
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8 relative">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Business</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    $49<span className="text-lg text-gray-400">/month</span>
                  </div>
                  <p className="text-blue-200">For teams and agencies</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "1000 images per month",
                    "Up to 16MP resolution",
                    "All AI models",
                    "Fastest processing",
                    "All output formats",
                    "Bulk processing",
                    "Full API access",
                    "Team management",
                    "Priority support",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full border border-white/20 text-white py-3 rounded-lg hover:bg-white/10 transition-all font-medium">
                  Contact Sales
                </button>
              </div>
            </div>

            {/* Annual Discount */}
            <div className="text-center mt-12">
              <div className="inline-flex items-center space-x-2 bg-green-600/10 border border-green-500/20 rounded-full px-6 py-3">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Save 20% with annual billing</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "enhance" && (
          <div className="py-12">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Enhanced Upload Area */}
              <div className="lg:col-span-2">
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white">Upload Images</h2>
                    <div className="text-sm text-blue-200">
                      {user ? `${selectedFiles.length} files selected` : "Sign in required"}
                    </div>
                  </div>

                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-blue-400/50 rounded-2xl p-16 text-center hover:border-blue-400 transition-all cursor-pointer group"
                    onClick={() => {
                      if (!user) {
                        setShowAuth(true)
                        return
                      }
                      fileInputRef.current?.click()
                    }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="w-10\
