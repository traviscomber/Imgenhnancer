"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, ImageIcon, Settings, Download, Zap, Loader2, CheckCircle, Play, X, RefreshCw, AlertCircle, Search, TestTube, Key, Shield, LogIn, Users, AlertTriangle } from 'lucide-react'
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { UserMenu } from "@/components/auth/user-menu"
import { ProfileDialog } from "@/components/auth/profile-dialog"
import { UserManagement } from "@/components/admin/user-management"
import { RoleManagement } from "@/components/admin/role-management"
import { preProcessImage, postProcessImage, type EnhancementToggles } from "@/utils/image-processing"

// Define enhancement models with complete configurations
const ENHANCEMENT_MODELS = [
  {
    id: "real-esrgan-4x",
    name: "Real-ESRGAN 4x (Recommended for ASEAN)",
    description: "AI-powered image upscaling optimized for Indonesian/ASEAN facial features. Preserves natural skin tones and facial characteristics.",
    maxUpscale: 4,
    replicateModel: "nightmareai/real-esrgan",
    version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
    category: "upscaling",
    recommended: true,
    status: "working",
    inputField: "image",
    asianFaceCompatibility: "excellent" as const,
    westernBias: false,
    processingTime: "60-90s",
    qualityRating: 5,
  },
  {
    id: "real-esrgan-2x",
    name: "Real-ESRGAN 2x (Fast, ASEAN-Safe)",
    description: "Faster 2x upscaling that preserves Indonesian facial features without Western bias",
    maxUpscale: 2,
    replicateModel: "nightmareai/real-esrgan",
    version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
    category: "upscaling",
    recommended: false,
    status: "working",
    inputField: "image",
    asianFaceCompatibility: "excellent" as const,
    westernBias: false,
    processingTime: "30-45s",
    qualityRating: 4,
  },
  {
    id: "gfpgan-face",
    name: "GFPGAN Face Enhancement (Western Bias Warning)",
    description: "⚠️ Face restoration trained on Western datasets. May alter Indonesian/ASEAN facial features to appear more Western.",
    maxUpscale: 4,
    replicateModel: "tencentarc/gfpgan",
    version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
    category: "face",
    recommended: false,
    status: "working",
    inputField: "img",
    asianFaceCompatibility: "warning" as const,
    westernBias: true,
    processingTime: "45-60s",
    qualityRating: 4,
  },
  {
    id: "codeformer-face",
    name: "CodeFormer Face Restoration (Strong Western Bias)",
    description: "⚠️ Advanced face restoration with strong Western dataset bias. Will significantly alter Indonesian facial characteristics.",
    maxUpscale: 4,
    replicateModel: "sczhou/codeformer",
    version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
    category: "face",
    recommended: false,
    status: "working",
    inputField: "image",
    asianFaceCompatibility: "poor" as const,
    westernBias: true,
    processingTime: "90-120s",
    qualityRating: 5,
  },
  {
    id: "clarity-upscaler",
    name: "Clarity Upscaler (Face Correction Warning)",
    description: "⚠️ High-quality upscaling with face correction that may not preserve Indonesian/ASEAN facial characteristics",
    maxUpscale: 4,
    replicateModel: "philz1337x/clarity-upscaler",
    version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
    category: "upscaling",
    recommended: false,
    status: "working",
    inputField: "image",
    asianFaceCompatibility: "warning" as const,
    westernBias: true,
    processingTime: "120-180s",
    qualityRating: 5,
  },
]

interface EnhancementSettings {
  model: string
  upscaleFactor: number
  targetUse: string
  format: string
  quality: number
  faceEnhance: boolean
  preserveAsianFeatures: boolean
  pre: EnhancementToggles["pre"]
  post: EnhancementToggles["post"]
}

interface ProcessingJob {
  id: number
  file: any
  settings: EnhancementSettings
  status: string
  startTime: number
  progress: string
}

interface CompletedJob {
  id: number
  status: string
  completedAt: number
  originalSize: string
  enhancedSize: string
  fileSize: string
  downloadUrl: string
  originalFileName: string
  model: string
  modelName: string
  method: string
  upscaleFactor: number
  processingTime: string
  predictionId?: string
  preserveAsianFeatures: boolean
}

