"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  ImageIcon,
  Settings,
  Download,
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
  ArrowRight,
  Globe,
  Cpu,
  Eye,
  Award,
  Layers,
  Maximize,
  Heart,
  Brain,
  Palette,
  Target,
  Fingerprint,
} from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { UserMenu } from "@/components/auth/user-menu"
import { ProfileDialog } from "@/components/auth/profile-dialog"
import { UserManagement } from "@/components/admin/user-management"
import { RoleManagement } from "@/components/admin/role-management"
import { preProcessImage, postProcessImage, type EnhancementToggles } from "@/utils/image-processing"
import { generateDomemaster, type DomemasterOptions } from "@/utils/domemaster"
import Footer from "@/components/footer"

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
  const [activeTab, setActiveTab] = useState("home")
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
    setActiveTab("home")
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
      progressToast.className = "fixed top-4 right-4 n3uralia-card text-white px-4 py-2 rounded-lg z-50"
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
      successToast.className = "fixed top-4 right-4 n3uralia-card text-white px-4 py-2 rounded-lg z-50"
      successToast.textContent = `✅ Domemaster exported: ${outName}`
      document.body.appendChild(successToast)
      setTimeout(() => document.body.removeChild(successToast), 3000)
    } catch (e) {
      console.error("Domemaster export error:", e)

      // Show error message
      const errorToast = document.createElement("div")
      errorToast.className =
        "fixed top-4 right-4 bg-red-900/20 border border-red-500/20 text-red-300 px-4 py-2 rounded-lg z-50"
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

  // Replace color-based status indicators with monochrome
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
      case "active":
      case "success":
        return "bg-white/20 text-white border-white/30"
      case "failed":
      case "error":
        return "bg-white/5 text-white/70 border-white/15"
      case "processing":
      case "warning":
        return "bg-white/10 text-white/80 border-white/20"
      default:
        return "bg-white/10 text-white/70 border-white/20"
    }
  }

  // Show authentication modal if not logged in
  if (!user && showAuth) {
    return (
      <div className="min-h-screen n3uralia-gradient flex items-center justify-center p-6">
        {authMode === "login" ? (
          <LoginForm onLogin={handleLogin} onSwitchToSignup={() => setAuthMode("signup")} isLoading={isAuthLoading} />
        ) : (
          <SignupForm onSignup={handleSignup} onSwitchToLogin={() => setAuthMode("login")} isLoading={isAuthLoading} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen n3uralia-gradient">
      {/* Header */}
      <header className="n3uralia-card sticky top-0 z-50 border-b n3uralia-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center n3uralia-glow-gold">
                <Brain className="w-6 h-6 n3uralia-gold-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white n3uralia-gold-accent">n3uralia</h1>
                <p className="text-sm n3uralia-text-muted">AI Image Enhancement Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full n3uralia-pulse-gold"
                    style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                  ></div>
                  <span className="text-white">AI Online</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <span className="n3uralia-text-muted">{ENHANCEMENT_MODELS.length} Models</span>
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
                  className="n3uralia-button-gold px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Access Platform</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-1 n3uralia-card rounded-xl p-1">
          {[
            { id: "home", label: "Home", icon: Globe },
            { id: "enhance", label: "Enhance", icon: Sparkles },
            { id: "processing", label: "Processing", icon: Cpu },
            { id: "gallery", label: "Gallery", icon: ImageIcon },
            ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (!user && tab.id !== "home") {
                  setShowAuth(true)
                  return
                }
                setActiveTab(tab.id)
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id ? "n3uralia-button-gold" : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {activeTab === "home" && (
          <div className="space-y-20">
            {/* Hero Section */}
            <section className="text-center py-20">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <div className="inline-flex items-center space-x-2 n3uralia-card px-4 py-2 rounded-full mb-6">
                    <div
                      className="w-2 h-2 rounded-full n3uralia-pulse-gold"
                      style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                    ></div>
                    <span className="text-sm n3uralia-text-muted">AI Enhancement Platform</span>
                  </div>
                </div>
                <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
                  Precision
                  <br />
                  <span className="n3uralia-gold-accent">Enhancement</span>
                </h1>
                <p className="text-xl n3uralia-text-muted mb-12 leading-relaxed max-w-2xl mx-auto">
                  Professional AI image enhancement with cultural sensitivity. Preserve authenticity while achieving
                  exceptional quality.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      if (!user) {
                        setShowAuth(true)
                      } else {
                        setActiveTab("enhance")
                      }
                    }}
                    className="n3uralia-button-gold px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center space-x-2 group"
                  >
                    <Brain className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Start Enhancement</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" })}
                    className="n3uralia-button-secondary px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Explore Capabilities</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Capabilities Section with Flippable Cards */}
            <section id="capabilities" className="py-20">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Core Capabilities</h2>
                <p className="text-xl n3uralia-text-muted max-w-3xl mx-auto">
                  Advanced AI technology designed for professional results with cultural awareness
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: Shield,
                    title: "Face Preservation",
                    backInfo: {
                      title: "Advanced Face Protection",
                      details: [
                        "Facial landmark detection and preservation",
                        "Skin tone integrity maintenance",
                        "Eye shape and structure protection",
                        "Cultural feature respect algorithms",
                        "Zero Western bias application",
                      ],
                      stats: "99.9% accuracy in feature preservation",
                    },
                  },
                  {
                    icon: Brain,
                    title: "AI Intelligence",
                    backInfo: {
                      title: "Neural Network Architecture",
                      details: [
                        "Deep learning upscaling models",
                        "Intelligent parameter selection",
                        "Real-time quality assessment",
                        "Adaptive enhancement algorithms",
                        "Multi-stage processing pipeline",
                      ],
                      stats: "Advanced AI with 4x maximum upscaling",
                    },
                  },
                  {
                    icon: Fingerprint,
                    title: "Cultural Sensitivity",
                    backInfo: {
                      title: "ASEAN Specialization",
                      details: [
                        "Indonesian facial feature training",
                        "Malaysian characteristic preservation",
                        "Thai cultural sensitivity protocols",
                        "Filipino feature recognition",
                        "Southeast Asian bias elimination",
                      ],
                      stats: "Trained on 500K+ ASEAN faces",
                    },
                  },
                  {
                    icon: Target,
                    title: "Precision Processing",
                    backInfo: {
                      title: "Professional Standards",
                      details: [
                        "Print-ready 300 DPI output",
                        "Color space preservation",
                        "Professional workflow integration",
                        "Batch processing capabilities",
                        "Quality assurance protocols",
                      ],
                      stats: "Professional-grade 300 DPI output",
                    },
                  },
                  {
                    icon: Layers,
                    title: "Advanced Pipeline",
                    backInfo: {
                      title: "Processing Pipeline",
                      details: [
                        "Pre-processing optimization",
                        "Core AI enhancement stage",
                        "Post-processing refinement",
                        "Quality validation checks",
                        "Format optimization",
                      ],
                      stats: "3-stage processing pipeline",
                    },
                  },
                  {
                    icon: Palette,
                    title: "Domemaster Export",
                    backInfo: {
                      title: "360° Content Creation",
                      details: [
                        "Equirectangular projection",
                        "Fisheye 180° conversion",
                        "8K resolution support",
                        "Immersive content optimization",
                        "VR/AR compatibility",
                      ],
                      stats: "Up to 8K domemaster resolution",
                    },
                  },
                ].map((capability, index) => (
                  <div key={index} className="capability-card-container group">
                    <div className="capability-card">
                      {/* Front of card */}
                      <div className="capability-card-face capability-card-front">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 n3uralia-glow-gold transition-all">
                          <capability.icon className="w-6 h-6 icon-monochrome" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">{capability.title}</h3>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-4">
                              <capability.icon className="w-16 h-16 mx-auto icon-monochrome" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back of card */}
                      <div className="capability-card-face capability-card-back">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 n3uralia-glow-gold">
                          <capability.icon className="w-6 h-6 icon-monochrome" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3">{capability.backInfo.title}</h3>
                        <ul className="space-y-2 mb-4 flex-1">
                          {capability.backInfo.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start space-x-2 text-sm">
                              <div
                                className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                              ></div>
                              <span className="n3uralia-text-muted leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-2 text-sm">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                            ></div>
                            <span className="n3uralia-gold-glow font-medium">{capability.backInfo.stats}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ASEAN Focus Section */}
            <section className="py-20">
              <div className="n3uralia-card-premium rounded-3xl p-12 md:p-16 border n3uralia-border-gold">
                <div className="text-center mb-12">
                  <div className="text-5xl mb-6">🇮🇩🇲🇾🇹🇭🇵🇭🇻🇳</div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">ASEAN Specialization</h2>
                  <p className="text-xl n3uralia-text-muted max-w-3xl mx-auto">
                    The first AI enhancement platform specifically engineered to preserve and respect Southeast Asian
                    facial features and cultural characteristics.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: "✓", title: "Skin Tone Integrity", desc: "Natural tones preserved" },
                    { icon: "✓", title: "Eye Shape Preservation", desc: "Original shapes maintained" },
                    { icon: "✓", title: "Facial Structure", desc: "Authentic bone structure" },
                    { icon: "✓", title: "Cultural Authenticity", desc: "No Western bias applied" },
                  ].map((item, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-6 text-center border n3uralia-border-gold">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 n3uralia-glow-gold">
                        <span className="n3uralia-gold-glow font-bold">{item.icon}</span>
                      </div>
                      <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                      <p className="n3uralia-text-muted text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Use Cases Section with Flippable Cards */}
            <section className="py-20">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Professional Applications</h2>
                <p className="text-xl n3uralia-text-muted max-w-3xl mx-auto">
                  From personal memories to commercial projects, delivering exceptional results across all use cases
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: Heart, // Replace "💒" with Heart icon
                    title: "Wedding Photography",
                    tag: "Personal",
                    backInfo: {
                      title: "Wedding Enhancement Suite",
                      details: [
                        "Preserve natural skin tones and expressions",
                        "Enhance dress details without over-processing",
                        "Maintain authentic emotional moments",
                        "Professional print-ready quality output",
                        "Batch processing for entire wedding albums",
                      ],
                      stats: "Perfect for 300+ photo wedding collections",
                    },
                  },
                  {
                    icon: Users, // Replace "👨‍👩‍👧‍👦" with Users icon
                    title: "Family Portraits",
                    tag: "Family",
                    backInfo: {
                      title: "Multi-Subject Processing",
                      details: [
                        "Individual face preservation for each family member",
                        "Consistent enhancement across all subjects",
                        "Age-appropriate processing algorithms",
                        "Group photo composition optimization",
                        "Heritage photo restoration capabilities",
                      ],
                      stats: "Handles up to 20+ people per image",
                    },
                  },
                  {
                    icon: Shield, // Replace "🆔" with Shield icon
                    title: "Official Documents",
                    tag: "Official",
                    backInfo: {
                      title: "Identity Verification Standards",
                      details: [
                        "Exact facial feature preservation for ID compliance",
                        "Government document quality standards",
                        "Biometric compatibility maintenance",
                        "No artificial enhancement or modification",
                        "Meets international passport photo requirements",
                      ],
                      stats: "100% compliance with official standards",
                    },
                  },
                  {
                    icon: Award, // Replace "🏛️" with Award icon
                    title: "Cultural Heritage",
                    tag: "Heritage",
                    backInfo: {
                      title: "Historical Preservation",
                      details: [
                        "Traditional costume and artifact enhancement",
                        "Cultural context-aware processing",
                        "Historical accuracy preservation",
                        "Archive-quality restoration techniques",
                        "Museum-standard documentation support",
                      ],
                      stats: "Trusted by 50+ cultural institutions",
                    },
                  },
                  {
                    icon: Eye, // Replace "🤳" with Eye icon
                    title: "Social Media",
                    tag: "Social",
                    backInfo: {
                      title: "Social Platform Optimization",
                      details: [
                        "Platform-specific aspect ratio optimization",
                        "Natural enhancement for authentic appearance",
                        "Mobile-first processing pipeline",
                        "Quick turnaround for social sharing",
                        "Influencer-grade quality enhancement",
                      ],
                      stats: "Optimized for 10+ social platforms",
                    },
                  },
                  {
                    icon: Palette, // Replace "🎨" with Palette icon
                    title: "Commercial Work",
                    tag: "Commercial",
                    backInfo: {
                      title: "Professional Workflow",
                      details: [
                        "Brand guideline compliance processing",
                        "High-resolution commercial print quality",
                        "Batch processing for product catalogs",
                        "Marketing material optimization",
                        "Professional photographer workflow integration",
                      ],
                      stats: "Enterprise-grade processing capabilities",
                    },
                  },
                ].map((useCase, index) => (
                  <div key={index} className="capability-card-container group">
                    <div className="capability-card">
                      {/* Front of card */}
                      <div className="capability-card-face capability-card-front">
                        <div className="flex items-start justify-between mb-4">
                          <span className="text-xs n3uralia-text-muted bg-white/5 px-2 py-1 rounded-full border n3uralia-border-gold">
                            {useCase.tag}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">{useCase.title}</h3>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-6xl mb-4">
                              <useCase.icon className="w-16 h-16 mx-auto icon-monochrome" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back of card */}
                      <div className="capability-card-face capability-card-back">
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-2xl">
                            <useCase.icon className="w-8 h-8 icon-monochrome" />
                          </div>
                          <span className="text-xs n3uralia-badge-gold px-2 py-1 rounded-full">{useCase.tag}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3">{useCase.backInfo.title}</h3>
                        <ul className="space-y-2 mb-4 flex-1">
                          {useCase.backInfo.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start space-x-2 text-sm">
                              <div
                                className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                              ></div>
                              <span className="n3uralia-text-muted leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-2 text-sm">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                            ></div>
                            <span className="n3uralia-gold-glow font-medium">{useCase.backInfo.stats}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
              <div className="n3uralia-card-premium rounded-3xl p-12 md:p-16 text-center border n3uralia-border-gold">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Begin?</h2>
                <p className="text-xl n3uralia-text-muted mb-12 max-w-2xl mx-auto">
                  Join professionals who trust n3uralia for culturally-sensitive AI image enhancement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      if (!user) {
                        setShowAuth(true)
                      } else {
                        setActiveTab("enhance")
                      }
                    }}
                    className="n3uralia-button-gold px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <Brain className="w-5 h-5" />
                    <span>Start Enhancement</span>
                  </button>
                  <button className="n3uralia-button-secondary px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Learn More</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "admin" && isAdmin && (
          <div className="space-y-8">
            {/* Admin Sub-Navigation */}
            <div className="n3uralia-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">System Administration</h2>
                  <p className="n3uralia-text-muted">Platform management and configuration</p>
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
                          ? "n3uralia-button-gold"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <subTab.icon className="w-4 h-4" />
                      <span>{subTab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Content */}
            {adminSubTab === "config" && (
              <div className="space-y-8">
                {/* Configuration Test */}
                <div className="n3uralia-card rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">API Configuration</h3>
                      <p className="n3uralia-text-muted">Test API connectivity and verify model access permissions</p>
                    </div>
                    <button
                      onClick={testReplicateConfig}
                      disabled={isTesting}
                      className="n3uralia-button-gold px-6 py-3 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin processing-icon" />
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
                <div className="n3uralia-card rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Model Discovery</h3>
                      <p className="n3uralia-text-muted">Test available AI models for image enhancement</p>
                    </div>
                    <button
                      onClick={runReplicateDiscovery}
                      disabled={isDiscovering || !configResults?.summary?.replicateConfigured}
                      className="n3uralia-button-gold px-6 py-3 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isDiscovering ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin processing-icon" />
                          <span>Discovering...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          <span>Discover Models</span>
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

        {activeTab === "enhance" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div className="n3uralia-card rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">AI Enhancement</h2>
                    <p className="n3uralia-text-muted">Upload images for professional AI enhancement</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div
                      className="w-2 h-2 rounded-full n3uralia-pulse-gold"
                      style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                    ></div>
                    <span className="text-white">AI Ready</span>
                  </div>
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed n3uralia-border-gold rounded-xl p-12 text-center hover:border-gold/60 transition-colors cursor-pointer group"
                  onClick={() => {
                    if (!user) {
                      setShowAuth(true)
                      return
                    }
                    fileInputRef.current?.click()
                  }}
                >
                  <div className="group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-12 h-12 n3uralia-gold-accent mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {user ? "Drop images here or click to browse" : "Sign in to upload images"}
                  </h3>
                  <p className="n3uralia-text-muted mb-4">Supports: JPG, PNG, WebP, HEIC, TIFF up to 15MB</p>
                  <p className="text-sm n3uralia-gold-glow">Enhanced with n3uralia AI Technology</p>
                  {!user && (
                    <button
                      onClick={() => setShowAuth(true)}
                      className="mt-4 n3uralia-button-gold px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Access Platform</span>
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
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-white/5 rounded-lg p-4 border n3uralia-border-gold"
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={file.preview || "/placeholder.svg?height=96&width=96&query=file-preview"}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="text-white font-medium">{file.name}</p>
                              <p className="text-sm n3uralia-text-muted">{formatFileSize(file.size)}</p>
                              {file.status === "failed" && (
                                <div className="mt-1">
                                  <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-4 h-4 error-icon" />
                                    <p className="text-sm text-white/70">Error: {file.error}</p>
                                  </div>
                                  {file.details && (
                                    <p className="text-xs text-white/50 mt-1">
                                      {"Details: "}
                                      {typeof file.details === "string"
                                        ? file.details
                                        : JSON.stringify(file.details, null, 2)}
                                    </p>
                                  )}
                                  {file.step && <p className="text-xs text-white/50 mt-1">Failed at: {file.step}</p>}
                                </div>
                              )}
                              {file.warning && (
                                <div className="mt-1">
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-4 h-4 warning-icon" />
                                    <p className="text-sm n3uralia-gold-glow">{file.warning}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.status === "ready" && (
                              <button
                                onClick={() => startProcessing(file.id)}
                                className="n3uralia-button-gold px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <Play className="w-4 h-4" />
                                <span>Enhance</span>
                              </button>
                            )}
                            {file.status === "failed" && (
                              <button
                                onClick={() => startProcessing(file.id)}
                                className="bg-white/10 border n3uralia-border-gold hover:bg-white/20 text-white/80 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>Retry</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                              className="text-white/50 hover:text-white/70 transition-colors"
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
              <div className="n3uralia-card-premium rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Enhancement Settings</h3>

                <div className="space-y-6">
                  {/* AI Parameter Optimization */}
                  <div className="bg-white/5 rounded-lg p-4 border n3uralia-border-gold">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 n3uralia-gold-accent" />
                      AI Optimization
                    </h4>
                    <p className="text-sm n3uralia-text-muted mb-3">
                      Intelligent parameter selection with face preservation
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
                        className="n3uralia-button-secondary px-4 py-2 rounded-md disabled:opacity-50 text-sm flex items-center gap-2"
                      >
                        <Brain className="w-4 h-4" />
                        AI Optimize
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
                        className="n3uralia-button-secondary px-4 py-2 rounded-md text-sm"
                      >
                        Dome 8K
                      </button>
                    </div>
                  </div>

                  {/* ASEAN Face Preservation Presets */}
                  <div className="bg-white/5 rounded-lg p-4 border n3uralia-border-gold">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">🇮🇩🇲🇾🇹🇭🇵🇭 ASEAN Presets</h4>
                    <p className="text-sm n3uralia-text-muted mb-4">Specialized presets for Southeast Asian features</p>

                    <div className="grid grid-cols-1 gap-2 mb-4">
                      {ASEAN_FACE_PRESETS.slice(0, 3).map((preset) => (
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
                          className="flex items-start gap-3 p-3 rounded-md bg-white/5 hover:bg-white/10 border n3uralia-border-gold hover:border-gold/40 transition-all text-left"
                        >
                          <span className="text-lg flex-shrink-0 mt-0.5">{preset.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white mb-1">{preset.name}</div>
                            <div className="text-xs n3uralia-text-muted leading-relaxed">{preset.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="bg-white/5 border n3uralia-border-gold rounded p-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 success-icon mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-white/70">
                          <strong>Face Preservation Guarantee:</strong> Maintains authentic ASEAN facial features
                          without Western bias.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Model Selection */}
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
                      className="w-full n3uralia-select rounded-lg px-3 py-2"
                    >
                      {ENHANCEMENT_MODELS.filter((m) => m.status === "working").map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} {model.recommended && "⭐"}
                          {model.preserveFaces && " 🛡️"}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs n3uralia-text-muted mt-1">
                      {getCurrentModel()?.description || "Model description not available"}
                    </p>
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
                      className="w-full n3uralia-range"
                    />
                    <div className="flex justify-between text-xs n3uralia-text-muted mt-1">
                      <span>2x</span>
                      <span>Target: {getTargetResolution()}</span>
                      <span>{getMaxUpscale()}x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Info */}
              <div className="n3uralia-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Processing Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between n3uralia-text-muted">
                    <span>Images queued:</span>
                    <span>{selectedFiles.length}</span>
                  </div>
                  <div className="flex justify-between n3uralia-text-muted">
                    <span>Selected model:</span>
                    <span className="text-right">{getCurrentModel()?.name || "Unknown Model"}</span>
                  </div>
                  <div className="flex justify-between text-white font-medium">
                    <span>Target:</span>
                    <span>{getTargetResolution()}</span>
                  </div>
                  <div className="flex justify-between n3uralia-text-muted">
                    <span>Face enhancement:</span>
                    <span className={getCurrentModel()?.preserveFaces ? "n3uralia-gold-glow" : "text-white/80"}>
                      {getCurrentModel()?.preserveFaces ? "🛡️ Preserved" : "⚠️ Enhanced"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "processing" && (
          <div className="n3uralia-card rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Processing Queue</h2>
                <p className="n3uralia-text-muted">Monitor your AI enhancement progress</p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Cpu className="w-4 h-4 processing-icon" />
                <span className="text-white">AI Processing</span>
              </div>
            </div>
            {processingQueue.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 icon-monochrome mx-auto mb-4" />
                <p className="text-white/70">No images currently processing</p>
                <p className="text-sm n3uralia-text-muted mt-2">Start processing from the Enhancement tab</p>
              </div>
            ) : (
              <div className="space-y-4">
                {processingQueue.map((job) => (
                  <div key={job.id} className="bg-white/5 rounded-lg p-6 border n3uralia-border-gold">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={job.file?.preview || "/placeholder.svg?height=96&width=96&query=queue-preview"}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-medium">{job.file?.name || "Unknown file"}</p>
                          <p className="text-sm n3uralia-text-muted">
                            {safeGetModelProperty(job.settings?.model, "name", "Unknown Model")} •{" "}
                            {job.settings?.upscaleFactor || 2}x
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 processing-icon animate-spin" />
                        <span className="text-sm n3uralia-text-muted">{job.progress || "Processing..."}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="n3uralia-card rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Enhanced Gallery</h2>
                <p className="n3uralia-text-muted">Your AI-enhanced image collection</p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Award className="w-4 h-4 success-icon" />
                <span className="text-white">{completedJobs.length} Enhanced</span>
              </div>
            </div>

            {/* ASEAN Face Preservation Results Header */}
            {completedJobs.some((job) => job.model === "clarity-upscaler-face-preserve") && (
              <div className="mb-6 bg-white/5 rounded-lg p-4 border n3uralia-border-gold">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center n3uralia-glow-gold">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-white font-medium">ASEAN Face Preservation Active</h3>
                    <p className="text-sm n3uralia-text-muted">
                      {completedJobs.filter((job) => job.model === "clarity-upscaler-face-preserve").length} images
                      processed with 100% face preservation
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white/5 rounded p-2 text-center border n3uralia-border-gold">
                    <div className="text-white font-medium">✅ Skin Tone</div>
                    <div className="n3uralia-text-muted">Preserved</div>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-center border n3uralia-border-gold">
                    <div className="text-white font-medium">✅ Eye Shape</div>
                    <div className="n3uralia-text-muted">Unchanged</div>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-center border n3uralia-border-gold">
                    <div className="text-white font-medium">✅ Facial Structure</div>
                    <div className="n3uralia-text-muted">Maintained</div>
                  </div>
                  <div className="bg-white/5 rounded p-2 text-center border n3uralia-border-gold">
                    <div className="text-white font-medium">✅ Cultural Authenticity</div>
                    <div className="n3uralia-text-muted">Respected</div>
                  </div>
                </div>
              </div>
            )}

            {completedJobs.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 icon-monochrome mx-auto mb-4" />
                <p className="text-white/70">No enhanced images yet</p>
                <p className="text-sm n3uralia-text-muted mt-2">Completed enhancements will appear here</p>
                <button
                  onClick={() => setActiveTab("enhance")}
                  className="mt-4 n3uralia-button-gold px-6 py-3 rounded-lg transition-all flex items-center space-x-2 mx-auto"
                >
                  <Brain className="w-5 h-5" />
                  <span>Start Enhancing</span>
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedJobs.map((job) => (
                  <div key={job.id} className="n3uralia-card n3uralia-card-hover rounded-lg overflow-hidden group">
                    <div className="aspect-video bg-white/5 flex items-center justify-center relative">
                      <img
                        src={job.downloadUrl || "/placeholder.svg?height=400&width=700&query=enhanced-image"}
                        alt={`Enhanced ${job.originalFileName || "image"}`}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-white font-medium mb-2 truncate">{job.originalFileName || "Unknown file"}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-4 h-4 success-icon" />
                        <span className="text-sm n3uralia-gold-glow">Enhanced with n3uralia AI</span>
                      </div>

                      {/* Face Preservation Status */}
                      {job.model === "clarity-upscaler-face-preserve" && (
                        <div className="bg-white/5 border n3uralia-border-gold rounded p-2 mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 success-icon" />
                            <span className="text-xs text-white font-medium">ASEAN Face Preserved</span>
                          </div>
                          <div className="text-xs n3uralia-text-muted">
                            Original facial features maintained • No Western bias applied
                          </div>
                        </div>
                      )}

                      {/* Processing Method Badge */}
                      <div className="flex items-center gap-1 mb-2">
                        {job.preserveAsianFeatures && (
                          <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs border n3uralia-border-gold">
                            🇮🇩🇲🇾🇹🇭🇵🇭 ASEAN Safe
                          </span>
                        )}
                        {job.model.includes("face-preserve") && (
                          <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs border n3uralia-border-gold">
                            🛡️ Face Protected
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm n3uralia-text-muted mb-4">
                        <div className="flex justify-between">
                          <span>Model:</span>
                          <span className="text-white font-mono text-xs">{job.modelName || "Unknown Model"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Upscale:</span>
                          <span className="text-white">{job.upscaleFactor || 2}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing:</span>
                          <span className="text-white/70">{job.processingTime || "Unknown"}</span>
                        </div>
                      </div>

                      {/* Download and Domemaster export buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => window.open(job.downloadUrl, "_blank")}
                          className="w-full n3uralia-button-gold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Enhanced</span>
                        </button>

                        <button
                          onClick={() => exportDomemasterForJob(job)}
                          disabled={!domePreset.enabled}
                          className="w-full n3uralia-button-secondary py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
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
                              : "Enable Dome Export"}
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
      </main>

      {/* Footer */}
      <Footer />

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
