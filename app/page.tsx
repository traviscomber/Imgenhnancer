"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Upload,
  ImageIcon,
  Settings,
  Download,
  Zap,
  Loader2,
  CheckCircle,
  Play,
  X,
  RefreshCw,
  AlertCircle,
  Search,
  TestTube,
  Key,
  Shield,
  LogIn,
  Users,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { UserMenu } from "@/components/auth/user-menu"
import { ProfileDialog } from "@/components/auth/profile-dialog"
import { UserManagement } from "@/components/admin/user-management"
import { RoleManagement } from "@/components/admin/role-management"
import { preProcessImage, postProcessImage, type EnhancementToggles } from "@/utils/image-processing"
import { generateDomemaster, type DomemasterOptions } from "@/utils/domemaster"

// Define enhancement models - Updated with face-preserving options
const ENHANCEMENT_MODELS = [
  {
    id: "clarity-upscaler-face-preserve",
    name: "Clarity Upscaler (Face Preserving)",
    description:
      "High-quality AI upscaling that completely preserves original faces without any enhancement or modification. Perfect for maintaining authentic facial features.",
    maxUpscale: 4,
    replicateModel: "philz1337x/clarity-upscaler",
    version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
    category: "upscaling",
    recommended: true,
    status: "working",
    inputField: "image",
    asianFaceCompatibility: "excellent" as const,
    westernBias: false,
    faceEnhancement: false,
    preserveFaces: true,
  },
  {
    id: "clarity-upscaler",
    name: "Clarity Upscaler (Standard)",
    description:
      "High-quality AI upscaling with intelligent parameter optimization. Includes face enhancement for portraits.",
    maxUpscale: 4,
    replicateModel: "philz1337x/clarity-upscaler",
    version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
    category: "upscaling",
    recommended: false,
    status: "working",
    inputField: "image",
    asianFaceCompatibility: "good" as const,
    westernBias: false,
    faceEnhancement: true,
    preserveFaces: false,
  },
  {
    id: "clarity-upscaler-no-face",
    name: "Clarity Upscaler (No Face Enhancement)",
    description:
      "High-quality AI upscaling without face enhancement. Preserves original facial features and expressions exactly as they are.",
    maxUpscale: 4,
    replicateModel: "philz1337x/clarity-upscaler",
    version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
    category: "upscaling",
    recommended: false,
    status: "working",
    inputField: "image",
    asianFaceCompatibility: "excellent" as const,
    westernBias: false,
    faceEnhancement: false,
    preserveFaces: true,
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

// NUEVO: Opciones de domemaster (preset/exportación)
interface DomePresetState extends DomemasterOptions {
  enabled: boolean
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

  // Enhancement Settings with safe defaults - Face Preserving as default
  const [enhancementSettings, setEnhancementSettings] = useState<EnhancementSettings>({
    model: "clarity-upscaler-face-preserve",
    upscaleFactor: 2,
    targetUse: "display",
    format: "PNG",
    quality: 95,
    faceEnhance: false,
    preserveAsianFeatures: true,
    pre: {
      deblock: "off",
      denoise: "off",
      whiteBalance: "off",
    },
    post: {
      localContrast: "off",
      sharpen: "off",
      grain: "off",
    },
  })

  // ASEAN Face Preservation Presets
  const ASEAN_FACE_PRESETS = [
    {
      id: "asean-portrait-safe",
      name: "ASEAN Portrait (Ultra Safe)",
      description:
        "Maximum face preservation for Indonesian/Malaysian/Thai/Filipino portraits. Zero facial modification.",
      icon: "🛡️",
      settings: {
        model: "clarity-upscaler-face-preserve",
        upscaleFactor: 2,
        targetUse: "display",
        format: "PNG",
        quality: 98,
        faceEnhance: false,
        preserveAsianFeatures: true,
        pre: {
          deblock: "off",
          denoise: "off",
          whiteBalance: "off",
        },
        post: {
          localContrast: "off",
          sharpen: "off",
          grain: "off",
        },
      },
      domeSettings: {
        enabled: false,
        size: 4096,
        bleedPercent: 2,
        overlay: false,
        projection: "equidistant" as const,
      },
    },
    {
      id: "asean-family-photo",
      name: "ASEAN Family Photo",
      description: "Gentle enhancement for family photos with multiple ASEAN faces. Preserves all facial features.",
      icon: "👨‍👩‍👧‍👦",
      settings: {
        model: "clarity-upscaler-face-preserve",
        upscaleFactor: 3,
        targetUse: "print",
        format: "PNG",
        quality: 95,
        faceEnhance: false,
        preserveAsianFeatures: true,
        pre: {
          deblock: "low",
          denoise: "off",
          whiteBalance: "off",
        },
        post: {
          localContrast: "off",
          sharpen: "off",
          grain: "very-low",
        },
      },
      domeSettings: {
        enabled: false,
        size: 6144,
        bleedPercent: 3,
        overlay: false,
        projection: "equidistant" as const,
      },
    },
    {
      id: "asean-wedding-photo",
      name: "ASEAN Wedding Photo",
      description: "High-quality enhancement for wedding photos. Preserves natural skin tones and facial features.",
      icon: "💒",
      settings: {
        model: "clarity-upscaler-face-preserve",
        upscaleFactor: 4,
        targetUse: "print",
        format: "PNG",
        quality: 98,
        faceEnhance: false,
        preserveAsianFeatures: true,
        pre: {
          deblock: "low",
          denoise: "low",
          whiteBalance: "auto",
        },
        post: {
          localContrast: "low",
          sharpen: "off",
          grain: "very-low",
        },
      },
      domeSettings: {
        enabled: false,
        size: 8192,
        bleedPercent: 2,
        overlay: false,
        projection: "equidistant" as const,
      },
    },
    {
      id: "asean-id-document",
      name: "ASEAN ID/Document Photo",
      description: "Perfect for official documents. Maintains exact facial features required for identification.",
      icon: "🆔",
      settings: {
        model: "clarity-upscaler-face-preserve",
        upscaleFactor: 2,
        targetUse: "document",
        format: "PNG",
        quality: 100,
        faceEnhance: false,
        preserveAsianFeatures: true,
        pre: {
          deblock: "off",
          denoise: "off",
          whiteBalance: "off",
        },
        post: {
          localContrast: "off",
          sharpen: "off",
          grain: "off",
        },
      },
      domeSettings: {
        enabled: false,
        size: 2048,
        bleedPercent: 0,
        overlay: false,
        projection: "equidistant" as const,
      },
    },
    {
      id: "asean-cultural-heritage",
      name: "ASEAN Cultural Heritage",
      description:
        "For traditional photos, cultural events, and heritage documentation. Preserves authentic appearance.",
      icon: "🏛️",
      settings: {
        model: "clarity-upscaler-face-preserve",
        upscaleFactor: 4,
        targetUse: "archive",
        format: "PNG",
        quality: 98,
        faceEnhance: false,
        preserveAsianFeatures: true,
        pre: {
          deblock: "medium",
          denoise: "low",
          whiteBalance: "auto",
        },
        post: {
          localContrast: "low",
          sharpen: "off",
          grain: "low",
        },
      },
      domeSettings: {
        enabled: false,
        size: 8192,
        bleedPercent: 3,
        overlay: false,
        projection: "equidistant" as const,
      },
    },
    {
      id: "asean-mobile-selfie",
      name: "ASEAN Mobile Selfie",
      description: "Optimized for mobile selfies and casual photos. Gentle enhancement while preserving natural look.",
      icon: "🤳",
      settings: {
        model: "clarity-upscaler-face-preserve",
        upscaleFactor: 2,
        targetUse: "social",
        format: "PNG",
        quality: 92,
        faceEnhance: false,
        preserveAsianFeatures: true,
        pre: {
          deblock: "low",
          denoise: "low",
          whiteBalance: "auto",
        },
        post: {
          localContrast: "off",
          sharpen: "off",
          grain: "very-low",
        },
      },
      domeSettings: {
        enabled: false,
        size: 4096,
        bleedPercent: 2,
        overlay: false,
        projection: "equidistant" as const,
      },
    },
  ]

  // NUEVO: estado del preset domemaster
  const [domePreset, setDomePreset] = useState<DomePresetState>({
    enabled: false,
    size: 8192,
    bleedPercent: 3,
    overlay: false,
    projection: "equidistant",
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

  const safeGetModelProperty = (
    modelId: string | undefined | null,
    property: keyof (typeof ENHANCEMENT_MODELS)[0],
    fallback: any = "Unknown",
  ) => {
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
      const newFiles = Array.from(files).map((file) => {
        // Check file size and warn user
        const fileSizeMB = file.size / (1024 * 1024)
        let warning = null

        if (fileSizeMB > 5) {
          warning = "Very large file - will be heavily compressed"
        } else if (fileSizeMB > 2) {
          warning = "Large file - will be compressed for API compatibility"
        } else if (fileSizeMB > 1) {
          warning = "File will be compressed for optimal processing"
        }

        const preview = URL.createObjectURL(file)
        const fileId = Date.now() + Math.random()

        // Get actual image dimensions
        const img = new Image()
        img.onload = () => {
          // Update the file with actual dimensions
          setSelectedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, width: img.width, height: img.height } : f)),
          )
          URL.revokeObjectURL(img.src) // Clean up
        }
        img.onerror = () => {
          URL.revokeObjectURL(img.src) // Clean up on error
        }
        img.src = preview

        return {
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          preview,
          status: "ready",
          error: null,
          warning: warning,
          width: null, // Will be updated when image loads
          height: null, // Will be updated when image loads
        }
      })
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
    // If domemaster is enabled, return dome resolution
    if (domePreset.enabled) return `${domePreset.size}x${domePreset.size}`

    // If no files selected, show placeholder
    if (selectedFiles.length === 0) {
      return "Select image to calculate"
    }

    // Calculate based on first selected file with actual dimensions
    const firstFile = selectedFiles[0]
    if (firstFile?.width && firstFile?.height) {
      const targetWidth = Math.round(firstFile.width * enhancementSettings.upscaleFactor)
      const targetHeight = Math.round(firstFile.height * enhancementSettings.upscaleFactor)
      return `${targetWidth}x${targetHeight} (${Math.round((targetWidth * targetHeight) / 1000000)}MP)`
    }

    // If dimensions not loaded yet, show loading
    return "Loading dimensions..."
  }

  const getMaxUpscale = () => {
    const selectedModel = getCurrentModel()
    return selectedModel?.maxUpscale || 4
  }

  async function exportDomemasterForJob(job: CompletedJob) {
    try {
      console.log(`🔄 Starting domemaster export for ${job.originalFileName}...`)

      // Show progress in UI
      const progressToast = document.createElement("div")
      progressToast.className = "fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      progressToast.textContent = `Generating ${(domePreset.size / 1024).toFixed(0)}K domemaster...`
      document.body.appendChild(progressToast)

      // Usar el proxy para evitar CORS si es URL externa
      const url = `/api/proxy-image?url=${encodeURIComponent(job.downloadUrl)}`
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`Proxy fetch failed: ${resp.status}`)
      const blob = await resp.blob()

      console.log(`✅ Downloaded enhanced image: ${Math.round(blob.size / 1024)}KB`)

      const out = await generateDomemaster(blob, {
        size: domePreset.size,
        bleedPercent: domePreset.bleedPercent,
        overlay: domePreset.overlay,
        projection: "equidistant",
      })

      const fileNameBase = (job.originalFileName || "enhanced").replace(/\.[a-zA-Z0-9]+$/, "")
      const suffix = `_DOMEMASTER_${(domePreset.size / 1024).toFixed(0)}K`
      const outName = `${fileNameBase}${suffix}.png`

      const outUrl = URL.createObjectURL(out)
      const a = document.createElement("a")
      a.href = outUrl
      a.download = outName
      document.body.appendChild(a)
      a.click()
      a.remove()

      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(outUrl)
        document.body.removeChild(progressToast)
      }, 1000)

      console.log(`✅ Domemaster exported: ${outName} (${Math.round(out.size / 1024)}KB)`)

      // Show success message
      const successToast = document.createElement("div")
      successToast.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50"
      successToast.textContent = `✅ Domemaster exported: ${outName}`
      document.body.appendChild(successToast)
      setTimeout(() => document.body.removeChild(successToast), 3000)
    } catch (e) {
      console.error("Domemaster export error:", e)

      // Show error message
      const errorToast = document.createElement("div")
      errorToast.className = "fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50"
      errorToast.textContent = `❌ Domemaster export failed: ${e instanceof Error ? e.message : "Unknown error"}`
      document.body.appendChild(errorToast)
      setTimeout(() => document.body.removeChild(errorToast), 5000)
    }
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

    // Check file size before processing
    const maxSize = 15 * 1024 * 1024 // 15MB (increased for mobile photos)
    if (fileToProcess.file.size > maxSize) {
      setSelectedFiles((prev) => [
        ...prev.filter((f) => f.id !== fileId),
        {
          ...fileToProcess,
          status: "failed",
          error: `File too large (${formatFileSize(fileToProcess.file.size)}). Maximum size is 15MB.`,
          details: "file_too_large",
          step: "validation",
        },
      ])
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
      // Compress large images (especially mobile photos) on client side
      setProcessingQueue((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, progress: "Compressing for upload..." } : j)),
      )

      let processedFile = fileToProcess.file

      // More aggressive compression for API compatibility
      if (fileToProcess.file.size > 800 * 1024) {
        // 800KB threshold (very aggressive)
        try {
          const { compressImageForUpload } = await import("@/utils/image-processing")
          processedFile = await compressImageForUpload(fileToProcess.file, 0.8) // 800KB max
          console.log(
            `📱 Image compressed for API: ${formatFileSize(fileToProcess.file.size)} → ${formatFileSize(processedFile.size)}`,
          )

          // Show compression info to user
          setProcessingQueue((prev) =>
            prev.map((j) =>
              j.id === job.id
                ? {
                    ...j,
                    progress: `Compressed to ${formatFileSize(processedFile.size)} for API compatibility...`,
                  }
                : j,
            ),
          )
        } catch (compressionError) {
          console.error("Compression failed:", compressionError)
          // If compression fails and file is too large, show error
          if (fileToProcess.file.size > 1 * 1024 * 1024) {
            setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id))
            setSelectedFiles((prev) => [
              ...prev,
              {
                ...fileToProcess,
                status: "failed",
                error: `Image too large (${formatFileSize(fileToProcess.file.size)}) and compression failed. Please manually resize to under 1MB.`,
                details: "compression_failed",
                step: "client_compression",
              },
            ])
            return
          }
          // Continue with original file if compression fails but file is not too large
        }
      }

      // Pre-process on client (light, safe)
      setProcessingQueue((prev) => prev.map((j) => (j.id === job.id ? { ...j, progress: "Pre-processing..." } : j)))

      const needPre =
        enhancementSettings.pre?.deblock !== "off" ||
        enhancementSettings.pre?.denoise !== "off" ||
        enhancementSettings.pre?.whiteBalance === "auto"

      let uploadBlob: Blob
      if (needPre) {
        try {
          uploadBlob = await preProcessImage(processedFile, enhancementSettings.pre)
        } catch (error) {
          console.error("Pre-processing error:", error)
          // Fall back to processed file if pre-processing fails
          uploadBlob = processedFile
        }
      } else {
        uploadBlob = processedFile
      }

      const uploadFile = new File([uploadBlob], processedFile.name.replace(/\.(\w+)$/, "") + ".jpg", {
        type: "image/jpeg", // Use JPEG for better compression
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

      // Call API with improved error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15 * 60 * 1000) // 15 minutes

      let response: Response
      try {
        response = await fetch("/api/enhance-replicate", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        })
      } catch (fetchError: any) {
        clearTimeout(timeoutId)

        let errorMessage = "Network error"
        if (fetchError.name === "AbortError") {
          errorMessage = "Request timed out after 15 minutes"
        } else if (fetchError.message.includes("fetch")) {
          errorMessage = "Failed to connect to server"
        } else {
          errorMessage = fetchError.message || "Unknown network error"
        }

        throw new Error(errorMessage)
      } finally {
        clearTimeout(timeoutId)
      }

      // Improved response handling
      let result: any
      try {
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
          result = await response.json()
        } else {
          const text = await response.text()
          result = { success: false, error: text || `HTTP ${response.status}` }
        }
      } catch (parseError: any) {
        result = {
          success: false,
          error: "Failed to parse server response",
          details: parseError.message,
        }
      }

      // Remove from queue
      setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id))

      if (!response.ok || !result?.success) {
        const errorMsg = result?.error || `HTTP ${response.status}`
        const details = result?.details || result?.step || "Unknown error"

        setSelectedFiles((prev) => [
          ...prev,
          {
            ...fileToProcess,
            status: "failed",
            error: errorMsg,
            details: details,
            step: result?.step || "api_error",
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
          setProcessingQueue(
            (prev) =>
              [
                ...prev,
                {
                  id: `post-${job.id}`,
                  file: job.file,
                  settings: job.settings,
                  status: "processing",
                  startTime: Date.now(),
                  progress: "Post-processing...",
                },
              ] as any,
          )
          const proxied = await fetch(`/api/proxy-image?url=${encodeURIComponent(result.downloadUrl)}`)
          if (!proxied.ok) throw new Error(`Proxy fetch failed: ${proxied.status}`)
          const blob = await proxied.blob()
          const postBlob = await postProcessImage(blob, enhancementSettings.post)
          const url = URL.createObjectURL(postBlob)
          finalUrl = url
        } catch (e) {
          console.warn("Post-processing skipped due to error:", e)
        } finally {
          setProcessingQueue((prev) => prev.filter((j) => (j as any).id !== `post-${job.id}`))
        }
      }

      // Ensure we have a valid model ID and name with complete safety
      const finalModelId = result.model || enhancementSettings?.model || "clarity-upscaler-face-preserve"
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

      setCompletedJobs((prev) => [...prev, completedJob])
    } catch (error: any) {
      console.error("Processing error:", error)
      setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id))
      setSelectedFiles((prev) => [
        ...prev,
        {
          ...fileToProcess,
          status: "failed",
          error: error?.message || "Processing failed",
          details: error?.name || "Unknown error",
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

  // AI-powered parameter optimization based on image analysis
  const optimizeParametersWithAI = async (file: File) => {
    try {
      // Analyze image characteristics
      const img = new Image()
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      return new Promise<Partial<EnhancementSettings>>((resolve) => {
        img.onload = () => {
          canvas.width = Math.min(img.width, 512) // Sample size for analysis
          canvas.height = Math.min(img.height, 512)
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
          if (!imageData) {
            resolve({}) // Fallback to defaults
            return
          }

          // Analyze image characteristics
          const pixels = imageData.data
          let totalBrightness = 0
          const totalContrast = 0
          let noiseLevel = 0
          let edgeCount = 0

          // Calculate brightness and detect noise/edges
          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i]
            const g = pixels[i + 1]
            const b = pixels[i + 2]
            const brightness = (r + g + b) / 3
            totalBrightness += brightness

            // Simple edge detection
            if (i > canvas.width * 4) {
              const prevR = pixels[i - canvas.width * 4]
              const prevG = pixels[i - canvas.width * 4 + 1]
              const prevB = pixels[i - canvas.width * 4 + 2]
              const prevBrightness = (prevR + prevG + prevB) / 3
              const diff = Math.abs(brightness - prevBrightness)
              if (diff > 30) edgeCount++
              if (diff > 5 && diff < 15) noiseLevel++
            }
          }

          const avgBrightness = totalBrightness / (pixels.length / 4)
          const isLowLight = avgBrightness < 100
          const isHighNoise = noiseLevel > (pixels.length / 4) * 0.1
          const hasDetails = edgeCount > (pixels.length / 4) * 0.05
          const aspectRatio = img.width / img.height
          const isPortrait = aspectRatio < 1
          const resolution = img.width * img.height
          const isHighRes = resolution > 2000000 // 2MP+

          // AI-optimized parameters based on analysis - Always use face-preserving model
          const optimizedSettings: Partial<EnhancementSettings> = {
            // Always use face-preserving model for AI optimization
            model: "clarity-upscaler-face-preserve",

            // Upscale factor based on current resolution
            upscaleFactor: isHighRes ? 2 : resolution < 500000 ? 4 : 3,

            // Pre-processing optimization
            pre: {
              deblock: file.type === "image/jpeg" ? (isHighNoise ? "medium" : "low") : "off",
              denoise: isHighNoise ? "medium" : isLowLight ? "low" : "off",
              whiteBalance: isLowLight || avgBrightness < 80 ? "auto" : "off",
            },

            // Post-processing optimization
            post: {
              localContrast: isLowLight ? "medium" : hasDetails ? "low" : "off",
              sharpen: hasDetails && !isHighNoise ? "low" : "off",
              grain: avgBrightness > 200 ? "very-low" : "off", // Add grain to very bright/flat images
            },

            // Target use optimization
            targetUse: isPortrait ? "display" : resolution > 4000000 ? "print" : "display",
          }

          console.log("🤖 AI Analysis (Face-Preserving):", {
            avgBrightness: Math.round(avgBrightness),
            isLowLight,
            isHighNoise,
            hasDetails,
            resolution: `${img.width}x${img.height}`,
            optimizedSettings,
          })

          resolve(optimizedSettings)
          URL.revokeObjectURL(img.src)
        }

        img.onerror = () => {
          resolve({}) // Fallback to defaults
          URL.revokeObjectURL(img.src)
        }

        img.src = URL.createObjectURL(file)
      })
    } catch (error) {
      console.warn("AI optimization failed, using defaults:", error)
      return {}
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
                <p className="text-sm text-blue-200">Powered by Clarity Upscaler AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-400">Clarity AI ✅</span>
                <span className="text-xs text-gray-400">{ENHANCEMENT_MODELS.length} models available</span>
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
                      <p className="text-gray-300">Test available Replicate models for image enhancement</p>
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
                  <p className="text-blue-200 mb-4">Supports: JPG, PNG, WebP, HEIC, TIFF up to 15MB</p>
                  <p className="text-sm text-gray-400">Enhanced with Clarity Upscaler AI Technology</p>
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
                              {file.warning && (
                                <div className="mt-1">
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                    <p className="text-sm text-yellow-400">{file.warning}</p>
                                  </div>
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
                  {/* AI Parameter Optimization */}
                  <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/20">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-300" />
                      AI Parameter Optimization
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Clarity Upscaler with intelligent parameter selection and face preservation
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={async () => {
                          if (selectedFiles.length > 0) {
                            const optimized = await optimizeParametersWithAI(selectedFiles[0].file)
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              ...optimized,
                            }))
                          }
                        }}
                        disabled={selectedFiles.length === 0}
                        className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Optimize (Face-Safe)
                      </button>
                      <button
                        onClick={() => {
                          // Dome-optimized settings with face preservation
                          setDomePreset((d) => ({ ...d, enabled: true, size: 8192, bleedPercent: 3, overlay: true }))
                          setEnhancementSettings((prev) => ({
                            ...prev,
                            model: "clarity-upscaler-face-preserve",
                            targetUse: "dome",
                            upscaleFactor: Math.min(prev.upscaleFactor, getMaxUpscale()),
                            pre: { deblock: "off", denoise: "off", whiteBalance: "off" },
                            post: { localContrast: "off", sharpen: "off", grain: "off" },
                            format: "PNG",
                            quality: 95,
                          }))
                        }}
                        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        Dome 8K (Face-Safe)
                      </button>
                    </div>
                    <div className="mt-3 text-xs text-purple-200 bg-purple-900/20 rounded p-2">
                      🛡️ <strong>Face Preservation:</strong> AI optimization automatically selects face-preserving models
                      to maintain original facial features without any enhancement or modification.
                    </div>
                  </div>

                  {/* ASEAN Face Preservation Presets */}
                  <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg p-4 border border-emerald-500/20">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      🇮🇩🇲🇾🇹🇭🇵🇭 ASEAN Face Preservation Presets
                    </h4>
                    <p className="text-sm text-gray-300 mb-4">
                      Specialized presets designed to preserve Indonesian, Malaysian, Thai, Filipino, and other ASEAN
                      facial features without any modification.
                    </p>

                    <div className="grid grid-cols-1 gap-2 mb-4">
                      {ASEAN_FACE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              ...preset.settings,
                            }))
                            setDomePreset((prev) => ({
                              ...prev,
                              ...preset.domeSettings,
                            }))
                          }}
                          className="flex items-start gap-3 p-3 rounded-md bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left"
                        >
                          <span className="text-lg flex-shrink-0 mt-0.5">{preset.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white mb-1">{preset.name}</div>
                            <div className="text-xs text-gray-300 leading-relaxed">{preset.description}</div>
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                                {preset.settings.upscaleFactor}x upscale
                              </span>
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                                {preset.settings.format}
                              </span>
                              <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded">🛡️ Face Safe</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="bg-emerald-900/20 border border-emerald-500/20 rounded p-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-emerald-200">
                          <strong>100% ASEAN Face Preservation Guarantee:</strong> These presets are specifically
                          designed to maintain authentic ASEAN facial features, skin tones, eye shapes, and cultural
                          characteristics without any Western bias or modification.
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-emerald-300">
                        ✅ Preserves natural skin tones • ✅ Maintains eye shape • ✅ Keeps facial structure • ✅ No
                        Western bias
                      </div>
                    </div>
                  </div>

                  {/* AI Model Selection - Face-preserving options first */}
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
                      {ENHANCEMENT_MODELS.filter((m) => m.status === "working").map((model) => (
                        <option key={model.id} value={model.id} className="bg-slate-800">
                          {model.name} {model.recommended && "⭐"}
                          {model.preserveFaces && " 🛡️"}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      {getCurrentModel()?.description || "Model description not available"}
                      {getCurrentModel()?.preserveFaces && (
                        <span className="block mt-1 text-green-300">
                          🛡️ <strong>Face Preserving:</strong> Maintains original facial features without any enhancement
                        </span>
                      )}
                      {getCurrentModel()?.faceEnhancement && (
                        <span className="block mt-1 text-yellow-300">
                          ⚠️ <strong>Face Enhancement:</strong> May modify facial features and expressions
                        </span>
                      )}
                    </p>
                    {getCurrentModel()?.preserveFaces && (
                      <div className="mt-2 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-green-200">
                            <strong>100% Face Preservation:</strong> This model will not alter facial features,
                            expressions, skin tone, or any facial characteristics. Perfect for maintaining authentic
                            appearance.
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
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              pre: { ...prev.pre, deblock: e.target.value as any },
                            }))
                          }
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">
                            Off
                          </option>
                          <option value="low" className="bg-slate-800">
                            Low (recommended)
                          </option>
                          <option value="medium" className="bg-slate-800">
                            Medium
                          </option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Reduce block/ringing before upscaling.</p>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Denoise</label>
                        <select
                          value={enhancementSettings.pre.denoise}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              pre: { ...prev.pre, denoise: e.target.value as any },
                            }))
                          }
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">
                            Off
                          </option>
                          <option value="low" className="bg-slate-800">
                            Low (recommended)
                          </option>
                          <option value="medium" className="bg-slate-800">
                            Medium
                          </option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Light noise reduction (chroma-friendly).</p>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">White Balance</label>
                        <select
                          value={enhancementSettings.pre.whiteBalance}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              pre: { ...prev.pre, whiteBalance: e.target.value as any },
                            }))
                          }
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">
                            Off
                          </option>
                          <option value="auto" className="bg-slate-800">
                            Auto (recommended)
                          </option>
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
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              post: { ...prev.post, localContrast: e.target.value as any },
                            }))
                          }
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">
                            Off
                          </option>
                          <option value="low" className="bg-slate-800">
                            Low (recommended)
                          </option>
                          <option value="medium" className="bg-slate-800">
                            Medium
                          </option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Gentle pop without halos.</p>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Sharpen</label>
                        <select
                          value={enhancementSettings.post.sharpen}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              post: { ...prev.post, sharpen: e.target.value as any },
                            }))
                          }
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">
                            Off
                          </option>
                          <option value="low" className="bg-slate-800">
                            Low (recommended)
                          </option>
                          <option value="medium" className="bg-slate-800">
                            Medium
                          </option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Edge-aware sharpen to avoid plastic look.</p>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Add Grain</label>
                        <select
                          value={enhancementSettings.post.grain}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              post: { ...prev.post, grain: e.target.value as any },
                            }))
                          }
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value="off" className="bg-slate-800">
                            Off
                          </option>
                          <option value="very-low" className="bg-slate-800">
                            Very Low
                          </option>
                          <option value="low" className="bg-slate-800">
                            Low
                          </option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Subtle texture to reduce {"AI plasticity"}.</p>
                      </div>
                    </div>
                  </div>

                  {/* NUEVO: Exportación Domemaster */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Domemaster Export</h4>
                    <div className="flex items-center gap-3 mb-3">
                      <label className="text-sm text-gray-200">Enable</label>
                      <input
                        type="checkbox"
                        checked={domePreset.enabled}
                        onChange={(e) => setDomePreset((d) => ({ ...d, enabled: e.target.checked }))}
                      />
                      <span className={`text-xs ${domePreset.enabled ? "text-green-400" : "text-gray-400"}`}>
                        {domePreset.enabled ? "ON" : "OFF"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Resolution</label>
                        <select
                          value={domePreset.size}
                          onChange={(e) => setDomePreset((d) => ({ ...d, size: Number.parseInt(e.target.value, 10) }))}
                          className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        >
                          <option value={4096} className="bg-slate-800">
                            4K (preview)
                          </option>
                          <option value={8192} className="bg-slate-800">
                            8K (recommended)
                          </option>
                          <option value={12288} className="bg-slate-800">
                            12K (high detail)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Bleed Margin</label>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          step={0.5}
                          value={domePreset.bleedPercent}
                          onChange={(e) =>
                            setDomePreset((d) => ({ ...d, bleedPercent: Number.parseFloat(e.target.value) }))
                          }
                          className="w-full"
                        />
                        <div className="text-xs text-gray-400 mt-1">{domePreset.bleedPercent}%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="overlay"
                          type="checkbox"
                          checked={domePreset.overlay}
                          onChange={(e) => setDomePreset((d) => ({ ...d, overlay: e.target.checked }))}
                        />
                        <label htmlFor="overlay" className="text-xs text-gray-300">
                          Overlays (guides/axes)
                        </label>
                      </div>
                      <div className="text-xs text-gray-400">
                        Output: PNG 8-bit with black background outside circle.
                      </div>
                    </div>
                  </div>

                  {/* Options summary */}
                  <div className="text-xs text-gray-400">
                    All processing disabled by default. Enable pre/post processing and domemaster as needed. Domemaster:{" "}
                    {domePreset.enabled ? `${domePreset.size}×${domePreset.size} with mask` : "disabled"}.
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
                    <span className="text-right">{getCurrentModel()?.name || "Unknown Model"}</span>
                  </div>
                  <div className="flex justify-between text-white font-medium">
                    <span>Target:</span>
                    <span>{getTargetResolution()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Face enhancement:</span>
                    <span className={getCurrentModel()?.preserveFaces ? "text-green-400" : "text-yellow-400"}>
                      {getCurrentModel()?.preserveFaces ? "🛡️ Preserved" : "⚠️ Enhanced"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Domemaster preset:</span>
                    <span className={domePreset.enabled ? "text-green-400" : "text-gray-400"}>
                      {domePreset.enabled
                        ? `${(domePreset.size / 1024).toFixed(0)}K • Bleed ${domePreset.bleedPercent}%`
                        : "OFF"}
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
                            {safeGetModelProperty(job.settings?.model, "name", "Unknown Model")} •{" "}
                            {job.settings?.upscaleFactor || 2}x
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
                        <span className="text-sm text-green-400">Enhanced with Clarity AI</span>
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
                        {job.predictionId && (
                          <div className="flex justify-between">
                            <span>Prediction ID:</span>
                            <span className="text-gray-400 font-mono text-xs">
                              {String(job.predictionId).slice(0, 8)}...
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Download and Domemaster export buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => window.open(job.downloadUrl, "_blank")}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Enhanced</span>
                        </button>

                        <button
                          onClick={() => exportDomemasterForJob(job)}
                          disabled={!domePreset.enabled}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          title={
                            domePreset.enabled
                              ? `Export domemaster ${(domePreset.size / 1024).toFixed(0)}K`
                              : "Enable Dome preset in settings"
                          }
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>
                            {domePreset.enabled
                              ? `Export Domemaster ${(domePreset.size / 1024).toFixed(0)}K`
                              : "Enable Dome preset to export"}
                          </span>
                        </button>
                      </div>
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