const AIImageEnhancementPortal = () => {
  // Authentication state
  const [user, setUser] = useState<any>(null)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [showAuth, setShowAuth] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Existing state
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])
  const [processingQueue, setProcessingQueue] = useState<ProcessingJob[]>([])
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [adminSubTab, setAdminSubTab] = useState("config")
  const [discoveryResults, setDiscoveryResults] = useState<any>(null)
  const [configResults, setConfigResults] = useState<any>(null)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  // Enhancement Settings with safe defaults
  const [enhancementSettings, setEnhancementSettings] = useState<EnhancementSettings>({
    model: "real-esrgan-4x",
    upscaleFactor: 2,
    targetUse: "display",
    format: "PNG",
    quality: 95,
    faceEnhance: false,
    preserveAsianFeatures: true,
    pre: {
      deblock: "low",
      denoise: "low",
      whiteBalance: "auto",
    },
    post: {
      localContrast: "low",
      sharpen: "low",
      grain: "off",
    },
  })

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Helper functions with complete safety
  const getModelById = (modelId: string | undefined | null) => {
    if (!modelId) return ENHANCEMENT_MODELS[0]
    return ENHANCEMENT_MODELS.find((m) => m.id === modelId) || ENHANCEMENT_MODELS[0]
  }

  const getCurrentModel = () => {
    return getModelById(enhancementSettings?.model)
  }

  const getModelName = (modelId: string | undefined | null) => {
    if (!modelId) return ENHANCEMENT_MODELS[0].name
    const model = getModelById(modelId)
    return model.name
  }

  const safeGetModelProperty = (modelId: string | undefined | null, property: keyof typeof ENHANCEMENT_MODELS[0], fallback: any = "Unknown") => {
    if (!modelId) return fallback
    const model = getModelById(modelId)
    return model[property] || fallback
  }

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("ai-enhancer-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem("ai-enhancer-user")
      }
    }
  }, [])

  const handleLogin = (userData: any) => {
    setIsAuthLoading(true)
    setTimeout(() => {
      setUser(userData)
      localStorage.setItem("ai-enhancer-user", JSON.stringify(userData))
      setShowAuth(false)
      setIsAuthLoading(false)
    }, 800)
  }

  const handleSignup = (userData: any) => {
    setIsAuthLoading(true)
    setTimeout(() => {
      setUser(userData)
      localStorage.setItem("ai-enhancer-user", JSON.stringify(userData))
      setShowAuth(false)
      setIsAuthLoading(false)
    }, 800)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("ai-enhancer-user")
    setActiveTab("upload")
    setSelectedFiles([])
    setProcessingQueue([])
    setCompletedJobs([])
  }

  const handleUpdateProfile = (updates: any) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("ai-enhancer-user", JSON.stringify(updatedUser))
  }

  const isAdmin = user?.email === "admin@example.com" || user?.email === "demo@example.com"

  const handleFileSelect = useCallback(
    (files: FileList) => {
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
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getTargetResolution = () => {
    const baseResolutions: Record<string, string> = {
      dome: "8192x8192",
      print: "16384x12288",
      display: "3840x2160",
    }
    return baseResolutions[enhancementSettings?.targetUse] || "4K"
  }

  const getMaxUpscale = () => {
    const selectedModel = getCurrentModel()
    return selectedModel?.maxUpscale || 4
  }

  const startProcessing = async (fileId: number) => {
    if (!user) {
      setShowAuth(true)
      return
    }

    const fileToProcess = selectedFiles.find((f) => f.id === fileId)
    if (!fileToProcess) {
      console.error("File not found:", fileId)
      return
    }

    // Move into queue
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId))
    const job: ProcessingJob = {
      id: fileToProcess.id,
      file: fileToProcess,
      settings: { ...enhancementSettings },
      status: "processing",
      startTime: Date.now(),
      progress: "Preparing image...",
    }
    setProcessingQueue((prev) => [...prev, job])

    try {
      // Pre-process on client (light, safe)
      setProcessingQueue((prev) => prev.map((j) => (j.id === job.id ? { ...j, progress: "Pre-processing..." } : j)))

      const needPre =
        enhancementSettings.pre?.deblock !== "off" ||
        enhancementSettings.pre?.denoise !== "off" ||
        enhancementSettings.pre?.whiteBalance === "auto"

      let uploadBlob: Blob
      if (needPre) {
        uploadBlob = await preProcessImage(fileToProcess.file, enhancementSettings.pre)
      } else {
        uploadBlob = fileToProcess.file
      }

      const uploadFile = new File([uploadBlob], fileToProcess.file.name.replace(/\.(\w+)$/, "") + ".png", {
        type: "image/png",
      })

      // Build FormData
      const formData = new FormData()
      formData.append("file", uploadFile, uploadFile.name)
      formData.append("settings", JSON.stringify(enhancementSettings))

      const selectedModel = getCurrentModel()
      const modelName = selectedModel?.replicateModel || "unknown-model"

      setProcessingQueue((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, progress: `Uploading to ${modelName}...` } : j)),
      )

      // Call API (let browser set multipart boundary)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000)
      let response: Response
      try {
        response = await fetch("/api/enhance-replicate", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeoutId)
      }

      const contentType = response.headers.get("content-type") || ""
      const result = contentType.includes("application/json") ? await response.json() : { success: false, error: await response.text() }

      // Remove from queue
      setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id))

      if (!response.ok || !result?.success) {
        setSelectedFiles((prev) => [
          ...prev,
          {
            ...fileToProcess,
            status: "failed",
            error: result?.error || `HTTP ${response.status}`,
            details: result?.details || null,
            step: result?.step || "unknown",
          },
        ])
        return
      }

      // Optionally post-process the enhanced image
      const needPost =
        enhancementSettings.post?.localContrast !== "off" ||
        enhancementSettings.post?.sharpen !== "off" ||
        enhancementSettings.post?.grain !== "off"

      let finalUrl = result.downloadUrl as string

      if (needPost && result.downloadUrl) {
        try {
          // Proxy fetch to bypass CORS
          setProcessingQueue((prev) => [
            ...prev,
            { id: `post-${job.id}`, file: job.file, settings: job.settings, status: "processing", startTime: Date.now(), progress: "Post-processing..." },
          ])
          const proxied = await fetch(`/api/proxy-image?url=${encodeURIComponent(result.downloadUrl)}`)
          if (!proxied.ok) throw new Error(`Proxy fetch failed: ${proxied.status}`)
          const blob = await proxied.blob()
          const postBlob = await postProcessImage(blob, enhancementSettings.post)
          const url = URL.createObjectURL(postBlob)
          finalUrl = url
        } catch (e) {
          console.warn("Post-processing skipped due to error:", e)
        } finally {
          setProcessingQueue((prev) => prev.filter((j) => j.id !== `post-${job.id}`))
        }
      }

      // Ensure we have a valid model ID and name with complete safety
      const finalModelId = result.model || enhancementSettings?.model || "real-esrgan-4x"
      const finalModelName = getModelName(finalModelId)

      const completedJob: CompletedJob = {
        id: job.id,
        status: "completed",
        completedAt: Date.now(),
        originalSize: `${fileToProcess.file.name} (${formatFileSize(fileToProcess.file.size)})`,
        enhancedSize: "Enhanced",
        fileSize: result.fileSize || "Unknown size",
        downloadUrl: finalUrl,
        originalFileName: fileToProcess.name,
        model: finalModelId,
        modelName: finalModelName,
        method: result.method || "replicate",
        upscaleFactor: enhancementSettings?.upscaleFactor || 2,
        processingTime: result.processingTime || "Unknown",
        predictionId: result.predictionId,
        preserveAsianFeatures: enhancementSettings?.preserveAsianFeatures || false,
      }

      console.log("Adding completed job:", completedJob)
      setCompletedJobs((prev) => [...prev, completedJob])
    } catch (error: any) {
      console.error("Processing error:", error)
      setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id))
      setSelectedFiles((prev) => [
        ...prev,
        {
          ...fileToProcess,
          status: "failed",
          error: error?.message || "Network error",
          details: error?.name || null,
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
      const ct = response.headers.get("content-type") || ""
      if (!response.ok) {
        const txt = await response.text().catch(() => response.statusText)
        setConfigResults({ error: txt || `HTTP ${response.status}`, status: response.status })
        return
      }
      const result = ct.includes("application/json") ? await response.json() : { error: await response.text() }
      setConfigResults(result)
    } catch (error: any) {
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
      const ct = response.headers.get("content-type") || ""
      if (!response.ok) {
        const txt = await response.text().catch(() => response.statusText)
        setDiscoveryResults({ error: txt || `HTTP ${response.status}`, status: response.status })
        return
      }
      const result = ct.includes("application/json") ? await response.json() : { error: await response.text() }
      setDiscoveryResults(result)
    } catch (error: any) {
      setDiscoveryResults({ error: error.message })
    } finally {
      setIsDiscovering(false)
    }
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
                <p className="text-sm text-blue-200">Optimized for Indonesian/ASEAN Facial Features</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-400">ASEAN-Optimized ✅</span>
                <span className="text-xs text-gray-400">
                  {ENHANCEMENT_MODELS.filter((m) => m.status === "working" && m.asianFaceCompatibility === "excellent").length} ASEAN-safe models
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
                </div>
              </div>
            )}

            {adminSubTab === "discovery" && (
              <div className="space-y-8">
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Model Discovery</h3>
                      <p className="text-gray-300">Test available Replicate models for Indonesian/ASEAN image enhancement</p>
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
                          <span>Re-test Models</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
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
                <h2 className="text-xl font-semibold text-white mb-6">Upload Images for Enhancement</h2>

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
                    Enhanced with {ENHANCEMENT_MODELS.filter((m) => m.status === "working" && m.asianFaceCompatibility === "excellent").length} ASEAN-optimized AI Models
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
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
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
                              src={file.preview || "/placeholder.svg?height=96&width=96&query=file-preview"}
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

            {/* Settings Panel */}
            <div className="space-y-6">
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Enhancement Settings</h3>

                <div className="space-y-6">
                  {/* AI Model Selection with Enhanced UI */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Enhancement Model</label>
                    <select
                      value={enhancementSettings.model}
                      onChange={(e) => {
                        const newModel = e.target.value
                        const selectedModel = getModelById(newModel)
                        const maxUpscale = selectedModel?.maxUpscale || 4
                        setEnhancementSettings((prev) => ({
                          ...prev,
                          model: newModel,
                          upscaleFactor: Math.min(prev.upscaleFactor, maxUpscale),
                        }))
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      {ENHANCEMENT_MODELS
                        .filter((m) => m.status === "working")
                        .map((model) => (
                          <option key={model.id} value={model.id} className="bg-slate-800">
                            {model.name} {model.recommended && "⭐"} 
                            {model.asianFaceCompatibility === 'excellent' && " 🇮🇩"}
                            {model.westernBias && " ⚠️"}
                          </option>
                        ))}
                    </select>
                    
                    {/* Enhanced Model Information Display */}
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">
                        {getCurrentModel()?.description || "Model description not available"}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Processing Time:</span>
                          <span className="text-blue-400">{getCurrentModel()?.processingTime || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quality Rating:</span>
                          <span className="text-yellow-400">
                            {"★".repeat(getCurrentModel()?.qualityRating || 0)}
                            {"☆".repeat(5 - (getCurrentModel()?.qualityRating || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Upscale:</span>
                          <span className="text-green-400">{getCurrentModel()?.maxUpscale || 4}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Category:</span>
                          <span className="text-purple-400 capitalize">{getCurrentModel()?.category || "Unknown"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {getCurrentModel()?.westernBias && (
                      <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-yellow-200">
                            <strong>Western Bias Warning:</strong> This model may alter Indonesian/ASEAN facial features to appear more Western.
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {getCurrentModel()?.asianFaceCompatibility === "excellent" && (
                      <div className="mt-2 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-green-200">
                            <strong>ASEAN Optimized:</strong> This model preserves Indonesian/ASEAN facial characteristics and skin tones.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upscale Factor */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Upscale Factor: {enhancementSettings.upscaleFactor}x
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={getMaxUpscale()}
                      step={1}
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

                  {/* Pre-processing */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Pre-processing</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">JPEG Deblock</label>
                        <select
                          value={enhancementSettings.pre.deblock}
                          onChange={(e) => setEnhancementSettings((prev) => ({ ...prev, pre: { ...prev.pre, deblock: e.target.value as any } }))}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">Off</option>
                          <option value="low" className="bg-slate-800">Low (recommended)</option>
                          <option value="medium" className="bg-slate-800">Medium</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Reduce block/ringing before upscaling.</p>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Denoise</label>
                        <select
                          value={enhancementSettings.pre.denoise}
                          onChange={(e) => setEnhancementSettings((prev) => ({ ...prev, pre: { ...prev.pre, denoise: e.target.value as any } }))}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">Off</option>
                          <option value="low" className="bg-slate-800">Low (recommended)</option>
                          <option value="medium" className="bg-slate-800">Medium</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Light noise reduction (chroma-friendly).</p>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">White Balance</label>
                        <select
                          value={enhancementSettings.pre.whiteBalance}
                          onChange={(e) => setEnhancementSettings((prev) => ({ ...prev, pre: { ...prev.pre, whiteBalance: e.target.value as any } }))}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">Off</option>
                          <option value="auto" className="bg-slate-800">Auto (recommended)</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Subtle gray-world WB to stabilize tones.</p>
                      </div>
                    </div>
                  </div>

                  {/* Post-processing */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Post-processing</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Local Contrast</label>
                        <select
                          value={enhancementSettings.post.localContrast}
                          onChange={(e) => setEnhancementSettings((prev) => ({ ...prev, post: { ...prev.post, localContrast: e.target.value as any } }))}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">Off</option>
                          <option value="low" className="bg-slate-800">Low (recommended)</option>
                          <option value="medium" className="bg-slate-800">Medium</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Gentle pop without halos.</p>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Sharpen</label>
                        <select
                          value={enhancementSettings.post.sharpen}
                          onChange={(e) => setEnhancementSettings((prev) => ({ ...prev, post: { ...prev.post, sharpen: e.target.value as any } }))}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">Off</option>
                          <option value="low" className="bg-slate-800">Low (recommended)</option>
                          <option value="medium" className="bg-slate-800">Medium</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Edge-aware sharpen to avoid plastic look.</p>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Add Grain</label>
                        <select
                          value={enhancementSettings.post.grain}
                          onChange={(e) => setEnhancementSettings((prev) => ({ ...prev, post: { ...prev.post, grain: e.target.value as any } }))}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">Off</option>
                          <option value="very-low" className="bg-slate-800">Very Low</option>
                          <option value="low" className="bg-slate-800">Low</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Subtle texture to reduce "AI plasticity".</p>
                      </div>
                    </div>
                  </div>

                  {/* Options summary */}
                  <div className="text-xs text-gray-400">
                    Safe defaults enabled: Deblock/denoise low, WB auto, local contrast/sharpen low, grain off.
                  </div>
                </div>
              </div>

              {/* Processing Info */}
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-green-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Processing Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Images queued:</span>
                    <span>{selectedFiles.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Selected model:</span>
                    <span className="text-right">
                      {getCurrentModel()?.name || "Unknown Model"}
                    </span>
                  </div>
                  <div className="flex justify-between text-white font-medium">
                    <span>Est. processing time:</span>
                    <span>{getCurrentModel()?.processingTime || "60s"}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Feature preservation:</span>
                    <span className={enhancementSettings.preserveAsianFeatures ? "text-green-400" : "text-gray-400"}>
                      {enhancementSettings.preserveAsianFeatures ? "✅ Enabled" : "❌ Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Quality rating:</span>
                    <span className="text-yellow-400">
                      {"★".repeat(getCurrentModel()?.qualityRating || 0)}
                      {"☆".repeat(5 - (getCurrentModel()?.qualityRating || 0))}
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
            {processingQueue.length === 0 ? (
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
                          src={job.file?.preview || "/placeholder.svg?height=96&width=96&query=queue-preview"}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-medium">{job.file?.name || "Unknown file"}</p>
                          <p className="text-sm text-gray-400">
                            {safeGetModelProperty(job.settings?.model, "name", "Unknown Model")} • {job.settings?.upscaleFactor || 2}x
                            {job.settings?.preserveAsianFeatures && <span className="ml-2 text-green-400">🇮🇩 ASEAN-Safe</span>}
                          </p>
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
            {completedJobs.length === 0 ? (
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
                        src={job.downloadUrl || "/placeholder.svg?height=400&width=700&query=enhanced-image"}
                        alt={`Enhanced ${job.originalFileName || "image"}`}
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>

                    <div className="p-4">
                      <p className="text-white font-medium mb-2">{job.originalFileName || "Unknown file"}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Enhanced with Replicate</span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-300 mb-4">
                        <div className="flex justify-between">
                          <span>Original:</span>
                          <span>{job.originalSize || "Unknown size"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Model:</span>
                          <span className="text-blue-400 font-mono text-xs">{job.modelName || "Unknown Model"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing:</span>
                          <span className="text-purple-400">{job.processingTime || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Upscale:</span>
                          <span className="text-green-400">{job.upscaleFactor || 2}x</span>
                        </div>
                        {job.preserveAsianFeatures && (
                          <div className="flex justify-between">
                            <span>ASEAN Features:</span>
                            <span className="text-green-400">✅ Preserved</span>
                          </div>
                        )}
                        {job.predictionId && (
                          <div className="flex justify-between">
                            <span>Prediction ID:</span>
                            <span className="text-gray-400 font-mono text-xs">{String(job.predictionId).slice(0, 8)}...</span>
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
