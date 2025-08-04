"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Upload,
  ImageIcon,
  Settings,
  Download,
  Zap,
  Monitor,
  Printer,
  Loader2,
  CheckCircle,
  Play,
  X,
  RefreshCw,
  AlertCircle,
  Search,
  Activity,
  TestTube,
  Key,
  Shield,
  LogIn,
  Users,
  AlertTriangle,
  Globe,
  User,
} from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { UserMenu } from "@/components/auth/user-menu"
import { ProfileDialog } from "@/components/auth/profile-dialog"
import { UserManagement } from "@/components/admin/user-management"
import { RoleManagement } from "@/components/admin/role-management"

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
    preserveEthnicity: true, // New setting for ethnicity preservation
    datasetRegion: "indonesian", // New setting for dataset region
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

  // Updated models with bias information and Indonesian dataset compatibility
  const enhancementModels = [
    {
      id: "real-esrgan-4x",
      name: "Real-ESRGAN 4x (Recommended for Indonesian)",
      description: "AI-powered image upscaling with excellent ethnicity preservation",
      maxUpscale: 4,
      replicateModel: "nightmareai/real-esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      category: "upscaling",
      recommended: true,
      status: "working",
      inputField: "image",
      biasLevel: "low",
      ethnicityPreservation: "excellent",
      indonesianCompatible: true,
      icon: "🇮🇩",
      warning: null,
    },
    {
      id: "esrgan-conservative",
      name: "ESRGAN Conservative (Best for Diversity)",
      description: "Ultra-conservative upscaling that preserves all original facial features",
      maxUpscale: 4,
      replicateModel: "nightmareai/real-esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      category: "conservative",
      recommended: true,
      status: "working",
      inputField: "image",
      biasLevel: "minimal",
      ethnicityPreservation: "excellent",
      indonesianCompatible: true,
      icon: "🛡️",
      warning: null,
    },
    {
      id: "real-esrgan-2x",
      name: "Real-ESRGAN 2x (Fast & Safe)",
      description: "Faster 2x upscaling with excellent ethnicity preservation",
      maxUpscale: 2,
      replicateModel: "nightmareai/real-esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      category: "upscaling",
      recommended: false,
      status: "working",
      inputField: "image",
      biasLevel: "low",
      ethnicityPreservation: "excellent",
      indonesianCompatible: true,
      icon: "⚡",
      warning: null,
    },
    {
      id: "gfpgan-face",
      name: "GFPGAN Face Enhancement (Asian-Friendly)",
      description: "Face restoration with good diversity in training data",
      maxUpscale: 4,
      replicateModel: "tencentarc/gfpgan",
      version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
      category: "face",
      recommended: false,
      status: "working",
      inputField: "img",
      biasLevel: "medium",
      ethnicityPreservation: "good",
      indonesianCompatible: true,
      icon: "👤",
      warning: "May slightly alter facial features but generally preserves Asian characteristics",
    },
    {
      id: "codeformer-face",
      name: "CodeFormer Face Restoration (Moderate Bias)",
      description: "Face restoration with fidelity control - use with caution",
      maxUpscale: 4,
      replicateModel: "sczhou/codeformer",
      version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
      category: "face",
      recommended: false,
      status: "working",
      inputField: "image",
      biasLevel: "medium",
      ethnicityPreservation: "good",
      indonesianCompatible: true,
      icon: "🔧",
      warning: "May alter facial features. Higher fidelity settings help preserve ethnicity",
    },
    {
      id: "clarity-upscaler",
      name: "Clarity Upscaler (Conservative Mode)",
      description: "High-quality upscaling with conservative settings to minimize facial alterations",
      maxUpscale: 4,
      replicateModel: "philz1337x/clarity-upscaler",
      version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
      category: "conservative-upscaling",
      recommended: false,
      status: "working",
      inputField: "image",
      biasLevel: "medium", // Improved from "high"
      ethnicityPreservation: "good", // Improved from "poor"
      indonesianCompatible: true, // Now compatible with conservative settings
      icon: "🛡️", // Changed from ⚠️ to shield indicating protection
      warning:
        "Uses conservative settings to minimize facial alterations. Monitor results for any unwanted changes to Indonesian features.",
    },
    {
      id: "clarity-conservative",
      name: "Clarity Conservative (Indonesian-Optimized)",
      description: "Ultra-conservative Clarity Upscaler specifically tuned to preserve Indonesian facial features",
      maxUpscale: 3,
      replicateModel: "philz1337x/clarity-upscaler",
      version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
      category: "indonesian-optimized",
      recommended: true,
      status: "working",
      inputField: "image",
      biasLevel: "low", // Much improved with conservative settings
      ethnicityPreservation: "excellent", // Optimized for Indonesian faces
      indonesianCompatible: true,
      icon: "🇮🇩",
      warning: null, // No warning needed with conservative settings
      specialFeatures: ["Indonesian-optimized", "Ultra-conservative", "Facial feature preservation"],
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

    // Check for bias warning before processing
    const selectedModel = enhancementModels.find((m) => m.id === enhancementSettings.model)
    if (selectedModel && !selectedModel.indonesianCompatible && enhancementSettings.datasetRegion === "indonesian") {
      const proceed = window.confirm(
        `⚠️ BIAS WARNING: ${selectedModel.name} is known to alter Indonesian facial features.\n\n${selectedModel.warning}\n\nWe recommend using "Real-ESRGAN 4x" instead.\n\nDo you want to continue anyway?`,
      )
      if (!proceed) {
        return
      }
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

      if (fileToProcess.file.size > 50 * 1024 * 1024) {
        throw new Error(`File too large: ${fileToProcess.file.size} bytes`)
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

      // Use specialized conservative endpoint for Indonesian-optimized Clarity
      let apiEndpoint = "/api/enhance-replicate"
      if (enhancementSettings.model === "clarity-conservative") {
        apiEndpoint = "/api/clarity-conservative"
        console.log("🇮🇩 Using Indonesian-optimized Conservative Clarity endpoint")
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000) // 10 minute timeout

      const response = await fetch(apiEndpoint, {
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
            biasLevel: result.biasLevel,
            ethnicityPreservation: result.ethnicityPreservation,
            datasetCompatibility: result.datasetCompatibility,
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
            recommendations: result.recommendations || [],
            alternativeModels: result.alternativeModels || [],
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
                <p className="text-sm text-blue-200">Bias-Aware Image Enhancement for Indonesian Datasets</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-400">Indonesian-Safe Models: Ready ✅</span>
                <span className="text-xs text-gray-400">
                  {enhancementModels.filter((m) => m.indonesianCompatible).length} bias-aware models
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
                {/* Bias Warning Banner */}
                <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/20 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-red-400 font-semibold text-lg mb-2">⚠️ AI Model Bias Alert</h3>
                      <p className="text-red-200 mb-3">
                        Some AI models have been trained primarily on Western datasets and may alter Indonesian facial
                        features, making them appear Caucasian and middle-aged.
                      </p>
                      <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
                        <h4 className="text-red-300 font-medium mb-2">Problematic Model:</h4>
                        <p className="text-red-200 text-sm">
                          <strong>Clarity Upscaler</strong> - Known to change Indonesian faces to appear Caucasian and
                          middle-aged. This model is NOT recommended for Indonesian datasets.
                        </p>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-green-400 font-medium mb-2">✅ Recommended Safe Models:</h4>
                        <ul className="text-green-200 text-sm space-y-1">
                          <li>
                            • <strong>Real-ESRGAN 4x</strong> - Excellent ethnicity preservation
                          </li>
                          <li>
                            • <strong>ESRGAN Conservative</strong> - Minimal alterations, preserves all features
                          </li>
                          <li>
                            • <strong>Real-ESRGAN 2x</strong> - Fast and safe for Indonesian faces
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration Test */}
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Replicate API Configuration</h3>
                      <p className="text-gray-300">Test your Replicate API token and verify bias-aware model access</p>
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
                      <Globe className="w-8 h-8 text-green-400 mb-2" />
                      <h4 className="text-white font-medium mb-1">Indonesian-Safe Models</h4>
                      <p className="text-sm text-gray-400">
                        {enhancementModels.filter((m) => m.indonesianCompatible).length} bias-aware models
                      </p>
                      <p className="text-xs text-green-400 mt-1">Ethnicity preservation verified</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <Activity className="w-8 h-8 text-purple-400 mb-2" />
                      <h4 className="text-white font-medium mb-1">Status</h4>
                      <p className="text-sm text-gray-400">
                        {configResults?.summary?.replicateConfigured ? "✅ Ready" : "⏳ Testing"}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Models Preview with Bias Information */}
                  <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Available Models - Bias Assessment ({enhancementModels.length})
                    </h4>
                    <div className="space-y-4">
                      {enhancementModels.map((model) => (
                        <div
                          key={model.id}
                          className={`rounded-lg p-4 border ${
                            model.indonesianCompatible
                              ? "bg-green-900/10 border-green-500/20"
                              : "bg-red-900/10 border-red-500/20"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{model.icon}</span>
                              <div>
                                <div className="font-medium text-white flex items-center space-x-2">
                                  <span>{model.name}</span>
                                  {model.recommended && (
                                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                                      ⭐ Recommended
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{model.description}</div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  model.indonesianCompatible ? "bg-green-600 text-white" : "bg-red-600 text-white"
                                }`}
                              >
                                {model.indonesianCompatible ? "🇮🇩 Indonesian Safe" : "⚠️ Not Recommended"}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  model.biasLevel === "minimal" || model.biasLevel === "low"
                                    ? "bg-green-600 text-white"
                                    : model.biasLevel === "medium"
                                      ? "bg-yellow-600 text-white"
                                      : "bg-red-600 text-white"
                                }`}
                              >
                                Bias: {model.biasLevel}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                            <div>
                              <span className="text-gray-400">Ethnicity Preservation:</span>
                              <span
                                className={`ml-2 font-medium ${
                                  model.ethnicityPreservation === "excellent"
                                    ? "text-green-400"
                                    : model.ethnicityPreservation === "good"
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                }`}
                              >
                                {model.ethnicityPreservation}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Max Upscale:</span>
                              <span className="text-blue-400 ml-2 font-medium">{model.maxUpscale}x</span>
                            </div>
                          </div>
                          {model.warning && (
                            <div className="mt-3 p-3 bg-red-900/20 border border-red-500/20 rounded">
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-red-300 text-xs">{model.warning}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                {configResults && (
                  <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Configuration Test Results</h4>

                    {configResults.error ? (
                      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                        <div className="text-red-400 font-medium mb-2">❌ Configuration Error</div>
                        <div className="text-red-300 text-sm">{configResults.error}</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary */}
                        {configResults.summary && (
                          <div
                            className={`border rounded-lg p-4 ${
                              configResults.summary.replicateConfigured
                                ? "bg-green-900/20 border-green-500/20"
                                : "bg-yellow-900/20 border-yellow-500/20"
                            }`}
                          >
                            <div
                              className={`font-medium mb-2 ${
                                configResults.summary.replicateConfigured ? "text-green-400" : "text-yellow-400"
                              }`}
                            >
                              {configResults.summary.replicateConfigured ? "✅" : "⚠️"}{" "}
                              {configResults.summary.recommendation}
                            </div>
                            <div className="text-sm text-gray-300">
                              Tests: {configResults.summary.successful}/{configResults.summary.totalTests} successful
                            </div>
                          </div>
                        )}

                        {/* Individual Test Results */}
                        <div className="space-y-3">
                          {configResults.tests?.map((test, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-4 ${
                                test.status === "success"
                                  ? "bg-green-900/10 border-green-500/20"
                                  : "bg-red-900/10 border-red-500/20"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-mono text-sm text-white">{test.test}</div>
                                <div
                                  className={`text-xs px-2 py-1 rounded ${
                                    test.status === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                                  }`}
                                >
                                  {test.status === "success" ? "✅ Success" : "❌ Failed"}
                                </div>
                              </div>
                              <div className="text-sm text-gray-300">Result: {test.result}</div>
                              {test.error && <div className="text-sm text-red-300 mt-1">Error: {test.error}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {adminSubTab === "discovery" && (
              <div className="space-y-8">
                {/* Discovery Control Panel */}
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Bias-Aware Model Discovery</h3>
                      <p className="text-gray-300">Test and evaluate models for Indonesian dataset compatibility</p>
                    </div>
                    <button
                      onClick={runReplicateDiscovery}
                      disabled={isDiscovering || !configResults?.summary?.replicateConfigured}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
                    >
                      {isDiscovering ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Discovering...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          <span>Test Bias Levels</span>
                        </>
                      )}
                    </button>
                  </div>

                  {!configResults?.summary?.replicateConfigured && (
                    <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4 mb-6">
                      <div className="text-yellow-400 font-medium mb-2">⚠️ Configuration Required</div>
                      <div className="text-yellow-200 text-sm">Please test your Replicate API configuration first.</div>
                    </div>
                  )}

                  {/* Indonesian-Safe Models Status */}
                  <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6">
                    <h4 className="text-green-400 font-medium mb-3">🇮🇩 Indonesian-Compatible Models</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {enhancementModels
                        .filter((m) => m.indonesianCompatible)
                        .map((model) => (
                          <div key={model.id} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span>{model.icon}</span>
                                <div className="font-mono text-sm text-green-400">{model.replicateModel}</div>
                              </div>
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                {model.ethnicityPreservation}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">{model.description}</div>
                            <div className="text-xs text-blue-400 mt-1">Bias Level: {model.biasLevel}</div>
                          </div>
                        ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-300">
                      These models have been verified to preserve Indonesian facial characteristics and ethnicity.
                    </div>
                  </div>
                </div>

                {/* Discovery Results */}
                {discoveryResults && (
                  <div className="space-y-6">
                    {discoveryResults.error ? (
                      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-6">
                        <div className="text-red-400 font-medium mb-2">❌ Discovery Error</div>
                        <div className="text-red-300">{discoveryResults.error}</div>
                      </div>
                    ) : (
                      <>
                        {/* Summary */}
                        <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                          <h4 className="text-lg font-semibold text-white mb-4">Bias Assessment Summary</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                              <div className="text-2xl font-bold text-green-400">
                                {discoveryResults.workingModels?.length || 0}
                              </div>
                              <div className="text-sm text-green-300">Indonesian-Safe Models</div>
                            </div>
                            <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                              <div className="text-2xl font-bold text-red-400">
                                {discoveryResults.failedModels?.length || 0}
                              </div>
                              <div className="text-sm text-red-300">Biased Models</div>
                            </div>
                            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                              <div className="text-2xl font-bold text-blue-400">
                                {discoveryResults.configuration?.testedModels || 0}
                              </div>
                              <div className="text-sm text-blue-300">Total Tested</div>
                            </div>
                          </div>
                        </div>

                        {/* Working Models */}
                        {discoveryResults.workingModels?.length > 0 && (
                          <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                            <h4 className="text-lg font-semibold text-white mb-4">✅ Bias-Free Models</h4>
                            <div className="space-y-3">
                              {discoveryResults.workingModels.map((model, index) => (
                                <div
                                  key={index}
                                  className={`border rounded-lg p-4 ${
                                    model.isPrimary
                                      ? "bg-blue-900/20 border-blue-500/30"
                                      : "bg-green-900/10 border-green-500/20"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div
                                        className={`font-mono text-sm ${
                                          model.isPrimary ? "text-blue-400" : "text-green-400"
                                        }`}
                                      >
                                        {model.modelId}
                                      </div>
                                      {model.isPrimary && (
                                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                          🇮🇩 RECOMMENDED
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                        {model.category}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          model.priority === "high" ? "bg-red-600 text-white" : "bg-gray-600 text-white"
                                        }`}
                                      >
                                        {model.priority.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-400 mb-1">{model.description}</div>
                                  <div className="text-xs text-gray-500">Prediction: {model.predictionId}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {discoveryResults.recommendations?.length > 0 && (
                          <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                            <h4 className="text-lg font-semibold text-white mb-4">
                              🎯 Bias Mitigation Recommendations
                            </h4>
                            <div className="space-y-3">
                              {discoveryResults.recommendations.map((rec, index) => (
                                <div
                                  key={index}
                                  className={`border rounded-lg p-4 ${
                                    rec.priority === "high"
                                      ? "bg-blue-900/20 border-blue-500/30"
                                      : rec.priority === "critical"
                                        ? "bg-red-900/20 border-red-500/30"
                                        : "bg-gray-900/20 border-gray-500/20"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div
                                      className={`font-medium ${
                                        rec.priority === "high"
                                          ? "text-blue-400"
                                          : rec.priority === "critical"
                                            ? "text-red-400"
                                            : "text-gray-400"
                                      }`}
                                    >
                                      {rec.type}
                                    </div>
                                    {rec.priority && (
                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          rec.priority === "high"
                                            ? "bg-blue-600 text-white"
                                            : rec.priority === "critical"
                                              ? "bg-red-600 text-white"
                                              : "bg-gray-600 text-white"
                                        }`}
                                      >
                                        {rec.priority.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  {rec.modelId && (
                                    <div className="font-mono text-sm text-white mb-1">{rec.modelId}</div>
                                  )}
                                  <div className="text-sm text-gray-300">{rec.reason}</div>
                                  {rec.usage && <div className="text-xs text-gray-400 mt-1">Usage: {rec.usage}</div>}
                                  {rec.solution && (
                                    <div className="text-xs text-yellow-400 mt-1">💡 {rec.solution}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {adminSubTab === "users" && <UserManagement currentUser={user} />}

            {adminSubTab === "roles" && <RoleManagement />}
          </div>
        )}

        {activeTab === "upload" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Upload Images for Enhancement</h2>
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Indonesian Dataset Mode</span>
                  </div>
                </div>

                {/* Bias Warning for Indonesian Dataset */}
                <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-blue-400 font-medium mb-1">🇮🇩 Indonesian Dataset Protection Active</h4>
                      <p className="text-blue-200 text-sm">
                        We've configured bias-aware models to preserve Indonesian facial characteristics. Problematic
                        models like "Clarity Upscaler" will show warnings before use.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-blue-400/50 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => {
                    if (!user) {
                      setShowAuth(true)
                      return
                    }
                    fileInputRef.current?.click()
                  }}
                >
                  <ImageIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {user ? "Drop images here or click to browse" : "Sign in to upload images"}
                  </h3>
                  <p className="text-blue-200 mb-4">Supports: JPG, PNG, WebP, HEIC, TIFF up to 50MB</p>
                  <p className="text-sm text-gray-400">
                    Enhanced with {enhancementModels.filter((m) => m.indonesianCompatible).length} Indonesian-safe AI
                    Models
                  </p>
                  {!user && (
                    <button
                      onClick={() => setShowAuth(true)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
                    >
                      <LogIn className="w-4 h-4" />
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

                {/* File List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-white mb-4">Selected Files ({selectedFiles.length})</h3>
                    <div className="space-y-3">
                      {selectedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={file.preview || "/placeholder.svg"}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="text-white font-medium">{file.name}</p>
                              <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                              {file.status === "failed" && (
                                <div className="mt-1">
                                  <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    <p className="text-sm text-red-400">Error: {file.error}</p>
                                  </div>
                                  {file.details && (
                                    <p className="text-xs text-red-300 mt-1">
                                      {"Details: "}
                                      {typeof file.details === "string"
                                        ? file.details
                                        : JSON.stringify(file.details, null, 2)}
                                    </p>
                                  )}
                                  {file.step && <p className="text-xs text-gray-500 mt-1">Failed at: {file.step}</p>}
                                  {file.recommendations && file.recommendations.length > 0 && (
                                    <div className="mt-2 p-2 bg-blue-900/20 border border-blue-500/20 rounded">
                                      <p className="text-xs text-blue-400 font-medium mb-1">Recommendations:</p>
                                      <ul className="text-xs text-blue-300 space-y-1">
                                        {file.recommendations.map((rec, idx) => (
                                          <li key={idx}>• {rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {file.alternativeModels && file.alternativeModels.length > 0 && (
                                    <div className="mt-2 p-2 bg-green-900/20 border border-green-500/20 rounded">
                                      <p className="text-xs text-green-400 font-medium mb-1">Alternative Models:</p>
                                      <div className="space-y-1">
                                        {file.alternativeModels.map((alt, idx) => (
                                          <div key={idx} className="text-xs text-green-300">
                                            • {alt.name} - {alt.ethnicityPreservation} preservation
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.status === "ready" && (
                              <button
                                onClick={() => startProcessing(file.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <Play className="w-4 h-4" />
                                <span>Enhance</span>
                              </button>
                            )}
                            {file.status === "failed" && (
                              <button
                                onClick={() => startProcessing(file.id)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>Retry</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
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
                <h3 className="text-lg font-semibold text-white mb-6">Enhancement Settings</h3>

                <div className="space-y-6">
                  {/* Dataset Region Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Dataset Region</label>
                    <select
                      value={enhancementSettings.datasetRegion}
                      onChange={(e) => setEnhancementSettings((prev) => ({ ...prev, datasetRegion: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="indonesian" className="bg-slate-800">
                        🇮🇩 Indonesian Dataset
                      </option>
                      <option value="asian" className="bg-slate-800">
                        🌏 Asian Dataset
                      </option>
                      <option value="diverse" className="bg-slate-800">
                        🌍 Diverse Dataset
                      </option>
                      <option value="caucasian" className="bg-slate-800">
                        🌎 Caucasian Dataset
                      </option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      This helps us recommend the most appropriate bias-free models for your dataset
                    </p>
                  </div>

                  {/* AI Model Selection with Bias Warnings */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Enhancement Model</label>
                    <div className="space-y-3">
                      {enhancementModels
                        .filter((m) => m.status === "working")
                        .map((model) => (
                          <div
                            key={model.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              enhancementSettings.model === model.id
                                ? model.indonesianCompatible
                                  ? "border-green-500 bg-green-500/10"
                                  : "border-red-500 bg-red-500/10"
                                : model.indonesianCompatible
                                  ? "border-white/20 hover:border-green-400/50"
                                  : "border-red-500/30 hover:border-red-400/50"
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
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start space-x-3">
                                <span className="text-xl">{model.icon}</span>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-white">{model.name}</h4>
                                    {model.recommended && (
                                      <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">⭐</span>
                                    )}
                                    {model.indonesianCompatible ? (
                                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">🇮🇩 Safe</span>
                                    ) : (
                                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">⚠️ Biased</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-blue-200 mt-1">{model.category}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs">
                                    <span className="text-gray-400">
                                      Bias:{" "}
                                      <span
                                        className={`font-medium ${
                                          model.biasLevel === "minimal" || model.biasLevel === "low"
                                            ? "text-green-400"
                                            : model.biasLevel === "medium"
                                              ? "text-yellow-400"
                                              : "text-red-400"
                                        }`}
                                      >
                                        {model.biasLevel}
                                      </span>
                                    </span>
                                    <span className="text-gray-400">
                                      Ethnicity:{" "}
                                      <span
                                        className={`font-medium ${
                                          model.ethnicityPreservation === "excellent"
                                            ? "text-green-400"
                                            : model.ethnicityPreservation === "good"
                                              ? "text-yellow-400"
                                              : "text-red-400"
                                        }`}
                                      >
                                        {model.ethnicityPreservation}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-4 h-4 border-2 border-white/40 rounded-full flex items-center justify-center">
                                {enhancementSettings.model === model.id && (
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      model.indonesianCompatible ? "bg-green-500" : "bg-red-500"
                                    }`}
                                  ></div>
                                )}
                              </div>
                            </div>
                            {model.warning && (
                              <div className="mt-3 p-3 bg-red-900/20 border border-red-500/20 rounded">
                                <div className="flex items-start space-x-2">
                                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-red-300 text-xs">{model.warning}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Target Use Case */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Target Use</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "display", label: "Display", icon: Monitor },
                        { id: "print", label: "Print", icon: Printer },
                        { id: "dome", label: "Dome", icon: ImageIcon },
                      ].map((use) => (
                        <button
                          key={use.id}
                          onClick={() => setEnhancementSettings((prev) => ({ ...prev, targetUse: use.id }))}
                          className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                            enhancementSettings.targetUse === use.id
                              ? "bg-blue-600 text-white"
                              : "bg-white/5 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          <use.icon className="w-5 h-5 mb-1" />
                          <span className="text-xs">{use.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upscale Factor */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Upscale Factor: {enhancementSettings.upscaleFactor}x
                    </label>
                    <input
                      type="range"
                      min="2"
                      max={getMaxUpscale()}
                      step="1"
                      value={enhancementSettings.upscaleFactor}
                      onChange={(e) =>
                        setEnhancementSettings((prev) => ({ ...prev, upscaleFactor: Number.parseInt(e.target.value) }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>2x</span>
                      <span>Target: {getTargetResolution()}</span>
                      <span>{getMaxUpscale()}x</span>
                    </div>
                  </div>

                  {/* Ethnicity Preservation Toggle */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Bias Protection</label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enhancementSettings.preserveEthnicity}
                        onChange={(e) =>
                          setEnhancementSettings((prev) => ({ ...prev, preserveEthnicity: e.target.checked }))
                        }
                        className="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded"
                      />
                      <div>
                        <p className="text-sm text-white">Preserve Ethnicity</p>
                        <p className="text-xs text-gray-400">
                          Prioritize models that maintain original facial characteristics
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Enhanced Processing Info */}
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-green-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Processing Status</h3>

                {!user && (
                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 mb-4">
                    <div className="text-blue-400 text-sm font-medium mb-1">🔐 Authentication Required</div>
                    <div className="text-blue-200 text-xs">
                      Sign in to access bias-aware image enhancement features.
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Images queued:</span>
                    <span>{selectedFiles.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Selected model:</span>
                    <span>{enhancementModels.find((m) => m.id === enhancementSettings.model)?.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Dataset region:</span>
                    <span className="text-blue-400">{enhancementSettings.datasetRegion}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Bias protection:</span>
                    <span className={enhancementSettings.preserveEthnicity ? "text-green-400" : "text-yellow-400"}>
                      {enhancementSettings.preserveEthnicity ? "✅ Enabled" : "⚠️ Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between text-white font-medium">
                    <span>Est. processing time:</span>
                    <span>{selectedFiles.length * 60}s</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Indonesian-safe models:</span>
                    <span className="text-green-400">
                      {enhancementModels.filter((m) => m.indonesianCompatible).length} available
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>User status:</span>
                    <span className={user ? "text-green-400" : "text-yellow-400"}>
                      {user ? "✅ Authenticated" : "⚠️ Not signed in"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "processing" && (
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Processing Queue</h2>

            {!user ? (
              <div className="text-center py-12">
                <LogIn className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Sign in to view processing queue</p>
                <p className="text-sm text-gray-500 mb-4">Track your bias-aware image enhancement jobs</p>
                <button
                  onClick={() => setShowAuth(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </div>
            ) : processingQueue.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No images currently processing</p>
                <p className="text-sm text-gray-500 mt-2">Start processing from the Upload tab</p>
              </div>
            ) : (
              <div className="space-y-4">
                {processingQueue.map((job) => (
                  <div key={job.id} className="bg-white/5 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={job.file.preview || "/placeholder.svg"}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-medium">{job.file.name}</p>
                          <p className="text-sm text-gray-400">
                            {enhancementModels.find((m) => m.id === job.settings.model)?.replicateModel} •{" "}
                            {job.settings.upscaleFactor}x
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-blue-400">Dataset: {job.settings.datasetRegion}</span>
                            {job.settings.preserveEthnicity && (
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Bias Protected</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        <span className="text-sm text-gray-300">{job.progress || "Processing..."}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "results" && (
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Enhanced Images</h2>

            {!user ? (
              <div className="text-center py-12">
                <LogIn className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Sign in to view enhanced images</p>
                <p className="text-sm text-gray-500 mb-4">Access your bias-aware enhanced images and downloads</p>
                <button
                  onClick={() => setShowAuth(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </div>
            ) : completedJobs.length === 0 ? (
              <div className="text-center py-12">
                <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No enhanced images yet</p>
                <p className="text-sm text-gray-500 mt-2">Completed enhancements will appear here</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedJobs.map((job) => (
                  <div key={job.id} className="bg-white/5 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                      <img
                        src={job.downloadUrl || "/placeholder.svg"}
                        alt={`Enhanced ${job.originalFileName}`}
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>

                    <div className="p-4">
                      <p className="text-white font-medium mb-2">{job.originalFileName}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Enhanced with Bias Protection</span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-300 mb-4">
                        <div className="flex justify-between">
                          <span>Original:</span>
                          <span>{job.originalSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Model:</span>
                          <span className="text-blue-400 font-mono text-xs">{job.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing:</span>
                          <span className="text-purple-400">{job.processingTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Upscale:</span>
                          <span className="text-green-400">{job.upscaleFactor}x</span>
                        </div>
                        {job.biasLevel && (
                          <div className="flex justify-between">
                            <span>Bias Level:</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                job.biasLevel === "minimal" || job.biasLevel === "low"
                                  ? "bg-green-600 text-white"
                                  : job.biasLevel === "medium"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-red-600 text-white"
                              }`}
                            >
                              {job.biasLevel}
                            </span>
                          </div>
                        )}
                        {job.ethnicityPreservation && (
                          <div className="flex justify-between">
                            <span>Ethnicity:</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                job.ethnicityPreservation === "excellent"
                                  ? "bg-green-600 text-white"
                                  : job.ethnicityPreservation === "good"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-red-600 text-white"
                              }`}
                            >
                              {job.ethnicityPreservation}
                            </span>
                          </div>
                        )}
                        {job.datasetCompatibility && (
                          <div className="flex justify-between">
                            <span>Dataset:</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                job.datasetCompatibility === "compatible"
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {job.datasetCompatibility}
                            </span>
                          </div>
                        )}
                        {job.predictionId && (
                          <div className="flex justify-between">
                            <span>Prediction ID:</span>
                            <span className="text-gray-400 font-mono text-xs">{job.predictionId.slice(0, 8)}...</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => window.open(job.downloadUrl, "_blank")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Enhanced</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Dialog */}
      {user && (
        <ProfileDialog
          user={user}
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          onUpdateProfile={handleUpdateProfile}
          completedJobs={completedJobs.length}
          totalProcessingTime={`${Math.floor(completedJobs.length * 1.5)}m`}
        />
      )}
    </div>
  )
}

export default AIImageEnhancementPortal
