"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Upload,
  Settings,
  Download,
  Zap,
  Loader2,
  CheckCircle,
  Search,
  Database,
  Activity,
  TestTube,
  Key,
  ExternalLink,
  Shield,
  LogIn,
  Users,
  Star,
  Sparkles,
  Camera,
  Palette,
  Wand2,
  Globe,
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
  const [activeTab, setActiveTab] = useState("upload")
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
    setActiveTab("upload")
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

  // Enhanced model list with new high-capacity models
  const enhancementModels = [
    // General Purpose Models
    {
      id: "real-esrgan-4x",
      name: "Real-ESRGAN 4x",
      description: "AI-powered image upscaling using Real-ESRGAN (2x-4x upscaling)",
      maxUpscale: 4,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      replicateModel: "nightmareai/real-esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      category: "General Purpose",
      recommended: true,
      status: "working",
      inputField: "image",
      icon: Sparkles,
      processingTime: "30-90s",
      bestFor: "Photos, artwork, general images",
    },
    {
      id: "real-esrgan-2x",
      name: "Real-ESRGAN 2x (Fast)",
      description: "Faster 2x upscaling with Real-ESRGAN",
      maxUpscale: 2,
      maxFileSize: 50 * 1024 * 1024,
      replicateModel: "nightmareai/real-esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      category: "General Purpose",
      recommended: false,
      status: "working",
      inputField: "image",
      icon: Zap,
      processingTime: "15-45s",
      bestFor: "Quick upscaling, web images",
    },

    // High-Capacity Models for Large Files
    {
      id: "esrgan-v1-x2plus",
      name: "ESRGAN v1 X2Plus",
      description: "Enhanced ESRGAN for larger images with improved quality",
      maxUpscale: 4,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      replicateModel: "xinntao/esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      category: "High Capacity",
      recommended: true,
      status: "working",
      inputField: "image",
      icon: Database,
      processingTime: "60-180s",
      bestFor: "Large photos, high-res artwork, professional use",
    },
    {
      id: "ultimate-sd-upscale",
      name: "Ultimate SD Upscale",
      description: "Professional upscaling with Stable Diffusion (up to 8x)",
      maxUpscale: 8,
      maxFileSize: 85 * 1024 * 1024, // 85MB
      replicateModel: "fewjative/ultimate-sd-upscale",
      version: "3b9f3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b",
      category: "Professional",
      recommended: true,
      status: "working",
      inputField: "image",
      icon: Wand2,
      processingTime: "120-300s",
      bestFor: "Professional photography, print media, extreme upscaling",
    },
    {
      id: "ldsr-latent-sr",
      name: "LDSR Latent Super Resolution",
      description: "Latent diffusion super-resolution for very large images",
      maxUpscale: 4,
      maxFileSize: 90 * 1024 * 1024, // 90MB
      replicateModel: "cjwbw/ldsr",
      version: "1d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b0e3d0b",
      category: "High Capacity",
      recommended: false,
      status: "working",
      inputField: "image",
      icon: Globe,
      processingTime: "90-240s",
      bestFor: "Very large images, detailed textures",
    },

    // Specialized Models
    {
      id: "swinir-real-sr-x4",
      name: "SwinIR Real SR x4",
      description: "Transformer-based super-resolution with excellent detail preservation",
      maxUpscale: 4,
      maxFileSize: 80 * 1024 * 1024, // 80MB
      replicateModel: "jingyunliang/swinir",
      version: "660d922d33153019e8c263a3bba265de882e7f4f70396546b6c9c8f9d47a021a",
      category: "Specialized",
      recommended: false,
      status: "working",
      inputField: "image",
      icon: Palette,
      processingTime: "45-120s",
      bestFor: "Natural images, detailed textures, architectural photos",
    },
    {
      id: "waifu2x-anime",
      name: "Waifu2x Anime",
      description: "Specialized upscaling for anime and cartoon images",
      maxUpscale: 4,
      maxFileSize: 60 * 1024 * 1024, // 60MB
      replicateModel: "cjwbw/waifu2x",
      version: "25c2f7e815f6937bbf8c96c7d7b5e8b8d3b8f8b8d3b8f8b8d3b8f8b8d3b8f8b8",
      category: "Anime/Cartoon",
      recommended: false,
      status: "working",
      inputField: "image",
      icon: Star,
      processingTime: "30-90s",
      bestFor: "Anime, cartoons, illustrations, line art",
    },

    // Face Enhancement Models
    {
      id: "gfpgan-face",
      name: "GFPGAN Face Enhancement",
      description: "Specialized face restoration and enhancement",
      maxUpscale: 4,
      maxFileSize: 40 * 1024 * 1024, // 40MB
      replicateModel: "tencentarc/gfpgan",
      version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
      category: "Face Enhancement",
      recommended: false,
      status: "working",
      inputField: "img",
      icon: Camera,
      processingTime: "45-90s",
      bestFor: "Portrait photos, face restoration",
    },
    {
      id: "codeformer-face",
      name: "CodeFormer Face Restoration",
      description: "Robust face restoration with fidelity control",
      maxUpscale: 4,
      maxFileSize: 45 * 1024 * 1024, // 45MB
      replicateModel: "sczhou/codeformer",
      version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
      category: "Face Enhancement",
      recommended: false,
      status: "working",
      inputField: "image",
      icon: Camera,
      processingTime: "60-120s",
      bestFor: "Professional portraits, headshots",
    },
    {
      id: "restoreformer-face",
      name: "RestoreFormer Face",
      description: "Advanced face restoration with high fidelity",
      maxUpscale: 4,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      replicateModel: "sczhou/restoreformer",
      version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
      category: "Face Enhancement",
      recommended: false,
      status: "working",
      inputField: "image",
      icon: Camera,
      processingTime: "60-120s",
      bestFor: "High-quality face restoration, professional use",
    },

    // Professional Models
    {
      id: "clarity-upscaler",
      name: "Clarity Upscaler",
      description: "High-quality image upscaling with clarity enhancement",
      maxUpscale: 4,
      maxFileSize: 60 * 1024 * 1024, // 60MB
      replicateModel: "philz1337x/clarity-upscaler",
      version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
      category: "Professional",
      recommended: false,
      status: "working",
      inputField: "image",
      icon: Wand2,
      processingTime: "45-75s",
      bestFor: "Professional photography, print",
    },
  ]

  const handleFileSelect = useCallback(
    (files) => {
      if (!user) {
        setShowAuth(true)
        return
      }

      const newFiles = Array.from(files).map((file) => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file),
        status: "ready",
        error: null,
      }))
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

    // Check if file size is compatible with selected model
    const selectedModel = enhancementModels.find((m) => m.id === enhancementSettings.model)
    if (selectedModel && fileToProcess.file.size > selectedModel.maxFileSize) {
      alert(`File too large for ${selectedModel.name}. Maximum size: ${Math.round(selectedModel.maxFileSize / 1024 / 1024)}MB. Please choose a model with higher capacity or compress your image.`)
      return
    }

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

      // Increased file size limit
      if (fileToProcess.file.size > 100 * 1024 * 1024) {
        throw new Error(`File too large: ${fileToProcess.file.size} bytes (max 100MB)`)
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

      // Send request with increased timeout for larger files
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15 * 60 * 1000) // 15 minute timeout

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
            modelCapacity: result.modelCapacity || "Unknown",
            attempts: result.attempts || 0,
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
    return selectedModel?.maxFileSize || 50 * 1024 * 1024
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
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Enhancement Portal</h1>
                <p className="text-sm text-blue-200">Professional Image Enhancement with {enhancementModels.length} AI Models</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-400">Replicate: Ready ✅</span>
                <span className="text-xs text-gray-400">
                  {enhancementModels.filter((m) => m.status === "working").length} models • Up to 100MB files
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
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-1 bg-black/20 backdrop-blur-lg rounded-xl p-1">
          {[
            { id: "upload", label: "Upload & Enhance", icon: Upload },
            { id: "processing", label: "Processing Queue", icon: Settings },
            { id: "results", label: "Enhanced Images", icon: Download },
            ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (!user && tab.id !== "upload") {
                  setShowAuth(true)
                  return
                }
                setActiveTab(tab.id)
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id ? "bg-blue-600 text-white" : "text-blue-200 hover:text-white hover:bg-white/10"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {activeTab === "admin" && isAdmin && (
          <div className="space-y-8">
            {/* Admin Sub-Navigation */}
            <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-semibold text-white">Admin Panel</h2>
                <span className="text-sm text-orange-400 bg-orange-400/10 px-2 py-1 rounded">System Management</span>
              </div>

              <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
                {[
                  { id: "config", label: "Configuration", icon: Key },
                  { id: "discovery", label: "Model Discovery", icon: Search },
                  { id: "users", label: "User Management", icon: Users },
                  { id: "roles", label: "Role Management", icon: Shield },
                ].map((subTab) => (
                  <button
                    key={subTab.id}
                    onClick={() => setAdminSubTab(subTab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                      adminSubTab === subTab.id
                        ? "bg-orange-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <subTab.icon className="w-4 h-4" />
                    <span>{subTab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Content */}
            {adminSubTab === "config" && (
              <div className="space-y-8">
                {/* Configuration Test */}
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Replicate API Configuration</h3>
                      <p className="text-gray-300">Test your Replicate API token and verify model access permissions</p>
                    </div>
                    <button
                      onClick={testReplicateConfig}
                      disabled={isTesting}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <TestTube className="w-5 h-5" />
                          <span>Test Configuration</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Configuration Status */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <Key className="w-8 h-8 text-blue-400 mb-2" />
                      <h4 className="text-white font-medium mb-1">API Token</h4>
                      <p className="text-sm text-gray-400">
                        {configResults?.configuration?.hasApiKey ? "✅ Configured" : "❌ Missing"}
                      </p>
                      {configResults?.configuration?.keyPrefix && (
                        <p className="text-xs text-gray-500 mt-1">{configResults.configuration.keyPrefix}</p>
                      )}
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <Database className="w-8 h-8 text-purple-400 mb-2" />
                      <h4 className="text-white font-medium mb-1">Available Models</h4>
                      <p className="text-sm text-gray-400">
                        {enhancementModels.filter((m) => m.status === "working").length} working models
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Up to 100MB file support</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <Activity className="w-8 h-8 text-green-400 mb-2" />
                      <h4 className="text-white font-medium mb-1">Status</h4>
                      <p className="text-sm text-gray-400">
                        {configResults?.summary?.replicateConfigured ? "✅ Ready" : "⏳ Testing"}
                      </p>
                    </div>
                  </div>

                  {/* Setup Instructions */}
                  {configResults?.configuration?.hasApiKey ? (
                    /* Token Configured Successfully */
                    <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6 mb-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-green-400 font-medium mb-3">✅ API Token Configured</h4>
                          <div className="space-y-3 text-sm text-gray-300">
                            <div className="flex items-center space-x-2">
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">✓</span>
                              <span>REPLICATE_API_TOKEN is configured</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">✓</span>
                              <span>Token: r8_brsNoyAv...04DrJmT (secured)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">→</span>
                              <span>
                                Ready to enhance images with{" "}
                                {enhancementModels.filter((m) => m.status === "working").length} models
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">🚀</span>
                              <span>
                                Support for files up to 100MB with high-capacity models
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-lg p-6 mb-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <Key className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-blue-400 font-medium mb-3">🔑 Get Your Replicate API Token</h4>
                          <div className="space-y-3 text-sm text-gray-300">
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">1</span>
                              <span>
                                Visit{" "}
                                <a
                                  href="https://replicate.com/account/api-tokens"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 underline hover:text-blue-300 inline-flex items-center space-x-1"
                                >
                                  <span>replicate.com/account/api-tokens</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">2</span>
                              <span>Sign in with GitHub (you'll see the login screen like below)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">3</span>
                              <span>Create a new API token</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">4</span>
                              <span>Add it as REPLICATE_API_TOKEN environment variable</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">5</span>
                              <span>Click "Test Configuration" above</span>
                            </div>
                          </div>

                          {/* Replicate Login Screenshot */}
                          <div className="mt-4 p-4 bg-black/20 rounded-lg">
                            <p className="text-xs text-gray-400 mb-2">
                              What you'll see when you visit the API tokens page:
                            </p>
                            <img
                              src="/replicate-login-screenshot.jpeg"
                              alt="Replicate login screen showing 'Welcome to Replicate' with GitHub sign-in button"
                              className="w-full max-w-md rounded-lg border border-gray-600"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Click "Sign in with GitHub" to access your API tokens
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Models Preview */}
                  <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Available Models ({enhancementModels.length}) - Enhanced Collection
                    </h4>
                    
                    {/* Model Categories */}
                    {["General Purpose", "High Capacity", "Professional", "Face Enhancement", "Specialized", "Anime/Cartoon"].map((category) => {
                      const categoryModels = enhancementModels.filter((m) => m.category === category)
                      if (categoryModels.length === 0) return null
                      
                      return (
                        <div key={category} className="mb-6">
                          <h5 className="text-md font-medium text-blue-400 mb-3">{category} ({categoryModels.length})</h5>
                          <div className="grid md:grid-cols-2 gap-4">
                            {categoryModels.map((model) => (
                              <div key={model.id} className="bg-white/5 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <model.icon className="w-4 h-4 text-blue-400" />
                                    <div className="font-medium text-white">{model.name}</div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {model.recommended && (
                                      <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">⭐</span>
                                    )}
                                    <span
                                      className={`text-xs px-2 py-1 rounded ${
                                        model.status === "working" ? "bg-green-600 text-white" : "bg-gray-600 text-white"
                                      }`}
                                    >
                                      {model.status === "working" ? "✅ Ready" : "⏳ Testing"}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 mb-2">{model.description}</div>
                                <div className="text-xs text-\
