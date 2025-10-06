"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageComparisonSlider } from "@/components/image-comparison-slider"
import Footer from "@/components/footer"
import {
  Sparkles,
  Zap,
  Shield,
  Palette,
  Users,
  Trophy,
  Camera,
  Brush,
  Heart,
  Building,
  ImageIcon,
  Star,
  ArrowRight,
  CheckCircle2,
  Brain,
  Globe,
  Settings,
  Download,
  Loader2,
  CheckCircle,
  X,
  RefreshCw,
  Search,
  TestTube,
  LogIn,
  Cpu,
  Eye,
  Layers,
  Target,
  UploadCloud,
} from "lucide-react"

// Import auth components from updates
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { UserMenu } from "@/components/auth/user-menu"
import { ProfileDialog } from "@/components/auth/profile-dialog"

// Import admin components from updates
import { UserManagement } from "@/components/admin/user-management"
import { RoleManagement } from "@/components/admin/role-management"

// Import utils from updates
import { preProcessImage, postProcessImage, type EnhancementToggles } from "@/utils/image-processing"
import { generateDomemaster, type DomemasterOptions } from "@/utils/domemaster"

// Define enhancement models - Updated with face-preserving options from updates
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

// Define interfaces from updates
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

// Rename component from LandingPage to AIImageEnhancementPortal
const AIImageEnhancementPortal = () => {
  // Authentication state from updates
  const [user, setUser] = useState<any>(null)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [showAuth, setShowAuth] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Existing state
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({})
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])
  const [processingQueue, setProcessingQueue] = useState<ProcessingJob[]>([])
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([])
  const [activeTab, setActiveTab] = useState("home")
  const [adminSubTab, setAdminSubTab] = useState("config")
  const [discoveryResults, setDiscoveryResults] = useState<any>(null)
  const [configResults, setConfigResults] = useState<any>(null)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  // Enhancement Settings with safe defaults - Face Preserving as default from updates
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

  // ASEAN Face Preservation Presets from updates
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

  // NUEVO: estado del preset domemaster from updates
  const [domePreset, setDomePreset] = useState<DomePresetState>({
    enabled: false,
    size: 8192,
    bleedPercent: 3,
    overlay: false,
    projection: "equidistant",
  })

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const toggleCard = (cardId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }))
  }

  // Helper functions with complete safety from updates
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

  // Check for existing session on mount from updates
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
    localStorage.setItem("ai-enhancer-user", JSON.JSON.stringify(updatedUser))
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
        const img = new window.Image()
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

      // Update file type and name based on potential pre-processing result
      const finalUploadFileName = processedFile.name.replace(/\.\w+$/, "") + ".jpg"
      const uploadFile = new File([uploadBlob], finalUploadFileName, {
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

  // AI-powered parameter optimization based on image analysis from updates
  const optimizeParametersWithAI = async (file: File) => {
    try {
      // Analyze image characteristics
      const img = new window.Image()
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

  // Replace color-based status indicators with monochrome from updates
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

  // Show authentication modal if not logged in from updates
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
      {/* Header from updates */}
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

      {/* Navigation from updates */}
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

      {/* Main Content from updates */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {activeTab === "home" && (
          <div className="space-y-32">
            {/* Hero Section - Enhanced with Interactive Comparison Slider from updates */}
            <section className="relative py-20 md:py-32">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center space-x-2 n3uralia-card px-4 py-2 rounded-full mb-8">
                    <div
                      className="w-2 h-2 rounded-full n3uralia-pulse-gold"
                      style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                    ></div>
                    <span className="text-sm n3uralia-text-muted">AI-Powered Enhancement</span>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    ASEAN Face
                    <br />
                    <span className="n3uralia-gold-accent">Preservation</span>
                    <br />& Abstract Art
                  </h1>

                  <p className="text-xl n3uralia-text-muted mb-8 leading-relaxed">
                    Specialized AI enhancement for Southeast Asian portraits and abstract artwork. Preserve authentic
                    facial features and artistic expression with zero Western bias.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
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
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>Try For Free</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => document.getElementById("examples")?.scrollIntoView({ behavior: "smooth" })}
                      className="n3uralia-button-secondary px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-5 h-5" />
                      <span>View Examples</span>
                    </button>
                  </div>

                  <div className="mt-12 flex items-center gap-8 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">500K+</div>
                      <div className="n3uralia-text-muted">ASEAN Faces</div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">100%</div>
                      <div className="n3uralia-text-muted">Feature Preserved</div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">2 Core</div>
                      <div className="n3uralia-text-muted">Specializations</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Before/After Comparison Slider */}
                <div className="relative">
                  <ImageComparisonSlider
                    beforeImage="/images/wedding-before.png"
                    afterImage="/images/wedding-after.png"
                    beforeLabel="Original"
                    afterLabel="4x Enhanced"
                    className="shadow-2xl ring-1 ring-gold-300/20"
                  />
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/70">
                    <CheckCircle className="w-4 h-4 n3uralia-gold-accent" />
                    <span>🇮🇩 Indonesian Wedding • Face Preserved • 4x Enhancement</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Capabilities Section (modified for new component structure) */}
            <section id="features" className="relative py-16 md:py-24 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-4 mb-12">
                  <Badge className="n3uralia-badge-gold mb-2">
                    <Star className="w-4 h-4 mr-2" />
                    Core Capabilities
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Specialized AI Enhancement for{" "}
                    <span className="bg-gradient-to-r from-gold-300 to-gold-500 text-transparent bg-clip-text">
                      Cultural Authenticity
                    </span>
                  </h2>
                  <p className="text-lg n3uralia-text-muted max-w-2xl mx-auto">
                    Two core specializations: ASEAN face preservation and abstract art enhancement
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      id: "faces",
                      icon: Users,
                      title: "ASEAN Face Preservation",
                      front: "Ultra-safe enhancement designed for Southeast Asian facial features",
                      back: "Trained on 500K+ Indonesian, Malaysian, Thai, Filipino, and Vietnamese faces. Preserves authentic features including skin tone, eye shape, nose structure, and facial proportions without Western bias.",
                    },
                    {
                      id: "abstract",
                      icon: Palette,
                      title: "Abstract Art Enhancement",
                      front: "Specialized enhancement for abstract and artistic imagery",
                      back: "Preserves artistic intent while enhancing texture, color depth, and detail. Perfect for digital paintings, mixed media, and abstract compositions.",
                    },
                    {
                      id: "wedding",
                      icon: Heart,
                      title: "Wedding Photography",
                      front: "Perfect for Southeast Asian wedding and portrait photography",
                      back: "Enhance traditional wedding attire details, jewelry, and fabric textures while maintaining natural skin tones and facial authenticity across diverse ASEAN cultures.",
                    },
                    {
                      id: "quality",
                      icon: Sparkles,
                      title: "4x Super Resolution",
                      front: "Increase resolution up to 4x while maintaining quality",
                      back: "Advanced AI upscaling that enhances fine details, reduces noise, and sharpens images without introducing artifacts. Optimized for both portraits and abstract art.",
                    },
                  ].map((capability) => (
                    <Card
                      key={capability.id}
                      className="relative h-64 cursor-pointer transition-all duration-500 hover:shadow-gold-lg"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: flippedCards[capability.id] ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                      onClick={() => toggleCard(capability.id)}
                    >
                      {/* Front of card */}
                      <CardContent
                        className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center space-y-4 rounded-lg"
                        style={{
                          backfaceVisibility: "hidden",
                          background:
                            "linear-gradient(135deg, rgba(218, 165, 32, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)",
                        }}
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center shadow-gold-md">
                          <capability.icon className="w-8 h-8 text-black" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{capability.title}</h3>
                        <p className="text-gray-300">{capability.front}</p>
                        <span className="text-xs text-gold-300">Click to learn more</span>
                      </CardContent>

                      {/* Back of card */}
                      <CardContent
                        className="absolute inset-0 p-6 flex flex-col justify-center text-center space-y-4 rounded-lg"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          background:
                            "linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(218, 165, 32, 0.05) 100%)",
                        }}
                      >
                        <p className="text-sm text-gray-300">{capability.back}</p>
                        <span className="text-xs text-gold-400">Click to return</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* ASEAN Focus Section (modified for new component structure) */}
            <section id="examples" className="container py-16 md:py-24">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <Badge className="n3uralia-badge-gold">
                    <Globe className="w-4 h-4 mr-2" />
                    Built for Southeast Asia
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Celebrating{" "}
                    <span className="bg-gradient-to-r from-gold-300 to-gold-500 text-transparent bg-clip-text">
                      ASEAN Beauty
                    </span>
                  </h2>
                  <p className="text-lg n3uralia-text-muted">
                    Unlike generic AI models trained primarily on Western faces, n3uralia is specifically designed to
                    understand and preserve the unique beauty of Southeast Asian features.
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        country: "🇮🇩 Indonesia",
                        features: "Preserves warm skin tones, almond eyes, traditional makeup",
                      },
                      {
                        country: "🇲🇾 Malaysia",
                        features: "Maintains diverse ethnic features, natural complexions",
                      },
                      {
                        country: "🇹🇭 Thailand",
                        features: "Enhances traditional styling, golden hour skin tones",
                      },
                      {
                        country: "🇵🇭 Philippines",
                        features: "Respects unique facial structure, warm undertones",
                      },
                      {
                        country: "🇻🇳 Vietnam",
                        features: "Preserves delicate features, natural beauty",
                      },
                    ].map((item) => (
                      <div
                        key={item.country}
                        className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-gold-200/20"
                      >
                        <CheckCircle2 className="w-5 h-5 n3uralia-gold-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-white">{item.country}</div>
                          <div className="text-sm n3uralia-text-muted">{item.features}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Updated comparison sliders - two before/after sets */}
                <div className="space-y-6">
                  {/* First comparison: Modern Indonesian Wedding */}
                  <div>
                    <ImageComparisonSlider
                      beforeImage="/images/wedding-before.png"
                      afterImage="/images/wedding-after.png"
                      beforeLabel="Original"
                      afterLabel="4x Enhanced"
                      className="shadow-2xl ring-1 ring-gold-300/20"
                    />
                    <div className="mt-3 text-center">
                      <p className="text-sm text-white/90 font-medium">🇮🇩 Modern Indonesian Wedding</p>
                      <p className="text-xs text-white/60 mt-1">4x Enhancement • Face Preserved • Traditional Attire</p>
                    </div>
                  </div>

                  {/* Second comparison: Vintage Heritage Wedding */}
                  <div>
                    <ImageComparisonSlider
                      beforeImage="/images/vintage-wedding-blur.png"
                      afterImage="/images/vintage-wedding-clear.jpg"
                      beforeLabel="Heritage Photo"
                      afterLabel="Restored"
                      className="shadow-2xl ring-1 ring-gold-300/20"
                    />
                    <div className="mt-3 text-center">
                      <p className="text-sm text-white/90 font-medium">🏛️ Vintage ASEAN Wedding Heritage</p>
                      <p className="text-xs text-white/60 mt-1">Restoration • Cultural Preservation • Authentic Features</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Professional Applications (modified for new component structure) */}
            <section id="applications" className="container py-16 md:py-24 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-4 mb-12">
                  <Badge className="n3uralia-badge-gold mb-2">
                    <Trophy className="w-4 h-4 mr-2" />
                    Professional Applications
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Trusted by{" "}
                    <span className="bg-gradient-to-r from-gold-300 to-gold-500 text-transparent bg-clip-text">
                      Creative Professionals
                    </span>
                  </h2>
                  <p className="text-lg n3uralia-text-muted max-w-2xl mx-auto">
                    From wedding photographers to digital artists, n3uralia delivers professional-grade enhancements
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      id: "wedding-photo",
                      icon: Camera,
                      title: "Wedding Photography",
                      front: "Enhance traditional wedding portraits and ceremonies",
                      back: "Perfect for Indonesian kebaya, Malaysian baju kurung, Thai traditional dress, and Filipino barong. Preserves intricate fabric details and cultural authenticity.",
                      color: "from-gold-300 to-gold-500",
                    },
                    {
                      id: "family",
                      icon: Users,
                      title: "Family Portraits",
                      front: "Restore and enhance precious family memories",
                      back: "Bring old family photos back to life while maintaining authentic ASEAN features across generations. Perfect for multigenerational portraits.",
                      color: "from-gold-400 to-amber-500",
                    },
                    {
                      id: "abstract",
                      icon: Brush,
                      title: "Abstract Art",
                      front: "Elevate digital paintings and mixed media",
                      back: "Enhance texture, depth, and color vibrancy in abstract artwork while preserving artistic intent. Ideal for contemporary Southeast Asian artists.",
                      color: "from-amber-400 to-gold-500",
                    },
                    {
                      id: "commercial",
                      icon: Building,
                      title: "Commercial Photography",
                      front: "Professional enhancement for marketing materials",
                      back: "Enhance product photography, corporate headshots, and promotional materials with authentic ASEAN representation.",
                      color: "from-gold-300 to-yellow-500",
                    },
                    {
                      id: "heritage",
                      icon: Shield,
                      title: "Cultural Heritage",
                      front: "Preserve historical and cultural documentation",
                      back: "Restore and enhance archival photos of cultural ceremonies, traditional practices, and historical moments with respect for authenticity.",
                      color: "from-yellow-500 to-gold-400",
                    },
                    {
                      id: "digital-art",
                      icon: Palette,
                      title: "Digital Art Creation",
                      front: "Upscale artwork for print and display",
                      back: "Prepare digital art for large format printing and exhibition with AI-powered super resolution that maintains artistic quality.",
                      color: "from-gold-500 to-amber-400",
                    },
                  ].map((app) => (
                    <Card
                      key={app.id}
                      className="relative h-72 cursor-pointer transition-all duration-500 hover:shadow-gold-lg group"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: flippedCards[app.id] ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                      onClick={() => toggleCard(app.id)}
                    >
                      {/* Front of card */}
                      <CardContent
                        className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center space-y-4 rounded-lg"
                        style={{
                          backfaceVisibility: "hidden",
                          background: `linear-gradient(135deg, rgba(218, 165, 32, 0.1) 0%, ${
                            app.color.includes("amber")
                              ? "rgba(255, 165, 0, 0.1)"
                              : app.color.includes("yellow")
                                ? "rgba(255, 255, 0, 0.1)"
                                : "rgba(255, 193, 7, 0.1)"
                          } 100%)`,
                        }}
                      >
                        <div
                          className={`w-16 h-16 rounded-full bg-gradient-to-br ${app.color} flex items-center justify-center shadow-gold-md group-hover:animate-gold-pulse`}
                        >
                          <app.icon className="w-8 h-8 text-black transition-transform group-hover:scale-110" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{app.title}</h3>
                        <p className="text-gray-300">{app.front}</p>
                        <span className="text-xs text-gold-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to learn more
                        </span>
                      </CardContent>

                      {/* Back of card */}
                      <CardContent
                        className="absolute inset-0 p-6 flex flex-col justify-center text-center space-y-4 rounded-lg"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          background: `linear-gradient(135deg, rgba(218, 165, 32, 0.05) 0%, ${
                            app.color.includes("amber")
                              ? "rgba(255, 165, 0, 0.05)"
                              : app.color.includes("yellow")
                                ? "rgba(255, 255, 0, 0.05)"
                                : "rgba(255, 193, 7, 0.05)"
                          } 100%)`,
                        }}
                      >
                        <p className="text-sm text-gray-300">{app.back}</p>
                        <span className="text-xs text-gold-400">Click to return</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Call to Action (modified for new component structure) */}
            <section className="container py-16 md:py-24">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-300/10 via-gold-400/10 to-gold-500/10 animate-gold-shimmer"></div>
                <CardContent className="relative p-12 text-center space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Enhance Your Images?</h2>
                  <p className="text-lg n3uralia-text-muted max-w-2xl mx-auto">
                    Start enhancing your ASEAN portraits and abstract art with AI-powered precision. No signup required,
                    completely free to use.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/enhance">
                      <Button
                        size="lg"
                        className="n3uralia-button-gold text-lg h-14 px-8 shadow-gold-lg hover:shadow-gold-xl"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Start Enhancing Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-center gap-8 text-sm pt-4">
                    <div className="flex items-center gap-2 n3uralia-text-muted">
                      <Shield className="w-5 h-5 n3uralia-gold-accent" />
                      <span>100% Free</span>
                    </div>
                    <div className="flex items-center gap-2 n3uralia-text-muted">
                      <Sparkles className="w-5 h-5 n3uralia-gold-accent" />
                      <span>No Watermarks</span>
                    </div>
                    <div className="flex items-center gap-2 n3uralia-text-muted">
                      <Users className="w-5 h-5 n3uralia-gold-accent" />
                      <span>Cultural Authenticity</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {/* Enhance Tab Content */}
        {activeTab === "enhance" && (
          <section className="space-y-12">
            {/* Add the enhance tab content here based on the updates, e.g., file uploads, settings */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Image Upload Area */}
              <div
                className="col-span-2 n3uralia-card rounded-xl p-8 flex flex-col items-center justify-center border-2 border-dashed border-white/20 cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                />
                <UploadCloud className="w-12 h-12 n3uralia-gold-accent mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Drag & Drop Your Images Here</h3>
                <p className="n3uralia-text-muted mb-4">Or click to select files</p>
                <p className="n3uralia-text-muted text-sm">Supports JPEG, PNG, WEBP. Max file size: 15MB</p>
              </div>

              {/* Enhancement Settings Panel */}
              <div className="n3uralia-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Enhancement Settings</h3>
                <div className="space-y-4">
                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium n3uralia-text-muted mb-2">AI Model</label>
                    <select
                      value={enhancementSettings.model}
                      onChange={(e) => {
                        setEnhancementSettings((prev) => ({
                          ...prev,
                          model: e.target.value,
                          // Reset faceEnhance if model doesn't support it, or based on new model
                          faceEnhance:
                            ENHANCEMENT_MODELS.find((m) => m.id === e.target.value)?.faceEnhancement || false,
                        }))
                      }}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      {ENHANCEMENT_MODELS.map((model) => (
                        <option key={model.id} value={model.id} disabled={model.status !== "working"}>
                          {model.name} {model.status !== "working" ? "(Unavailable)" : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs n3uralia-text-muted mt-1">
                      {ENHANCEMENT_MODELS.find((m) => m.id === enhancementSettings.model)?.description}
                    </p>
                  </div>

                  {/* Upscale Factor */}
                  <div>
                    <label className="block text-sm font-medium n3uralia-text-muted mb-2">Upscale Factor</label>
                    <input
                      type="range"
                      min="1"
                      max={getMaxUpscale()}
                      value={enhancementSettings.upscaleFactor}
                      onChange={(e) =>
                        setEnhancementSettings((prev) => ({
                          ...prev,
                          upscaleFactor: Number.parseInt(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs n3uralia-text-muted">
                      <span>1x</span>
                      <span>{getMaxUpscale()}x</span>
                    </div>
                    <p className="text-xs n3uralia-text-muted mt-1">
                      Target Resolution: <span className="font-semibold text-white">{getTargetResolution()}</span>
                    </p>
                  </div>

                  {/* Preserve Asian Features */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="preserveAsianFeatures"
                      checked={enhancementSettings.preserveAsianFeatures}
                      onChange={(e) =>
                        setEnhancementSettings((prev) => ({ ...prev, preserveAsianFeatures: e.target.checked }))
                      }
                      className="w-5 h-5 accent-gold-500 rounded border-white/30 bg-white/10 focus:ring-gold-500"
                    />
                    <label htmlFor="preserveAsianFeatures" className="text-sm text-white font-medium">
                      Preserve ASEAN Face Features (Recommended)
                    </label>
                  </div>

                  {/* Face Enhance Toggle (conditional) */}
                  {!getCurrentModel()?.preserveFaces && (
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="faceEnhance"
                        checked={enhancementSettings.faceEnhance}
                        onChange={(e) =>
                          setEnhancementSettings((prev) => ({ ...prev, faceEnhance: e.target.checked }))
                        }
                        className="w-5 h-5 accent-gold-500 rounded border-white/30 bg-white/10 focus:ring-gold-500"
                      />
                      <label htmlFor="faceEnhance" className="text-sm text-white font-medium">
                        Face Enhancement
                      </label>
                    </div>
                  )}

                  {/* Target Use */}
                  <div>
                    <label className="block text-sm font-medium n3uralia-text-muted mb-2">Target Use</label>
                    <select
                      value={enhancementSettings.targetUse}
                      onChange={(e) => setEnhancementSettings((prev) => ({ ...prev, targetUse: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="display">Display (Web/Screen)</option>
                      <option value="print">Print</option>
                      <option value="social">Social Media</option>
                      <option value="document">Document</option>
                      <option value="archive">Archive</option>
                    </select>
                  </div>

                  {/* Format */}
                  <div>
                    <label className="block text-sm font-medium n3uralia-text-muted mb-2">Format</label>
                    <select
                      value={enhancementSettings.format}
                      onChange={(e) => setEnhancementSettings((prev) => ({ ...prev, format: e.target.value }))}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="PNG">PNG</option>
                      <option value="JPEG">JPEG</option>
                      <option value="WEBP">WEBP</option>
                    </select>
                  </div>

                  {/* Quality Slider (for JPEG/WEBP) */}
                  {enhancementSettings.format !== "PNG" && (
                    <div>
                      <label className="block text-sm font-medium n3uralia-text-muted mb-2">
                        Quality ({enhancementSettings.quality}%)
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={enhancementSettings.quality}
                        onChange={(e) =>
                          setEnhancementSettings((prev) => ({ ...prev, quality: Number.parseInt(e.target.value) }))
                        }
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Pre-processing Options */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-white mb-3">Pre-processing</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium n3uralia-text-muted mb-1">Deblock</label>
                        <select
                          value={enhancementSettings.pre.deblock}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              pre: { ...prev.pre, deblock: e.target.value },
                            }))
                          }
                          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none"
                        >
                          <option value="off">Off</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium n3uralia-text-muted mb-1">Denoise</label>
                        <select
                          value={enhancementSettings.pre.denoise}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              pre: { ...prev.pre, denoise: e.target.value },
                            }))
                          }
                          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none"
                        >
                          <option value="off">Off</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium n3uralia-text-muted mb-1">White Balance</label>
                        <select
                          value={enhancementSettings.pre.whiteBalance}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              pre: { ...prev.pre, whiteBalance: e.target.value },
                            }))
                          }
                          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none"
                        >
                          <option value="off">Off</option>
                          <option value="auto">Auto</option>
                          <option value="neutral">Neutral</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Post-processing Options */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-white mb-3">Post-processing</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium n3uralia-text-muted mb-1">Local Contrast</label>
                        <select
                          value={enhancementSettings.post.localContrast}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              post: { ...prev.post, localContrast: e.target.value },
                            }))
                          }
                          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none"
                        >
                          <option value="off">Off</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium n3uralia-text-muted mb-1">Sharpen</label>
                        <select
                          value={enhancementSettings.post.sharpen}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              post: { ...prev.post, sharpen: e.target.value },
                            }))
                          }
                          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none"
                        >
                          <option value="off">Off</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium n3uralia-text-muted mb-1">Grain</label>
                        <select
                          value={enhancementSettings.post.grain}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({
                              ...prev,
                              post: { ...prev.post, grain: e.target.value },
                            }))
                          }
                          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none"
                        >
                          <option value="off">Off</option>
                          <option value="very-low">Very Low</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (selectedFiles.length === 0) return
                    // AI optimization logic
                    const firstFile = selectedFiles[0].file
                    const optimized = await optimizeParametersWithAI(firstFile)
                    setEnhancementSettings((prev) => ({ ...prev, ...optimized }))
                  }}
                  className="mt-8 w-full n3uralia-button-gold px-6 py-3 rounded-lg text-lg font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <Target className="w-5 h-5" />
                  <span>Optimize Settings</span>
                </button>
              </div>
            </div>

            {/* Selected Files Preview and Processing */}
            {selectedFiles.length > 0 && (
              <div className="n3uralia-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Selected Files</h3>
                <div className="space-y-4">
                  {selectedFiles.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/15"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={fileItem.preview || "/placeholder.svg"}
                          alt={fileItem.name}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-semibold text-white line-clamp-1">{fileItem.name}</p>
                          <p className="text-sm n3uralia-text-muted">{formatFileSize(fileItem.size)}</p>
                          {fileItem.warning && <p className="text-xs text-yellow-400 mt-1">{fileItem.warning}</p>}
                          {fileItem.error && <p className="text-xs text-red-400 mt-1">{fileItem.error}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {fileItem.status === "ready" && (
                          <button
                            onClick={() => startProcessing(fileItem.id)}
                            className="n3uralia-button-gold px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Enhance</span>
                          </button>
                        )}
                        {fileItem.status === "failed" && (
                          <button
                            onClick={() => {
                              // Re-add to selected files to try again
                              setSelectedFiles((prev) => [...prev, fileItem])
                              // Remove from current list
                              setSelectedFiles((prev) => prev.filter((f) => f.id !== fileItem.id))
                            }}
                            className="n3uralia-button-secondary px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Retry</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedFiles((prev) => prev.filter((f) => f.id !== fileItem.id))}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Processing Tab Content */}
          {activeTab === "processing" && (
            <section className="space-y-12">
              <div className="n3uralia-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Processing Queue</h3>
                {processingQueue.length === 0 ? (
                  <p className="n3uralia-text-muted">Your processing queue is empty.</p>
                ) : (
                  <div className="space-y-4">
                    {processingQueue.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/15"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden">
                            <img
                              src={job.file.preview || "/placeholder.svg"}
                              alt={job.file.name}
                              className="w-full h-full object-cover opacity-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 animate-spin n3uralia-gold-accent" />
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-white line-clamp-1">{job.file.name}</p>
                            <p className="text-sm n3uralia-text-muted">{job.progress}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm n3uralia-text-muted">
                            {Math.round((Date.now() - job.startTime) / 1000)}s
                          </span>
                          <button
                            onClick={() => {
                              // Cancel job logic (implement if needed)
                            }}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="n3uralia-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Completed Jobs</h3>
                {completedJobs.length === 0 ? (
                  <p className="n3uralia-text-muted">No jobs completed yet.</p>
                ) : (
                  <div className="space-y-4">
                    {completedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 rounded-lg bg-white/5 border border-white/15 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden">
                            <img
                              src={job.downloadUrl || "/placeholder.svg"}
                              alt={job.originalFileName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-white line-clamp-1">{job.originalFileName}</p>
                            <p className="text-xs n3uralia-text-muted">
                              Enhanced with {job.modelName} ({job.upscaleFactor}x)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm n3uralia-text-muted">{job.fileSize}</p>
                            <p className="text-xs n3uralia-text-muted">{job.processingTime}</p>
                          </div>
                          <a
                            href={job.downloadUrl}
                            download={
                              job.originalFileName.replace(/\.[^/.]+$/, "") + "_enhanced." + job.model.split("-")[0]
                            } // Basic extension guess
                            onClick={(e) => {
                              e.preventDefault() // Prevent default for custom logic
                              if (domePreset.enabled) {
                                exportDomemasterForJob(job)
                              } else {
                                window.open(job.downloadUrl, "_blank") // Open in new tab if not domemaster
                              }
                            }}
                            className="n3uralia-button-gold px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                          >
                            {domePreset.enabled ? <Layers className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                            <span>{domePreset.enabled ? "Export Dome" : "Download"}</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Gallery Tab Content */}
          {activeTab === "gallery" && (
            <section className="space-y-12">
              <div className="n3uralia-card rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Image Gallery</h3>
                <p className="n3uralia-text-muted">Gallery functionality coming soon.</p>
                {/* Add gallery grid here */}
              </div>
            </section>
          )}

          {/* Admin Tab Content */}
          {activeTab === "admin" && isAdmin && (
            <section className="space-y-12">
              <div className="flex space-x-1 n3uralia-card rounded-xl p-1 mb-6">
                {[
                  { id: "config", label: "Configuration", icon: Settings },
                  { id: "users", label: "User Management", icon: Users },
                  { id: "roles", label: "Role Management", icon: Shield },
                  { id: "discovery", label: "Replicate Discovery", icon: Search },
                  { id: "test", label: "Test Config", icon: TestTube },
                ].map((subTab) => (
                  <button
                    key={subTab.id}
                    onClick={() => setAdminSubTab(subTab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
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

              {adminSubTab === "config" && (
                <div className="n3uralia-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Configuration</h3>
                  <p className="n3uralia-text-muted">Admin configuration options.</p>
                </div>
              )}
              {adminSubTab === "users" && <UserManagement />}
              {adminSubTab === "roles" && <RoleManagement />}
              {adminSubTab === "discovery" && (
                <div className="n3uralia-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Replicate Discovery</h3>
                  <button
                    onClick={runReplicateDiscovery}
                    disabled={isDiscovering}
                    className="n3uralia-button-gold px-4 py-2 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isDiscovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Run Discovery</span>
                  </button>
                  {discoveryResults && (
                    <pre className="mt-4 p-4 rounded-lg bg-white/5 border border-white/15 text-xs text-white/70 overflow-auto">
                      {JSON.stringify(discoveryResults, null, 2)}
                    </pre>
                  )}
                </div>
              )}
              {adminSubTab === "test" && (
                <div className="n3uralia-card rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Test Replicate Configuration</h3>
                  <button
                    onClick={testReplicateConfig}
                    disabled={isTesting}
                    className="n3uralia-button-gold px-4 py-2 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                    <span>Test Configuration</span>
                  </button>
                  {configResults && (
                    <pre className="mt-4 p-4 rounded-lg bg-white/5 border border-white/15 text-xs text-white/70 overflow-auto">
                      {JSON.stringify(configResults, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </section>
          )}
        </main>

        {/* Footer */}
        <Footer />

        {/* Profile Dialog from updates */}
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
