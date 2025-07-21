"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Upload,
  ImageIcon,
  Download,
  Zap,
  Monitor,
  Printer,
  Loader2,
  X,
  RefreshCw,
  AlertCircle,
  Shield,
  LogIn,
  Star,
  Check,
  Sparkles,
  TrendingUp,
  Award,
  Globe,
  Camera,
  Palette,
  Wand2,
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

  // Processing state
  const [selectedFiles, setSelectedFiles] = useState([])
  const [processingQueue, setProcessingQueue] = useState([])
  const [completedJobs, setCompletedJobs] = useState([])
  const [activeTab, setActiveTab] = useState("home")
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

  // Updated with higher file size limits for AI-generated images
  const enhancementModels = [
    {
      id: "real-esrgan-4x",
      name: "Real-ESRGAN 4x",
      description: "Professional upscaling for photos and artwork",
      maxUpscale: 4,
      maxFileSize: 8 * 1024 * 1024, // Increased to 8MB
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
      maxFileSize: 6 * 1024 * 1024, // Increased to 6MB
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
      maxFileSize: 6 * 1024 * 1024, // Increased to 6MB
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
      maxFileSize: 8 * 1024 * 1024, // Increased to 8MB
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

  const handleFileSelect = useCallback(
    async (files) => {
      if (!user) {
        setShowAuth(true)
        return
      }

      const newFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          return {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            preview: URL.createObjectURL(file),
            status: "ready",
            error: null,
          }
        }),
      )

      setSelectedFiles((prev) => [...prev, ...newFiles])
    },
    [user],
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

  const compressImage = async (file, maxSizeBytes = 3 * 1024 * 1024, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions to reduce file size if needed
        let { width, height } = img
        const aspectRatio = width / height

        // Reduce dimensions if file is too large
        const targetPixels = Math.sqrt(maxSizeBytes / (file.size / (width * height)))
        if (targetPixels < 1) {
          width = Math.floor(width * targetPixels)
          height = Math.floor(height * targetPixels)
        }

        // Set canvas size
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              // Create new file object with compressed data
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              console.log(
                `🗜️ Compressed ${file.name}: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`,
              )
              resolve(compressedFile)
            } else {
              // Return original if compression didn't help
              resolve(file)
            }
          },
          "image/jpeg",
          quality,
        )
      }

      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

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
      const maxSize = selectedModel?.maxFileSize || 8 * 1024 * 1024

      let processFile = fileToProcess.file

      // Auto-compress if file is too large
      if (processFile.size > maxSize) {
        console.log(`📏 File size ${formatFileSize(processFile.size)} exceeds limit ${formatFileSize(maxSize)}`)

        // Update progress
        setProcessingQueue((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, progress: "Compressing image..." } : j)),
        )

        try {
          processFile = await compressImage(processFile, maxSize * 0.8) // Target 80% of max size
          console.log(`✅ Compression result: ${formatFileSize(processFile.size)}`)

          if (processFile.size > maxSize) {
            throw new Error(
              `File still too large after compression: ${formatFileSize(processFile.size)} (max: ${formatFileSize(maxSize)} for ${selectedModel?.name}). Try reducing image dimensions manually.`,
            )
          }
        } catch (compressionError) {
          console.error("❌ Compression failed:", compressionError)
          throw new Error(`Failed to compress image: ${compressionError.message}`)
        }
      }

      console.log("✅ File validation passed")

      // Create form data
      const formData = new FormData()
      formData.append("file", processFile)
      formData.append("settings", JSON.stringify(enhancementSettings))

      console.log("📤 Form data created with keys:", Array.from(formData.keys()))
      console.log("📤 Settings being sent:", enhancementSettings)
      console.log("📤 Final file size:", formatFileSize(processFile.size))

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
        console.log("🔗 Download URL received:", result.downloadUrl)

        // Validate the download URL
        if (!result.downloadUrl || typeof result.downloadUrl !== "string") {
          console.error("❌ Invalid download URL:", result.downloadUrl)
          throw new Error("Invalid download URL received from server")
        }

        // Test if the URL is accessible
        try {
          const testResponse = await fetch(result.downloadUrl, { method: "HEAD" })
          console.log("🔍 URL test response:", testResponse.status, testResponse.statusText)
        } catch (urlError) {
          console.warn("⚠️ URL test failed:", urlError.message)
        }

        setCompletedJobs((prev) => [
          ...prev,
          {
            id: job.id,
            status: "completed",
            completedAt: Date.now(),
            originalSize: `${fileToProcess.file.name} (${formatFileSize(fileToProcess.file.size)})`,
            processedSize: `${processFile.name} (${formatFileSize(processFile.size)})`,
            enhancedSize: result.enhancedSize || "Enhanced",
            fileSize: result.fileSize || "Unknown size",
            downloadUrl: result.downloadUrl,
            originalFileName: fileToProcess.name,
            originalPreview: fileToProcess.preview,
            model: result.model || enhancementSettings.model,
            method: result.method || "replicate",
            upscaleFactor: enhancementSettings.upscaleFactor,
            processingTime: result.processingTime || "Unknown",
            predictionId: result.predictionId,
            wasCompressed: processFile.size < fileToProcess.file.size,
          },
        ])

        // Auto-switch to gallery to show result
        setTimeout(() => {
          setActiveTab("results")
        }, 1000)
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
              </div>
            </section>
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
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {user ? "Drop images here or click to browse" : "Sign in to upload images"}
                    </h3>
                    <p className="text-blue-200 mb-4 text-lg">Supports JPEG, PNG, WebP, HEIC, TIFF up to 50MB</p>
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Fast Processing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Secure Upload</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4" />
                        <span>Pro Quality</span>
                      </div>
                    </div>
                    {!user && (
                      <button
                        onClick={() => setShowAuth(true)}
                        className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all inline-flex items-center space-x-2 font-medium"
                      >
                        <LogIn className="w-5 h-5" />
                        <span>Sign In to Continue</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />

                  {/* Enhanced File List with Process Buttons */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-white mb-6">Selected Files ({selectedFiles.length})</h3>
                      <div className="space-y-4">
                        {selectedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <img
                                    src={file.preview || "/placeholder.svg"}
                                    alt=""
                                    className="w-16 h-16 object-cover rounded-xl"
                                  />
                                  {file.status === "ready" && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-white font-semibold text-lg">{file.name}</p>
                                  <p className="text-blue-200">{formatFileSize(file.size)}</p>
                                  {file.status === "failed" && (
                                    <div className="mt-2">
                                      <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-4 h-4 text-red-400" />
                                        <p className="text-sm text-red-400">Error: {file.error}</p>
                                      </div>
                                      {file.details && (
                                        <p className="text-xs text-red-300 mt-1">
                                          Details:{" "}
                                          {typeof file.details === "string"
                                            ? file.details
                                            : JSON.stringify(file.details, null, 2)}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                {file.status === "ready" && (
                                  <button
                                    onClick={() => startProcessing(file.id)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2 font-medium"
                                  >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Enhance</span>
                                  </button>
                                )}
                                {file.status === "failed" && (
                                  <button
                                    onClick={() => startProcessing(file.id)}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2 font-medium"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Retry</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                                  className="text-gray-400 hover:text-red-400 transition-colors p-2"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Processing Queue */}
                  {processingQueue.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-white mb-6">
                        Processing Queue ({processingQueue.length})
                      </h3>
                      <div className="space-y-4">
                        {processingQueue.map((job) => (
                          <div key={job.id} className="bg-blue-900/20 rounded-xl border border-blue-500/30 p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <img
                                  src={job.file.preview || "/placeholder.svg"}
                                  alt=""
                                  className="w-16 h-16 object-cover rounded-xl"
                                />
                                <div>
                                  <p className="text-white font-semibold text-lg">{job.file.name}</p>
                                  <p className="text-blue-200">
                                    {enhancementModels.find((m) => m.id === job.settings.model)?.name} •{" "}
                                    {job.settings.upscaleFactor}x upscale
                                  </p>
                                  <p className="text-sm text-gray-400 mt-1">
                                    Model: {enhancementModels.find((m) => m.id === job.settings.model)?.replicateModel}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-white">Processing...</div>
                                    <div className="text-xs text-blue-400">{job.progress || "Enhancing image..."}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Settings Panel */}
              <div className="space-y-6">
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Enhancement Settings</h3>

                  <div className="space-y-6">
                    {/* AI Model Selection */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-4">AI Model</label>
                      <div className="space-y-3">
                        {enhancementModels
                          .filter((m) => m.status === "working")
                          .map((model) => (
                            <div
                              key={model.id}
                              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                                enhancementSettings.model === model.id
                                  ? "border-blue-500 bg-blue-500/10"
                                  : "border-white/20 hover:border-white/40"
                              }`}
                              onClick={() => {
                                const maxUpscale = model.maxUpscale || 4
                                setEnhancementSettings((prev) => ({
                                  ...prev,
                                  model: model.id,
                                  upscaleFactor: Math.min(prev.upscaleFactor, maxUpscale),
                                }))
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <model.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-white">{model.name}</h4>
                                    {model.recommended && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                                  </div>
                                  <p className="text-sm text-blue-200">{model.category}</p>
                                  <p className="text-xs text-gray-400 mt-1">{model.processingTime}</p>
                                </div>
                                <div className="w-4 h-4 border-2 border-white/40 rounded-full flex items-center justify-center">
                                  {enhancementSettings.model === model.id && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Target Use Case */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-4">Target Use</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "display", label: "Display", icon: Monitor, desc: "4K screens" },
                          { id: "print", label: "Print", icon: Printer, desc: "High-res print" },
                          { id: "dome", label: "Dome", icon: Globe, desc: "8K projection" },
                        ].map((use) => (
                          <button
                            key={use.id}
                            onClick={() => setEnhancementSettings((prev) => ({ ...prev, targetUse: use.id }))}
                            className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                              enhancementSettings.targetUse === use.id
                                ? "bg-blue-600 text-white"
                                : "bg-white/5 text-gray-300 hover:bg-white/10"
                            }`}
                          >
                            <use.icon className="w-6 h-6 mb-2" />
                            <span className="text-sm font-medium">{use.label}</span>
                            <span className="text-xs opacity-75">{use.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Upscale Factor */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-4">
                        Upscale Factor: {enhancementSettings.upscaleFactor}x
                      </label>
                      <input
                        type="range"
                        min="2"
                        max={getMaxUpscale()}
                        step="1"
                        value={enhancementSettings.upscaleFactor}
                        onChange={(e) =>
                          setEnhancementSettings((prev) => ({
                            ...prev,
                            upscaleFactor: Number.parseInt(e.target.value),
                          }))
                        }
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>2x</span>
                        <span className="text-blue-400">Target: {getTargetResolution()}</span>
                        <span>{getMaxUpscale()}x</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Status */}
                <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-green-500/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Processing Status</h3>

                  {!user && (
                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 mb-4">
                      <div className="text-blue-400 text-sm font-medium mb-1">🔐 Authentication Required</div>
                      <div className="text-blue-200 text-xs">
                        Sign in to access image enhancement features and track your processing history.
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Images queued:</span>
                      <span className="font-medium">{selectedFiles.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Processing:</span>
                      <span className="font-medium text-blue-400">{processingQueue.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Completed:</span>
                      <span className="font-medium text-green-400">{completedJobs.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Selected model:</span>
                      <span className="text-blue-400 font-medium">
                        {enhancementModels.find((m) => m.id === enhancementSettings.model)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-white font-medium">
                      <span>Est. processing time:</span>
                      <span className="text-green-400">{selectedFiles.length * 60}s</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Available models:</span>
                      <span className="text-green-400 font-medium">
                        {enhancementModels.filter((m) => m.status === "working").length} ready
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>User status:</span>
                      <span className={user ? "text-green-400 font-medium" : "text-yellow-400 font-medium"}>
                        {user ? "✅ Authenticated" : "⚠️ Not signed in"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div className="py-12">
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-white">Enhanced Images Gallery</h2>
                {completedJobs.length > 0 && (
                  <div className="text-sm text-blue-200">{completedJobs.length} images enhanced</div>
                )}
              </div>

              {!user ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Download className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Sign in to view enhanced images</h3>
                  <p className="text-blue-200 mb-6">Access your completed image enhancements and downloads</p>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all inline-flex items-center space-x-2 font-medium"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </button>
                </div>
              ) : completedJobs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No enhanced images yet</h3>
                  <p className="text-blue-200 mb-6">Completed enhancements will appear here</p>
                  <button
                    onClick={() => setActiveTab("enhance")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all inline-flex items-center space-x-2 font-medium"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Enhance Images</span>
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {completedJobs.map((job) => {
                    const [imageLoaded, setImageLoaded] = useState(false)
                    const [imageError, setImageError] = useState(false)

                    return (
                      <div key={job.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center relative">
                          {job.downloadUrl && !imageError ? (
                            <>
                              <img
                                src={job.downloadUrl || "/placeholder.svg"}
                                alt={`Enhanced ${job.originalFileName}`}
                                className={`w-full h-full object-contain transition-opacity duration-300 ${
                                  imageLoaded ? "opacity-100" : "opacity-0"
                                }`}
                                onLoad={() => {
                                  console.log("✅ Successfully loaded enhanced image:", job.downloadUrl)
                                  setImageLoaded(true)
                                }}
                                onError={(e) => {
                                  console.error("❌ Failed to load enhanced image:", job.downloadUrl)
                                  console.error("❌ Job details:", job)
                                  setImageError(true)
                                }}
                                crossOrigin="anonymous"
                              />
                              {!imageLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              <div className="text-center">
                                {imageError ? (
                                  <>
                                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
                                    <p className="text-sm text-red-400">Failed to load image</p>
                                    <p className="text-xs text-gray-400 mt-1">URL: {job.downloadUrl}</p>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-400">No image URL</p>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            {job.downloadUrl && !imageError ? (
                              <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">Ready</div>
                            ) : (
                              <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">Error</div>
                            )}
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-white font-semibold">{job.originalFileName}</p>
                            <p className="text-xs text-gray-400">Model: {job.model}</p>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 text-green-400">
                              <Check className="w-4 h-4" />
                              <span>Enhanced • {job.upscaleFactor}x</span>
                            </div>
                            <span className="text-blue-400">{job.processingTime}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                if (job.downloadUrl) {
                                  const link = document.createElement("a")
                                  link.href = job.downloadUrl
                                  link.download = `enhanced_${job.originalFileName}`
                                  link.target = "_blank"
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                } else {
                                  console.error("No download URL available for job:", job)
                                }
                              }}
                              disabled={!job.downloadUrl}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                            <button
                              onClick={() => {
                                console.log("🔍 Full job details:", job)
                                console.log("🔗 Download URL:", job.downloadUrl)
                                console.log("📊 Job status:", job.status)
                                console.log("🤖 Model used:", job.model)
                                console.log("🖼️ Image loaded:", imageLoaded)
                                console.log("❌ Image error:", imageError)
                                alert(
                                  `Job Details:\nID: ${job.id}\nModel: ${job.model}\nURL: ${job.downloadUrl || "❌ No URL"}\nStatus: ${job.status}\nProcessing Time: ${job.processingTime}\nImage Loaded: ${imageLoaded}\nImage Error: ${imageError}`,
                                )
                              }}
                              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                              title="Debug Info"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
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
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-8 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="text-white font-semibold text-lg mb-2">AI Enhancer Pro</h3>
              <p className="text-blue-200 text-sm">© {new Date().getFullYear()} All rights reserved.</p>
            </div>
            <div className="flex items-center justify-center space-x-6">
              <a href="#" className="text-blue-200 hover:text-white text-sm">
                Privacy
              </a>
              <a href="#" className="text-blue-200 hover:text-white text-sm">
                Terms
              </a>
              <a href="#" className="text-blue-200 hover:text-white text-sm">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AIImageEnhancementPortal
