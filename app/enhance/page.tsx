"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Metadata } from "next"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
  Clock,
  ArrowRight,
  Camera,
  VideoOff,
  LogOut,
  Lock,
} from "lucide-react"
import Image from "next/image"
import { compressImageForUpload } from "@/utils/image-processing"
import {
  ALL_PRESETS,
  PUBLIC_PRESET_DETAILS,
  PUBLIC_PRESET_ORDER,
  getPresetsByCategory,
  type PresetCategory,
  type PublicPresetKey,
} from "@/lib/presets"
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
import { FacialAnalysisCard } from "@/components/facial-analysis-card"
import { isAuthenticated, logout } from "@/lib/auth" // Added for authentication
import { LoginModal } from "@/components/auth/login-modal" // Added for login modal
import { CreditDisplay } from "@/components/credits/credit-display" // Added for credit display
import { ClarityLogo } from "@/components/clarity-logo"

interface FileWithPreview {
  file: File
  preview: string
}

interface EnhancedImage {
  id: string
  original: File
  enhanced: string
  originalPreview: string
  processingTime?: string
  model?: string
  settings?: EnhancementSettings
  imageError?: boolean // Added to track image load errors
}

interface ProcessingImage {
  id: string
  file: File
  preview: string
  progress: number
  status: string
}

interface EnhancementSettings {
  model: string
  upscaleFactor: number
  creativity: number
  resemblance: number
  hdr: number
  tilingWidth: number
  tilingHeight: number
  prompt?: string
}

// Added for facial analysis
interface FacialAnalysis {
  hasFace: boolean
  gender: string
  ageRange: string
  expression: string
  quality: string
  features: string[]
}

interface UploadedFileWithAnalysis {
  file: File
  analysis: FacialAnalysis | null
  isAnalyzing: boolean
}

// Added UploadError interface
interface UploadError {
  id: string
  fileName: string
  error: string
  tip: string
}

export default function EnhancePage() {
  const [isAuth, setIsAuth] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set())
  const [processingImages, setProcessingImages] = useState<ProcessingImage[]>([]) // Track processing images
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>("faces")
  const [selectedPresetId, setSelectedPresetId] = useState<string>("indonesian-wedding")
  const [selectedPublicPreset, setSelectedPublicPreset] = useState<PublicPresetKey>("archive_scan")
  const [settings, setSettings] = useState<EnhancementSettings>({
    model: "philz1337x/clarity-upscaler",
    upscaleFactor: 2,
    creativity: 0.35,
    resemblance: 0.6,
    hdr: 0.0,
    tilingWidth: 112,
    tilingHeight: 144,
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [uploadedFilesWithAnalysis, setUploadedFilesWithAnalysis] = useState<UploadedFileWithAnalysis[]>([])

  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([])
  // Added downloadingImages state
  const [downloadingImages, setDownloadingImages] = useState<Set<string>>(new Set())
  // Added showLoginModal state
  const [showLoginModal, setShowLoginModal] = useState(false)

  const [imageAspectRatios, setImageAspectRatios] = useState<Map<number, number>>(new Map())
  const [facialAnalysisResults, setFacialAnalysisResults] = useState(new Map<string, any>()) // Added state for facial analysis results

  const [userCredits, setUserCredits] = useState<number>(0)
  const [isLoadingCredits, setIsLoadingCredits] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isPaidUser = userCredits > 0

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated()
      console.log("[v0] Authentication check:", authenticated)
      setIsAuth(authenticated)
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/credits/check")
        if (response.status === 401) {
          console.log("[v0] User not authenticated, showing login modal")
          setShowLoginModal(true)
          setIsLoadingCredits(false)
          return
        }
        const data = await response.json()
        if (data.success) {
          setUserCredits(data.credits)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch credits:", error)
      } finally {
        setIsLoadingCredits(false)
      }
    }

    if (isAuth) {
      fetchCredits()
    } else {
      setIsLoadingCredits(false)
    }
  }, [isAuth])

  useEffect(() => {
    // Only run camera setup if user is authenticated and camera is active
    if (!isAuth || !isCameraActive || !cameraStream || !videoRef.current) {
      return
    }

    const video = videoRef.current
    console.log("[v0] Setting up video element with stream")

    // Attach event listener first
    video.onloadedmetadata = () => {
      console.log("[v0] Video metadata loaded")
      console.log("[v0] Video dimensions:", video.videoWidth, "x", video.videoHeight)
      video
        .play()
        .then(() => console.log("[v0] Video playing successfully"))
        .catch((err) => {
          console.error("[v0] Video play error:", err)
          setError("Failed to start video playback")
        })
    }

    // Set the stream
    video.srcObject = cameraStream
    console.log("[v0] Stream assigned to video element")

    // Fallback: try to play immediately in case metadata is already loaded
    setTimeout(() => {
      if (video.readyState >= 2) {
        console.log("[v0] Video ready, attempting fallback play")
        video.play().catch((err) => console.log("[v0] Fallback play not needed:", err.message))
      }
    }, 100)
  }, [isAuth, isCameraActive, cameraStream])

  const analyzeImage = useCallback(
    async (file: File, index: number) => {
      try {
        console.log("[v0] Starting analysis for:", file.name)

        setUploadedFilesWithAnalysis((prev) => {
          const newFiles = [...prev]
          newFiles[index] = newFiles[index]
            ? { ...newFiles[index], isAnalyzing: true }
            : { file, analysis: null, isAnalyzing: true }
          return newFiles
        })

        const formData = new FormData()
        formData.append("image", file)

        console.log("[v0] Sending analysis request...")
        const response = await fetch("/api/analyze-face", {
          method: "POST",
          body: formData,
        })

        console.log("[v0] Analysis response status:", response.status)
        console.log("[v0] Analysis response headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Analysis error response:", errorText)
          throw new Error(`Analysis failed: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log("[v0] Analysis data received:", data)

        if (!data.success || !data.analysis) {
          throw new Error("Invalid analysis response")
        }

        setUploadedFilesWithAnalysis((prev) => {
          const newFiles = [...prev]
          newFiles[index] = newFiles[index]
            ? {
                ...newFiles[index],
                analysis: data.analysis,
                isAnalyzing: false,
              }
            : { file, analysis: data.analysis, isAnalyzing: false }
          return newFiles
        })

        console.log("[v0] Analysis complete for:", file.name)
      } catch (error: any) {
        console.error("[v0] Analysis error for", file.name, ":", error)
        console.error("[v0] Error stack:", error.stack)
        setUploadedFilesWithAnalysis((prev) => {
          const newFiles = [...prev]
          newFiles[index] = newFiles[index]
            ? { ...newFiles[index], isAnalyzing: false }
            : { file, analysis: null, isAnalyzing: false }
          return newFiles
        })
        setError(`Analysis failed: ${error.message}`)
      }
    },
    [setError],
  )

  const detectImageAspectRatio = useCallback((file: File, index: number) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      const aspectRatio = img.width / img.height
      console.log(`[v0] Image ${file.name}: ${img.width}x${img.height}, aspect ratio: ${aspectRatio.toFixed(2)}`)

      setImageAspectRatios((prev) => {
        const newMap = new Map(prev)
        newMap.set(index, aspectRatio)
        return newMap
      })

      URL.revokeObjectURL(objectUrl)
    }

    img.onerror = () => {
      console.error(`[v0] Failed to load image for aspect ratio detection: ${file.name}`)
      URL.revokeObjectURL(objectUrl)
    }

    img.src = objectUrl
  }, [])

  const getAspectRatioClass = useCallback(
    (index: number) => {
      const aspectRatio = imageAspectRatios.get(index)

      if (!aspectRatio) return "aspect-video" // Default

      // Equirectangular (panoramic) - 2:1 ratio
      if (aspectRatio >= 1.8 && aspectRatio <= 2.2) {
        return "aspect-[2/1]"
      }

      // Ultra-wide panoramic - wider than 2:1
      if (aspectRatio > 2.2) {
        return "aspect-[3/1]"
      }

      // Portrait - taller than wide
      if (aspectRatio < 0.8) {
        return "aspect-[3/4]"
      }

      // Square-ish
      if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
        return "aspect-square"
      }

      // Standard landscape (16:9)
      return "aspect-video"
    },
    [imageAspectRatios],
  )

  const shouldUseContain = useCallback(
    (index: number) => {
      const aspectRatio = imageAspectRatios.get(index)

      if (!aspectRatio) return false

      // Use contain for panoramic images (preserve full image)
      return aspectRatio >= 1.8 || aspectRatio < 0.8
    },
    [imageAspectRatios],
  )

  // Add simple file validation function
  const validateFile = (file: File): { valid: boolean; error?: string; tip?: string } => {
    try {
      // Check if file object exists and has required properties
      if (!file || typeof file !== "object") {
        return {
          valid: false,
          error: "Invalid file object",
          tip: "The file could not be read. Please try uploading again.",
        }
      }

      // Check if file has required properties
      if (!file.type || !file.name || file.size === undefined) {
        return {
          valid: false,
          error: `Invalid file: ${file.name || "unknown"}`,
          tip: "The file is missing required information. Please try a different file.",
        }
      }

      // Check file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
      const fileType = file.type.toLowerCase()
      if (!validTypes.includes(fileType)) {
        return {
          valid: false,
          error: `Invalid file format: ${file.name}`,
          tip: "Only PNG, JPG, JPEG, and WebP images are supported. Please convert your file first.",
        }
      }

      // Check file size (20MB max)
      const maxSize = 20 * 1024 * 1024 // 20MB in bytes
      if (file.size > maxSize) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2)
        return {
          valid: false,
          error: `File too large: ${file.name} (${sizeMB}MB)`,
          tip: "Maximum file size is 20MB. Please compress your image or use a lower resolution version.",
        }
      }

      // Check minimum file size (1KB to avoid empty files)
      if (file.size < 1024) {
        return {
          valid: false,
          error: `File too small: ${file.name}`,
          tip: "The file appears to be empty or corrupted. Please try a different image.",
        }
      }

      return { valid: true }
    } catch (error) {
      console.error("[v0] Error in validateFile:", error)
      return {
        valid: false,
        error: "File validation failed",
        tip: "An error occurred while validating the file. Please try again.",
      }
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      try {
        console.log(`[v0] Files dropped: ${acceptedFiles.length} accepted, ${rejectedFiles.length} rejected`)

        const validFiles: File[] = []
        const newErrors: UploadError[] = []

        // Validate each accepted file
        for (const file of acceptedFiles) {
          if (!file) {
            console.error("[v0] Invalid file object:", file)
            continue
          }
          console.log("[v0] File object properties:", { name: file.name, size: file.size, type: file.type })
          const validation = validateFile(file)
          if (!validation.valid) {
            newErrors.push({
              id: `${Date.now()}-${Math.random()}`,
              fileName: file.name || "unknown",
              error: validation.error || "Validation failed",
              tip: validation.tip || "Please try a different file.",
            })
          } else {
            console.log("[v0] File passed validation, adding to validFiles:", file.name)
            validFiles.push(file)
          }
        }

        // Handle rejected files
        if (Array.isArray(rejectedFiles)) {
          rejectedFiles.forEach((rejection) => {
            if (!rejection || !rejection.file) {
              console.error("[v0] Invalid rejection object:", rejection)
              return
            }
            const errorMessages = rejection.errors.map((e) => e.message).join(", ")
            newErrors.push({
              id: `${Date.now()}-${Math.random()}`,
              fileName: rejection.file.name || "unknown",
              error: errorMessages,
              tip: "Please check the file format and size requirements.",
            })
          })
        }

        // Update errors state
        if (newErrors.length > 0) {
          setUploadErrors((prev) => [...prev, ...newErrors])
        }

        // Only process valid files
        if (validFiles.length === 0) {
          console.log("[v0] No valid files to process")
          return
        }

        console.log(`[v0] Adding ${validFiles.length} new files`)

        const duplicateErrors: any[] = []
        const filesToAdd = validFiles.filter((file) => {
          if (!file) return false
          const isDuplicate = uploadedFiles.some(
            (existing) => existing && existing.file && existing.file.name === file.name && existing.file.size === file.size,
          )
          if (isDuplicate) {
            console.log(`[v0] Skipping duplicate file: ${file.name}`)
            duplicateErrors.push({
              id: `error-${Date.now()}-${Math.random()}`,
              fileName: file.name,
              error: "Duplicate file",
              tip: "This file has already been uploaded",
            })
          }
          return !isDuplicate
        })

        // Set duplicate errors after filtering is complete
        if (duplicateErrors.length > 0) {
          setUploadErrors((prev) => {
            const prevArray = Array.isArray(prev) ? prev : []
            return [...prevArray, ...duplicateErrors]
          })
        }

        if (filesToAdd.length === 0) return

        console.log("[v0] uploadedFiles:", uploadedFiles)
        console.log("[v0] filesToAdd:", filesToAdd)
        console.log("[v0] filesToAdd type check:", filesToAdd.map((f) => ({ name: f?.name, isFile: f instanceof File })))

        const filesWithPreviews: FileWithPreview[] = []
        for (let i = 0; i < filesToAdd.length; i++) {
          const file = filesToAdd[i]
          try {
            if (!file) {
              console.error("[v0] File is null/undefined at index", i)
              continue
            }
            if (typeof file !== "object" || !file.name) {
              console.error("[v0] Invalid file object at index", i, ":", file)
              continue
            }
            const preview = URL.createObjectURL(file)
            filesWithPreviews.push({
              file,
              preview,
            })
          } catch (err) {
            console.error("[v0] Error processing file at index", i, ":", err)
          }
        }

        const startIndex = Array.isArray(uploadedFiles) ? uploadedFiles.length : 0

        setUploadedFiles((prev) => {
          const prevArray = Array.isArray(prev) ? prev : []
          const result = prevArray.concat(filesWithPreviews)
          console.log("[v0] Files added successfully, total:", result.length)
          return result
        })

        filesToAdd.forEach((file, idx) => {
          if (file) {
            detectImageAspectRatio(file, startIndex + idx)
          }
        })

        const analysisPromises = filesToAdd.map(async (file) => {
          try {
            if (!file) {
              console.error("[v0] File is null/undefined in analysis promise")
              return { fileName: "unknown", hasFace: false, confidence: 0 }
            }
            console.log(`[v0] Starting facial analysis for: ${file.name}`)
            const formData = new FormData()
            formData.append("image", file)

            const response = await fetch("/api/analyze-face", {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              console.error(`[v0] Facial analysis failed for ${file.name}: ${response.status}`)
              return { fileName: file.name, hasFace: false, confidence: 0 }
            }

            let data
            try {
              data = await response.json()
            } catch (jsonError) {
              console.error(`[v0] Failed to parse JSON response for ${file.name}:`, jsonError)
              return { fileName: file.name, hasFace: false, confidence: 0 }
            }

            if (!data || typeof data !== "object") {
              console.error(`[v0] Invalid data format for ${file.name}:`, data)
              return { fileName: file.name, hasFace: false, confidence: 0 }
            }

            console.log(`[v0] Facial analysis complete for ${file.name}:`, data)
            return { fileName: file.name, ...data }
          } catch (error) {
            console.error(`[v0] Facial analysis error for ${file.name}:`, error)
            return { fileName: file.name, hasFace: false, confidence: 0 }
          }
        })

        try {
          const results = await Promise.all(analysisPromises)
          console.log(`[v0] All facial analyses complete:`, results)

          // Store analysis results with null checks
          const newAnalysisResults = new Map(facialAnalysisResults)
          results.forEach((result) => {
            if (result && typeof result === "object" && result.fileName) {
              newAnalysisResults.set(result.fileName, result)
            } else {
              console.error("[v0] Invalid analysis result:", result)
            }
          })
          setFacialAnalysisResults(newAnalysisResults)

          // Update uploadedFilesWithAnalysis state
          setUploadedFilesWithAnalysis((prev) => {
            const newEntries = filesToAdd.map((file) => {
              if (!file) {
                throw new Error("File is undefined in newEntries map")
              }
              return {
                file,
                analysis: null,
                isAnalyzing: true,
              }
            })
            const prevArray = Array.isArray(prev) ? prev : []
            const combined = [...prevArray, ...newEntries]

            // After parallel analysis is done, update the analysis field
            setTimeout(() => {
              try {
                if (!Array.isArray(results)) {
                  console.error("[v0] results is not an array:", results)
                  return
                }

                results.forEach((result) => {
                  if (!result) {
                    console.log("[v0] Skipping null/undefined result")
                    return
                  }

                  if (typeof result !== "object") {
                    console.log("[v0] Skipping non-object result:", typeof result)
                    return
                  }

                  if (!result.fileName || typeof result.fileName !== "string") {
                    console.error("[v0] Invalid result object - missing or invalid fileName:", result)
                    return
                  }

                  const fileIndex = combined.findIndex((item) => {
                    if (!item || !item.file) {
                      return false
                    }
                    return item.file.name === result.fileName
                  })

                  if (fileIndex !== -1) {
                    const updatedArray = [...combined]
                    updatedArray[fileIndex] = {
                      ...updatedArray[fileIndex],
                      analysis: result,
                      isAnalyzing: false,
                    }
                    setUploadedFilesWithAnalysis(updatedArray)
                  }
                })
              } catch (error) {
                console.error("[v0] Error in setTimeout callback:", error)
              }
            }, 100)

            return combined
          })
        } catch (analysisError) {
          console.error("[v0] Error processing analysis results:", analysisError)
          // Continue without facial analysis if it fails
          setUploadedFilesWithAnalysis((prev) => {
            const newEntries = filesToAdd.map((file) => {
              if (!file) {
                throw new Error("File is undefined in error handler map")
              }
              return {
                file,
                analysis: { fileName: file.name, hasFace: false, confidence: 0 },
                isAnalyzing: false,
              }
            })
            const prevArray = Array.isArray(prev) ? prev : []
            return [...prevArray, ...newEntries]
          })
        }

        setError(null)
        const totalSize = filesToAdd.reduce((sum, file) => sum + (file ? file.size : 0), 0)
        trackImageUpload(filesToAdd.length, totalSize)
      } catch (dropError) {
        // Log the error but don't show a warning since files are still being processed
        console.error("[v0] Error in onDrop handler:", dropError)
        console.log("[v0] Files may still be processing despite this error")
      }
    },
    [uploadedFiles, uploadErrors, facialAnalysisResults, detectImageAspectRatio, uploadedFilesWithAnalysis],
  )

  const toggleFileSelection = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(index)) {
        newSelected.delete(index)
      } else {
        newSelected.add(index)
      }
      return newSelected
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedFiles.size === uploadedFiles.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(uploadedFiles.map((_, i) => i)))
    }
  }, [uploadedFiles.length, selectedFiles.size])

  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    setUploadedFilesWithAnalysis((prev) => prev.filter((_, i) => i !== index))
    setSelectedFiles((prev) => {
      const newSelected = new Set<number>()
      prev.forEach((selectedIndex) => {
        if (selectedIndex < index) {
          newSelected.add(selectedIndex)
        } else if (selectedIndex > index) {
          newSelected.add(selectedIndex - 1)
        }
      })
      return newSelected
    })
    // Remove aspect ratio for removed file
    setImageAspectRatios((prev) => {
      const newMap = new Map(prev)
      newMap.delete(index)
      return newMap
    })
  }, [])

  const removeProcessingImage = useCallback((id: string) => {
    setProcessingImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const removeEnhancedImage = useCallback((id: string) => {
    setEnhancedImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const applyPreset = useCallback((presetId: string) => {
    const preset = ALL_PRESETS[presetId]
    if (preset) {
      setSelectedPresetId(presetId)
      setSelectedCategory(preset.category)
      setSettings(preset.settings)
      setShowAdvanced(false)
      trackPresetSelection(presetId, preset.category)
    }
  }, [])

  const switchCategory = useCallback(
    (category: PresetCategory) => {
      trackCategorySwitch(selectedCategory, category)
      setSelectedCategory(category)
      const presetsInCategory = getPresetsByCategory(category)
      if (presetsInCategory.length > 0) {
        applyPreset(presetsInCategory[0].id)
      }
    },
    [applyPreset, selectedCategory],
  )

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      console.log("[v0] Requesting camera access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      console.log("[v0] Camera access granted")
      console.log(
        "[v0] Stream tracks:",
        stream.getTracks().map((t) => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })),
      )

      setCameraStream(stream)
      setIsCameraActive(true)
      setError(null)
    } catch (error: any) {
      console.error("[v0] Camera access error:", error)
      if (error.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permissions in your browser settings.")
      } else if (error.name === "NotFoundError") {
        setError("No camera found. Please connect a camera and try again.")
      } else if (error.name === "NotReadableError") {
        setError("Camera is already in use by another application.")
      } else {
        setError(`Camera error: ${error.message}`)
      }
      setIsCameraActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
      setIsCameraActive(false)
    }
  }, [cameraStream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: "image/jpeg" })
            setUploadedFiles((prev) => {
              const newFiles: FileWithPreview[] = [
                ...prev,
                {
                  file,
                  preview: URL.createObjectURL(blob),
                },
              ]
              setSelectedFiles((prevSelected) => {
                const newSelected = new Set(prevSelected)
                newSelected.add(prev.length)
                return newSelected
              })

              setUploadedFilesWithAnalysis((prevAnalysis) => {
                const newAnalysis = [
                  ...prevAnalysis,
                  {
                    file,
                    analysis: null,
                    isAnalyzing: false,
                  },
                ]
                // Start analysis
                analyzeImage(file, prevAnalysis.length)
                return newAnalysis
              })

              return newFiles
            })
            stopCamera()
            trackImageUpload(1, blob.size)
          }
        }, "image/jpeg")
      }
    }
  }, [stopCamera, analyzeImage])

  // Function to process a single image
  const processImage = async (file: File, index: number, processingId: string) => {
    try {
      console.log(`[v0] Original file size: ${Math.round(file.size / 1024)}KB`)
      const compressedFile = await compressImageForUpload(file, 0.8)
      console.log(`[v0] Compressed file size: ${Math.round(compressedFile.size / 1024)}KB`)

      setProcessingImages((prev) =>
        prev.map((img) =>
          img.id === processingId
            ? {
                ...img,
                progress: 30,
                status: selectedCategory === "avatar" ? "Generating avatar body..." : "Uploading...",
              }
            : img,
        ),
      )

      const formData = new FormData()
      formData.append("image", compressedFile)

      formData.append("scale_factor", (settings.upscaleFactor ?? 2).toString())
      formData.append("model", settings.model || "philz1337x/clarity-upscaler")
      formData.append("dynamic", "6")

      const creativity = settings.creativity ?? 0.35
      const resemblance = settings.resemblance ?? 0.6
      formData.append("creativity", creativity.toString())
      formData.append("resemblance", resemblance.toString())

      const hdr = settings.hdr ?? 0.0
      const tilingWidth = settings.tilingWidth ?? 112
      const tilingHeight = settings.tilingHeight ?? 144
      formData.append("hdr", hdr.toString())
      formData.append("tiling_width", tilingWidth.toString())
      formData.append("tiling_height", tilingHeight.toString())

      if (settings.prompt) {
        formData.append("prompt", settings.prompt)
      }

      setProcessingImages((prev) =>
        prev.map((img) =>
          img.id === processingId
            ? { ...img, progress: 50, status: selectedCategory === "avatar" ? "Creating avatar..." : "Enhancing..." }
            : img,
        ),
      )

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
        const text = await response.text()
        throw new Error(text || `Server error: ${response.status}`)
      }

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`)
      }

      if (!data.success || !data.output) {
        throw new Error(data.error || "Enhancement failed")
      }

      let finalOutput = data.output

      if (selectedCategory === "avatar") {
        setProcessingImages((prev) =>
          prev.map((img) =>
            img.id === processingId ? { ...img, progress: 70, status: "Swapping your face..." } : img,
          ),
        )

        console.log("[v0] Starting face swap...")
        const faceSwapFormData = new FormData()
        faceSwapFormData.append("source", file) // Original user photo
        faceSwapFormData.append("target", data.output) // Generated avatar body

        const faceSwapResponse = await fetch("/api/face-swap", {
          method: "POST",
          body: faceSwapFormData,
        })

        const faceSwapData = await faceSwapResponse.json()

        if (!faceSwapResponse.ok || !faceSwapData.success) {
          console.error("[v0] Face swap failed, using original generation")
          // Fallback to original generation if face swap fails
        } else {
          finalOutput = faceSwapData.output
          console.log("[v0] Face swap successful!")
        }
      }

      try {
        const deductResponse = await fetch("/api/credits/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 6,
            description: `Enhanced ${file.name}`,
            metadata: {
              fileName: file.name,
              model: settings.model,
              category: selectedCategory,
            },
          }),
        })

        const deductData = await deductResponse.json()
        if (deductData.success) {
          setUserCredits(deductData.remainingCredits)
          console.log(`[v0] Credits deducted. Remaining: ${deductData.remainingCredits}`)
        }
      } catch (creditError) {
        console.error("[v0] Failed to deduct credits:", creditError)
      }

      setProcessingImages((prev) =>
        prev.map((img) => (img.id === processingId ? { ...img, progress: 90, status: "Finalizing..." } : img)),
      )

      // Create enhanced image
      const enhancedImage: EnhancedImage = {
        id: `enhanced-${Date.now()}-${index}`,
        original: file,
        enhanced: finalOutput,
        originalPreview: URL.createObjectURL(file),
        processingTime: data.processingTime,
        model: settings.model,
        settings: { ...settings },
        imageError: false,
      }

      // Move to enhanced column
      setEnhancedImages((prev) => [...prev, enhancedImage])
      setProcessingImages((prev) => prev.filter((img) => img.id !== processingId))

      return { success: true, originalFile: file }
    } catch (error: any) {
      console.error(`❌ Error processing ${file.name}:`, error)
      setProcessingImages((prev) =>
        prev.map((img) =>
          img.id === processingId ? { ...img, progress: 100, status: `Error: ${error.message}` } : img,
        ),
      )
      trackEnhancementFailure(error.message, {
        model: settings.model,
        category: selectedCategory,
        presetId: selectedPresetId,
      })
      return { success: false, originalFile: file, error: error.message }
    }
  }

  const handleEnhance = useCallback(async () => {
    if (!isAuth) {
      console.log("[v0] User not authenticated, showing login modal")
      setShowLoginModal(true)
      return
    }

    if (selectedFiles.size === 0) {
      setError("Please select at least one image to enhance")
      return
    }

    const creditsNeeded = selectedFiles.size * 6 // 6 credits per image
    if (userCredits < creditsNeeded) {
      setError(
        `Insufficient credits. You need ${creditsNeeded} credits but only have ${userCredits}. Please purchase more credits.`,
      )
      return
    }

    setIsProcessing(true)
    setError(null)

    const filesToProcess = Array.from(selectedFiles)
      .sort((a, b) => a - b)
      .map((index) => uploadedFiles[index])

    const startTime = Date.now()

    trackEnhancementStart({
      model: settings.model,
      upscaleFactor: settings.upscaleFactor,
      creativity: settings.creativity,
      resemblance: settings.resemblance,
      category: selectedCategory,
      presetId: selectedPresetId,
    })

    // Move selected files to processing column
    const processingBatch: ProcessingImage[] = filesToProcess.map((fileWithPreview, i) => ({
      id: `processing-${Date.now()}-${i}`,
      file: fileWithPreview.file,
      preview: fileWithPreview.preview,
      progress: 0,
      status: "Starting...",
    }))

    setProcessingImages(processingBatch)

    // Remove processed files from uploaded
    setUploadedFiles((prev) => prev.filter((_, index) => !selectedFiles.has(index)))
    setSelectedFiles(new Set())

    let successfulEnhancements = 0
    const processingResults: { success: boolean; originalFile: File; error?: string }[] = []

    // Process each image concurrently
    const promises = processingBatch.map((img) =>
      processImage(
        img.file,
        uploadedFiles.findIndex((item) => item.file.name === img.file.name),
        img.id,
      ),
    )

    const results = await Promise.all(promises)
    results.forEach((res) => {
      if (res.success) {
        successfulEnhancements++
      }
      processingResults.push(res)
    })

    const failedImages = processingResults.filter((res) => !res.success)

    if (failedImages.length > 0) {
      // Remove failed images from processingImages after a delay
      setTimeout(() => {
        setProcessingImages((prev) =>
          prev.filter((p) => !failedImages.some((f) => f.originalFile.name === p.file.name)),
        )
      }, 5000)
    }

    const endTime = Date.now()
    const processingTime = ((endTime - startTime) / 1000).toFixed(2)
    trackEnhancementComplete(processingTime, filesToProcess.length, {
      model: settings.upscaleFactor,
      upscaleFactor: settings.upscaleFactor,
      category: selectedCategory,
    })

    if (successfulEnhancements > 0) {
      console.log(
        `[v0] Successfully enhanced ${successfulEnhancements} image(s), used ${successfulEnhancements * 6} credits`,
      )
    }

    setIsProcessing(false)
  }, [
    selectedFiles,
    uploadedFiles,
    userCredits,
    settings,
    selectedCategory,
    selectedPresetId,
    removeProcessingImage,
    trackEnhancementComplete,
    trackEnhancementFailure,
    trackEnhancementStart,
  ])

  const handleImageError = useCallback((imageId: string) => {
    console.error("[v0] Failed to load enhanced image:", imageId)
    setEnhancedImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, imageError: true } : img)))
  }, [])

  const downloadImage = useCallback(
    async (url: string, filename: string, imageId: string) => {
      try {
        setDownloadingImages((prev) => new Set(prev).add(imageId))

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`)
        }

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

        // Show success message briefly
        setTimeout(() => {
          setDownloadingImages((prev) => {
            const next = new Set(prev)
            next.delete(imageId)
            return next
          })
        }, 1000)
      } catch (error: any) {
        console.error("[v0] Download failed:", error)
        setError(`Failed to download ${filename}: ${error.message}`)
        setDownloadingImages((prev) => {
          const next = new Set(prev)
          next.delete(imageId)
          return next
        })
      }
    },
    [settings.model, selectedCategory, selectedPresetId],
  )

  const retryProcessing = useCallback(
    async (processingId: string) => {
      const processingImage = processingImages.find((img) => img.id === processingId)
      if (!processingImage) return

      console.log("[v0] Retrying processing for:", processingImage.file.name)

      // Reset progress
      setProcessingImages((prev) =>
        prev.map((img) => (img.id === processingId ? { ...img, progress: 0, status: "Retrying..." } : img)),
      )

      // Re-run the enhancement logic for this single image
      try {
        const file = processingImage.file
        const isAvatarMode = selectedCategory === "avatar"

        setProcessingImages((prev) =>
          prev.map((img) => (img.id === processingId ? { ...img, progress: 10, status: "Compressing..." } : img)),
        )

        const processedFile = await compressImageForUpload(file, 0.8)

        setProcessingImages((prev) =>
          prev.map((img) =>
            img.id === processingId
              ? { ...img, progress: 30, status: isAvatarMode ? "Generating avatar..." : "Uploading..." }
              : img,
          ),
        )

        const formData = new FormData()
        formData.append("image", processedFile)
        formData.append("model", settings.model)
        formData.append("scale_factor", settings.upscaleFactor.toString())

        if (isAvatarMode) {
          formData.append("creativity", "0.95")
          formData.append("resemblance", "0.3")
        } else {
          formData.append("creativity", settings.creativity.toString())
          formData.append("resemblance", settings.resemblance.toString())
        }

        formData.append("hdr", settings.hdr.toString())
        formData.append("tiling_width", settings.tilingWidth.toString())
        formData.append("tiling_height", settings.tilingHeight.toString())
        if (settings.prompt) {
          formData.append("prompt", settings.prompt)
        }

        setProcessingImages((prev) =>
          prev.map((img) =>
            img.id === processingId
              ? { ...img, progress: 50, status: isAvatarMode ? "Creating avatar..." : "Enhancing..." }
              : img,
          ),
        )

        const response = await fetch("/api/enhance-replicate", {
          method: "POST",
          body: formData,
        })

        const contentType = response.headers.get("content-type")
        let data: any

        if (contentType?.includes("application/json")) {
          data = await response.json()
        } else {
          const text = await response.text()
          throw new Error(text || `Server error: ${response.status}`)
        }

        if (!response.ok) {
          throw new Error(data.error || `API error: ${response.status}`)
        }

        if (!data.success || !data.output) {
          throw new Error(data.error || "Enhancement failed")
        }

        let finalOutput = data.output

        if (isAvatarMode) {
          setProcessingImages((prev) =>
            prev.map((img) => (img.id === processingId ? { ...img, progress: 70, status: "Swapping face..." } : img)),
          )

          const faceSwapFormData = new FormData()
          faceSwapFormData.append("source", file)
          faceSwapFormData.append("target", data.output)

          const faceSwapResponse = await fetch("/api/face-swap", {
            method: "POST",
            body: faceSwapFormData,
          })

          const faceSwapData = await faceSwapResponse.json()

          if (faceSwapResponse.ok && faceSwapData.success) {
            finalOutput = faceSwapData.output
          }
        }

        setProcessingImages((prev) =>
          prev.map((img) => (img.id === processingId ? { ...img, progress: 90, status: "Finalizing..." } : img)),
        )

        const enhancedImage: EnhancedImage = {
          id: `enhanced-${Date.now()}-retry`,
          original: file,
          enhanced: finalOutput,
          originalPreview: URL.createObjectURL(file),
          processingTime: data.processingTime,
          model: settings.model,
          settings: { ...settings },
          imageError: false,
        }

        setEnhancedImages((prev) => [...prev, enhancedImage])
        setProcessingImages((prev) => prev.filter((img) => img.id !== processingId))
      } catch (error: any) {
        console.error("[v0] Retry failed:", error)
        setProcessingImages((prev) =>
          prev.map((img) =>
            img.id === processingId ? { ...img, progress: 100, status: `Retry failed: ${error.message}` } : img,
          ),
        )
      }
    },
    [processingImages, selectedCategory, settings, compressImageForUpload],
  )

  const generatePrompt = useCallback(() => {
    setIsGeneratingPrompt(true)

    const creativity = settings.creativity
    let prompts: string[] = []

    const selectedAnalysis = Array.from(selectedFiles)
      .map((index) => uploadedFilesWithAnalysis[index]?.analysis)
      .filter((analysis) => analysis && analysis.hasFace)

    // Build context from facial analysis
    let faceContext = ""
    if (selectedAnalysis.length > 0) {
      const analysis = selectedAnalysis[0] // Use first selected image's analysis
      const features: string[] = []

      if (analysis.gender) features.push(analysis.gender)
      if (analysis.ageRange) features.push(analysis.ageRange)
      if (analysis.features && analysis.features.length > 0) {
        features.push(...analysis.features)
      }

      if (features.length > 0) {
        faceContext = ` with ${features.join(", ")}`
      }
    }

    if (selectedCategory === "faces") {
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
    } else if (selectedCategory === "abstract") {
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
    } else if (selectedCategory === "avatar") {
      if (selectedPresetId === "hyper-realistic-avatar") {
        prompts = [
          "ultra realistic digital human portrait with photographic quality and lifelike skin texture",
          "hyper detailed avatar with professional studio lighting and 8k resolution",
          "photorealistic digital portrait with authentic facial features and natural expressions",
          "ultra high definition avatar with realistic skin pores and professional photography quality",
          "hyper realistic digital human with cinematic lighting and photographic perfection",
          "8k quality digital portrait with lifelike details and professional studio setup",
          "photorealistic avatar with authentic human features and ultra detailed textures",
        ]
      } else if (selectedPresetId === "anime-avatar") {
        prompts = [
          "anime style portrait with large expressive eyes and vibrant manga colors",
          "Japanese animation character with stylized features and cel shaded coloring",
          "anime avatar with expressive facial features and bold anime aesthetic",
          "manga style portrait with dramatic eyes and vibrant Japanese animation colors",
          "anime character design with stylized proportions and expressive anime features",
          "Japanese anime portrait with large eyes and colorful manga art style",
          "anime style avatar with expressive features and vibrant cel shaded colors",
        ]
      } else if (selectedPresetId === "metaverse-avatar") {
        prompts = [
          "metaverse ready avatar with NFT aesthetic and 3D virtual world design",
          "web3 digital identity with futuristic avatar styling and virtual world compatibility",
          "NFT profile picture with metaverse aesthetic and 3D character design",
          "virtual world avatar with modern web3 styling and digital identity features",
          "metaverse character with futuristic design and NFT collection aesthetic",
          "3D virtual avatar with web3 aesthetic and digital identity presence",
          "futuristic metaverse avatar with NFT styling and virtual world readiness",
        ]
      } else if (selectedPresetId === "cartoon-avatar") {
        prompts = [
          "vibrant cartoon character with animated style and expressive features",
          "animated avatar with bold colors and playful cartoon aesthetic",
          "cartoon style portrait with vibrant colors and fun animated character design",
          "playful cartoon avatar with expressive features and bright animated colors",
          "animated character design with cartoon styling and vibrant personality",
          "cartoon portrait with bold expressive features and animated art style",
          "fun cartoon avatar with vibrant colors and animated character design",
        ]
      } else if (selectedPresetId === "professional-illustration") {
        prompts = [
          "elegant illustrated portrait with professional business aesthetic and clean lines",
          "sophisticated digital illustration with business-ready styling and refined details",
          "professional avatar illustration with elegant design and corporate aesthetic",
          "business-ready illustrated portrait with sophisticated styling and clean design",
          "elegant professional illustration with refined details and business aesthetic",
          "corporate avatar with professional illustration style and sophisticated design",
          "business portrait illustration with elegant styling and professional finish",
        ]
      } else if (selectedPresetId === "artistic-portrait") {
        prompts = [
          "painterly portrait with expressive brushstrokes and artistic oil painting style",
          "artistic interpretation with fine art aesthetic and expressive painting techniques",
          "oil painting style portrait with artistic brushwork and expressive colors",
          "fine art portrait with painterly techniques and artistic interpretation",
          "expressive artistic portrait with oil painting aesthetic and bold brushstrokes",
          "artistic painting style with expressive techniques and fine art quality",
          "painterly avatar with artistic interpretation and expressive oil painting style",
        ]
      } else if (selectedPresetId === "pixel-art") {
        prompts = [
          "retro pixel art avatar with 8-bit gaming aesthetic and nostalgic style",
          "pixelated portrait with retro gaming style and 8-bit character design",
          "8-bit pixel art character with nostalgic gaming aesthetic",
          "retro gaming avatar with pixel art style and 8-bit nostalgia",
          "pixel art portrait with retro 8-bit aesthetic and gaming character design",
          "nostalgic pixel art with retro gaming style and 8-bit character",
          "8-bit avatar with retro pixel art aesthetic and gaming nostalgia",
        ]
      } else if (selectedPresetId === "3d-render") {
        prompts = [
          "modern 3D rendered character with smooth CGI quality and professional 3D art",
          "CGI avatar with modern 3D rendering and smooth professional quality",
          "3D rendered portrait with contemporary CGI aesthetic and smooth rendering",
          "professional 3D character with modern rendering and CGI quality",
          "smooth 3D rendered avatar with contemporary CGI styling",
          "modern CGI character with professional 3D rendering and smooth quality",
          "3D avatar with contemporary rendering and professional CGI aesthetic",
        ]
      } else if (selectedPresetId === "comic-book") {
        prompts = [
          `full body comic book superhero${faceContext}, preserve exact facial features and identity, exaggerated muscular superhero physique, dynamic action pose, vibrant costume with cape, bold comic book art style with dramatic shading and halftone dots, powerful hero stance`,
          `comic book character full body${faceContext}, maintain original face perfectly, crazy exaggerated muscular body, superhero costume with bold colors, graphic novel art style with strong outlines and dramatic shadows`,
          `superhero comic book style full body portrait${faceContext}, keep face identical to original, over-the-top muscular physique, epic superhero costume, action-packed pose, bold comic art with vibrant colors and dramatic lighting`,
          `full body comic book hero${faceContext}, preserve all facial features exactly, exaggerated athletic superhero body, dynamic costume design, powerful stance, pop art comic style with bold lines and vivid colors`,
          `comic book superhero transformation${faceContext}, maintain facial identity perfectly, crazy muscular hero physique, vibrant superhero outfit, dramatic action pose, graphic novel aesthetic with strong contrast and bold colors`,
          `full body superhero comic art${faceContext}, exact face preservation, exaggerated heroic muscular build, dynamic superhero costume, powerful hero pose, bold comic book style with dramatic shading and vibrant palette`,
        ]
      } else if (selectedPresetId === "minimalist-line") {
        prompts = [
          "minimalist line art portrait with clean elegant lines and simple modern design",
          "elegant line drawing with minimalist aesthetic and clean simple lines",
          "simple line art avatar with minimalist design and elegant sketch style",
          "clean minimalist portrait with elegant line drawing and simple design",
          "modern minimalist line art with clean elegant lines and simple aesthetic",
          "elegant sketch with minimalist line art and clean simple design",
          "minimalist portrait with clean line drawing and elegant simple style",
        ]
      } else if (selectedPresetId === "fantasy-character") {
        prompts = [
          "epic fantasy character with magical RPG aesthetic and detailed fantasy illustration",
          "fantasy RPG avatar with epic magical character design and detailed illustration",
          "magical fantasy portrait with epic RPG styling and detailed character art",
          "RPG character with fantasy aesthetic and epic magical illustration",
          "detailed fantasy character with magical RPG design and epic illustration",
          "epic fantasy avatar with magical character styling and detailed RPG art",
          "fantasy illustration with epic RPG character and magical detailed design",
        ]
      } else {
        // Generic avatar prompts
        prompts = [
          "stylized avatar portrait with unique artistic flair and creative character design",
          "creative avatar with personalized styling and distinctive artistic features",
          "unique avatar design with artistic interpretation and creative styling",
          "personalized avatar with creative flair and unique artistic design",
          "artistic avatar with distinctive styling and creative character features",
          "creative character design with unique avatar styling and artistic flair",
          "stylized avatar with creative interpretation and unique artistic features",
        ]
      }
    } else {
      // experimental
      if (selectedPresetId === "hyper-realistic") {
        prompts = [
          "hyper realistic photograph with microscopic detail and photorealistic perfection",
          "ultra detailed image with extreme clarity and lifelike textures",
          "photorealistic rendering with professional studio quality and razor sharp focus",
          "maximum detail photograph with true-to-life accuracy and pristine clarity",
          "hyper real image with enhanced micro-details and authentic photographic quality",
        ]
      } else if (selectedPresetId === "cinematic-grade") {
        prompts = [
          "cinematic masterpiece with film-quality color grading and dramatic lighting",
          "movie scene aesthetic with professional cinematography and atmospheric depth",
          "Hollywood-grade color science with rich tones and cinematic composition",
          "film production quality with dramatic shadows and professional lighting design",
          "cinema-quality image with blockbuster visual effects and epic atmosphere",
        ]
      } else if (selectedPresetId === "ai-imagination") {
        prompts = [
          "AI creative interpretation with bold artistic vision and imaginative enhancement",
          "machine learning artistry with unique style and experimental transformation",
          "neural network imagination with creative freedom and unexpected beauty",
          "AI-powered artistic vision with innovative enhancement and bold creativity",
          "algorithmic creativity with imaginative interpretation and unique aesthetic",
        ]
      } else if (selectedPresetId === "ultra-sharp") {
        prompts = [
          "ultra sharp technical photography with microscopic precision and extreme clarity",
          "razor sharp focus with scientific detail and technical perfection",
          "extreme sharpness with laboratory-grade precision and crystal clarity",
          "technical photography with surgical precision and maximum definition",
          "ultra-detailed image with scientific accuracy and pristine sharpness",
        ]
      } else if (selectedPresetId === "neon-pop") {
        prompts = [
          "neon cyberpunk aesthetic with electric colors and vibrant glow effects",
          "futuristic neon enhancement with bold saturation and glowing accents",
          "cyberpunk color palette with neon lights and electric atmosphere",
          "vibrant neon colors with futuristic glow and bold contrast",
          "electric neon aesthetic with cyberpunk vibes and glowing enhancement",
        ]
      } else if (selectedPresetId === "dream-state") {
        prompts = [
          "dreamlike ethereal atmosphere with soft magical realism and surreal beauty",
          "ethereal dream state with soft focus and mystical enhancement",
          "surreal dreamscape with magical atmosphere and gentle artistic interpretation",
          "dreamy ethereal quality with soft surrealism and enchanting mood",
          "mystical dream state with ethereal beauty and soft artistic vision",
        ]
      } else {
        prompts = [
          "experimental AI enhancement with cutting-edge creative interpretation",
          "bold artistic transformation with maximum creative freedom",
          "innovative AI processing with unique experimental results",
          "creative boundary-pushing enhancement with artistic innovation",
          "experimental artistic vision with bold AI-powered transformation",
        ]
      }
    }

    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)]

    setTimeout(() => {
      setSettings((prev) => ({ ...prev, prompt: selectedPrompt }))
      setIsGeneratingPrompt(false)
    }, 500)
  }, [settings.creativity, selectedFiles, uploadedFilesWithAnalysis, selectedCategory, selectedPresetId, setSettings])

  const handleLoginSuccess = useCallback(() => {
    console.log("[v0] Login successful, updating state")
    setIsAuth(true)
  }, [])

  // ADDED HANDLER:
  const handleShowLogin = useCallback(() => {
    setIsAuth(false) // This will trigger the !isAuth check and show the modal
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setIsAuth(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 20 * 1024 * 1024, // Increased to 20MB for panoramic images
  })

  const currentPresets = getPresetsByCategory(selectedCategory)

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // REMOVED: The whole LoginModal component here, handled conditionally below
  // if (!isAuth) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
  //       <Navbar />
  //       <LoginModal onSuccess={handleLoginSuccess} />
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* ADDED CONDITIONAL LOGIN MODAL */}
      {!isAuth && <LoginModal onSuccess={handleLoginSuccess} />}

      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <ClarityLogo className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            {!isLoadingCredits && <CreditDisplay credits={userCredits} />}
            {/* CHANGED: Show Login button when not authenticated, Logout when authenticated */}
            {isAuth ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Logout
              </Button>
            ) : (
              <Button
                onClick={handleShowLogin} // Use the new handler here
                variant="outline"
                size="sm"
                className="bg-transparent border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <Lock className="w-4 h-4 mr-2" /> {/* Added Lock icon */}
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-8 md:mb-12">
          <div className="flex justify-end mb-4">
            {/* CHANGED: Show Login button when not authenticated, Logout when authenticated */}
            {isAuth ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button
                onClick={handleShowLogin} // Use the new handler here
                variant="outline"
                size="sm"
                className="bg-transparent border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <Lock className="w-4 h-4 mr-2" /> {/* Added Lock icon */}
                Login
              </Button>
            )}
          </div>
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            AI-Powered Enhancement
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">Enhance Your Images</h1>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Choose between face-preserving, creative enhancement, experimental, or avatar generation modes
          </p>
        </div>

        {/* Category Selection */}
        <Card className="mb-6 hidden bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4 flex-wrap">
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
              <Button
                onClick={() => switchCategory("experimental")}
                variant={selectedCategory === "experimental" ? "default" : "outline"}
                className={
                  selectedCategory === "experimental"
                    ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white"
                    : "bg-transparent border-gray-700 text-gray-300 hover:border-cyan-500/50"
                }
              >
                🧪 Experimental
              </Button>
              <Button
                onClick={() => switchCategory("avatar")}
                variant={selectedCategory === "avatar" ? "default" : "outline"}
                className={
                  selectedCategory === "avatar"
                    ? "bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white"
                    : "bg-transparent border-gray-700 text-gray-300 hover:border-pink-500/50"
                }
              >
                🎭 Avatar Generator
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <Card className="bg-[#0f0e0d] border border-[#2a241d]">
            <CardHeader className="space-y-3">
              <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Public Presets
              </CardTitle>
              <p className="text-sm text-gray-400">
                Four simplified presets for the public landing, with the full preset library kept in the app for internal routing.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {PUBLIC_PRESET_ORDER.map((presetKey) => {
                  const preset = PUBLIC_PRESET_DETAILS[presetKey]
                  const isActive = selectedPublicPreset === presetKey
                  return (
                    <button
                      key={presetKey}
                      onClick={() => {
                        setSelectedPublicPreset(presetKey)
                        setSelectedCategory(preset.category)
                        applyPreset(preset.recommendedPresetId)
                      }}
                      className={`p-5 border text-left transition-colors ${
                        isActive
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-gray-800 bg-gray-900/60 hover:border-amber-500/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80">{presetKey.replaceAll("_", " ")}</p>
                          <h3 className="text-lg font-medium text-white">{preset.title}</h3>
                          <p className="text-sm text-gray-400 leading-6">{preset.description}</p>
                        </div>
                        {isActive && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {PUBLIC_PRESET_DETAILS[presetKey].category && (
                          <span className="text-[11px] uppercase tracking-[0.2em] text-gray-300 bg-white/5 px-2 py-1">
                            {PUBLIC_PRESET_DETAILS[presetKey].category}
                          </span>
                        )}
                        <span className="text-[11px] uppercase tracking-[0.2em] text-amber-300 bg-amber-500/10 px-2 py-1">
                          Recommended
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Presets */}
        <Card
          className={`mb-8 hidden ${
            selectedCategory === "faces"
              ? "bg-gradient-to-br from-amber-500/5 to-rose-500/5 border-amber-500/20"
              : selectedCategory === "abstract"
                ? "bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20"
                : selectedCategory === "experimental"
                  ? "bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border-cyan-500/20"
                  : "bg-gradient-to-br from-pink-500/5 to-orange-500/5 border-pink-500/20"
          }`}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
              <Sparkles
                className={`w-5 h-5 ${
                  selectedCategory === "faces"
                    ? "text-amber-400"
                    : selectedCategory === "abstract"
                      ? "text-purple-400"
                      : selectedCategory === "experimental"
                        ? "text-cyan-400"
                        : "text-pink-400"
                }`}
              />
              {selectedCategory === "faces"
                ? "Face Enhancement Presets"
                : selectedCategory === "abstract"
                  ? "Creative Enhancement Presets"
                  : selectedCategory === "experimental"
                    ? "Experimental Presets"
                    : "Avatar Generation Presets"}
            </CardTitle>
            <p className="text-sm text-gray-400">
              {selectedCategory === "faces"
                ? "Optimized for portraits, weddings, and people photos"
                : selectedCategory === "abstract"
                  ? "Optimized for landscapes, products, and artistic images"
                  : selectedCategory === "experimental"
                    ? "Cutting-edge presets that push creative boundaries - use with caution!"
                    : "Transform your photo into unique avatar styles - perfect for profile pictures and creative expression"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedPresetId === preset.id
                      ? selectedCategory === "faces"
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                        : selectedCategory === "abstract"
                          ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                          : selectedCategory === "experimental"
                            ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                            : "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{preset.icon}</span>
                        <h3 className="text-base md:text-lg font-bold text-white">{preset.name}</h3>
                      </div>
                      {selectedPresetId === preset.id && (
                        <CheckCircle2
                          className={`w-6 h-6 ${
                            selectedCategory === "faces"
                              ? "text-amber-400"
                              : selectedCategory === "abstract"
                                ? "text-purple-400"
                                : selectedCategory === "experimental"
                                  ? "text-cyan-400"
                                  : "text-pink-400"
                          }`}
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
                              : selectedCategory === "abstract"
                                ? "bg-purple-500/20 text-purple-300 text-xs"
                                : selectedCategory === "experimental"
                                  ? "bg-cyan-500/20 text-cyan-300 text-xs"
                                  : "bg-pink-500/20 text-pink-300 text-xs"
                          }
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    {selectedPresetId === preset.id && (
                      <div
                        className={`mt-3 pt-3 border-t ${
                          selectedCategory === "faces"
                            ? "border-amber-500/20"
                            : selectedCategory === "abstract"
                              ? "border-purple-500/20"
                              : selectedCategory === "experimental"
                                ? "border-cyan-500/20"
                                : "border-pink-500/20"
                        }`}
                      >
                        <div
                          className={`text-xs space-y-1 ${
                            selectedCategory === "faces"
                              ? "text-amber-400"
                              : selectedCategory === "abstract"
                                ? "text-purple-400"
                                : selectedCategory === "experimental"
                                  ? "text-cyan-400"
                                  : "text-pink-400"
                          }`}
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
              <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                <Zap className="w-5 h-5 text-amber-400" />
                Advanced Settings
              </CardTitle>
              <p className="text-sm text-gray-400">Fine-tune the enhancement parameters</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      Upscale Factor
                      {!isPaidUser && (
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          PRO
                        </span>
                      )}
                    </span>
                    <span className="text-amber-400">{settings.upscaleFactor}x</span>
                  </label>
                  <Slider
                    value={[settings.upscaleFactor]}
                    onValueChange={(value) => {
                      if (!isPaidUser) {
                        setError("Higher upscale factors (3x, 4x) require credits. Please purchase credits to unlock.")
                        return
                      }
                      setSettings((prev) => ({ ...prev, upscaleFactor: value[0] }))
                    }}
                    min={2}
                    max={isPaidUser ? 4 : 2}
                    step={1}
                    className={`w-full ${!isPaidUser ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={!isPaidUser}
                  />
                  <div className="flex items-center justify-between text-xs">
                    {!isPaidUser ? (
                      <span className="text-amber-400">Purchase credits to unlock 3x and 4x upscaling</span>
                    ) : (
                      <span className="text-gray-500">Higher = larger output (slower)</span>
                    )}
                  </div>
                </div>

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
                    {selectedCategory === "faces"
                      ? "0.25-0.4 for faces"
                      : selectedCategory === "abstract"
                        ? "0.5-0.85 for creative"
                        : selectedCategory === "avatar"
                          ? "0.6-0.8 for avatars"
                          : "0.7-1.0 for experimental"}
                  </p>
                </div>

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
                    {selectedCategory === "faces"
                      ? "0.75-0.85 preserves features"
                      : selectedCategory === "abstract"
                        ? "0.4-0.7 for creativity"
                        : selectedCategory === "avatar"
                          ? "0.7-0.9 for avatars"
                          : "0.5-0.8 for experimental"}
                  </p>
                </div>

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
                    {selectedCategory === "faces"
                      ? "0-0.1 for portraits"
                      : selectedCategory === "abstract"
                        ? "0.3-0.5 for landscapes"
                        : selectedCategory === "avatar"
                          ? "0.1-0.3 for avatars"
                          : "0.2-0.4 for experimental"}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                    <span>Tiling Width (Fractality)</span>
                    <span className="text-amber-400">{settings.tilingWidth}</span>
                  </label>
                  <Slider
                    value={[settings.tilingWidth]}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, tilingWidth: value[0] }))}
                    min={16}
                    max={256}
                    step={16}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Lower = higher fractality, more detail (slower)</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                    <span>Tiling Height (Fractality)</span>
                    <span className="text-amber-400">{settings.tilingHeight}</span>
                  </label>
                  <Slider
                    value={[settings.tilingHeight]}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, tilingHeight: value[0] }))}
                    min={16}
                    max={256}
                    step={16}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Lower = higher fractality, more detail (slower)</p>
                </div>
              </div>

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
                    : selectedCategory === "abstract"
                      ? "AI will generate prompts based on your creativity level"
                      : selectedCategory === "avatar"
                        ? "AI will generate prompts that enhance avatar features and artistic style"
                        : "AI will generate experimental prompts pushing artistic boundaries"}
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
              : selectedCategory === "abstract"
                ? "mb-8 bg-purple-500/5 border-purple-500/20"
                : selectedCategory === "experimental"
                  ? "mb-8 bg-cyan-500/5 border-cyan-500/20"
                  : "mb-8 bg-pink-500/5 border-pink-500/20"
          }
        >
          <CardContent className="p-4 flex items-start gap-3">
            <Info
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                selectedCategory === "faces"
                  ? "text-blue-400"
                  : selectedCategory === "abstract"
                    ? "text-purple-400"
                    : selectedCategory === "experimental"
                      ? "text-cyan-400"
                      : "text-pink-400"
              }`}
            />
            <div className="text-sm">
              {selectedCategory === "faces" ? (
                <>
                  <p className="font-medium mb-1 text-blue-300">Face Preservation Active</p>
                  <p className="text-blue-400/80">
                    These settings preserve facial features, skin tones, and cultural details without modification.
                    Perfect for portraits, weddings, and family photos.
                  </p>
                </>
              ) : selectedCategory === "abstract" ? (
                <>
                  <p className="font-medium mb-1 text-purple-300">Creative Enhancement Mode</p>
                  <p className="text-purple-400/80">
                    Higher creativity settings allow for artistic interpretation and dramatic improvements. Perfect for
                    landscapes, products, and abstract images.
                  </p>
                </>
              ) : selectedCategory === "experimental" ? (
                <>
                  <p className="font-medium mb-1 text-cyan-300">⚠️ Experimental Mode Active</p>
                  <p className="text-cyan-400/80">
                    These cutting-edge presets push AI to its limits with extreme creativity and unique effects. Results
                    may be unpredictable but often spectacular. Best for artistic exploration and creative projects.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1 text-pink-300">🎭 Avatar Generation Mode</p>
                  <p className="text-pink-400/80">
                    Transform your photo into unique avatar styles using facial analysis. Use camera capture or upload a
                    photo, then choose from 8 creative avatar styles. Perfect for profile pictures, social media, and
                    creative expression!
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 bg-red-500/10 border-red-500/50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {uploadErrors.length > 0 && (
          <Card className="mb-6 bg-red-500/10 border-red-500/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h3 className="text-sm font-medium text-red-400">Upload Errors ({uploadErrors.length})</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadErrors([])}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 text-xs"
                >
                  Dismiss All
                </Button>
              </div>
              {uploadErrors.map((error) => (
                <div key={error.id} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-red-400">{error.error}</p>
                      <p className="text-xs text-red-400/80">{error.tip}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadErrors((prev) => prev.filter((e) => e.id !== error.id))}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Column 1: Uploaded */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Uploaded
                <Badge className="bg-blue-500/20 text-blue-300">{uploadedFiles.length}</Badge>
              </CardTitle>
              {uploadedFiles.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="bg-transparent border-gray-700 hover:border-amber-500/50 text-gray-300 text-xs"
                  >
                    <Checkbox
                      checked={selectedFiles.size === uploadedFiles.length && uploadedFiles.length > 0}
                      className="mr-2"
                    />
                    {selectedFiles.size === uploadedFiles.length ? "Deselect All" : "Select All"}
                  </Button>
                  {selectedFiles.size > 0 && (
                    <Button
                      onClick={handleEnhance}
                      disabled={isProcessing}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Enhance ({selectedFiles.size})
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {selectedCategory === "avatar" && (
                <Card className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 border-pink-500/30">
                  <CardContent className="p-4 space-y-3">
                    {error && error.includes("Camera") && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm text-red-400 font-medium">{error}</p>
                            <p className="text-xs text-red-400/80">
                              To enable camera access:
                              <br />
                              1. Click the camera icon in your browser's address bar
                              <br />
                              2. Select "Allow" for camera permissions
                              <br />
                              3. Refresh the page and try again
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setError(null)}
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                    {!isCameraActive ? (
                      <Button
                        onClick={startCamera}
                        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo with Camera
                      </Button>
                    ) : (
                      <>
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{ display: "block" }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={capturePhoto}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Capture
                          </Button>
                          <Button
                            onClick={stopCamera}
                            variant="outline"
                            className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <VideoOff className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </CardContent>
                </Card>
              )}

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-amber-500 bg-amber-500/5" : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                <p className="text-sm text-gray-400">
                  {isDragActive
                    ? "Drop here..."
                    : selectedCategory === "avatar"
                      ? "Or upload a photo"
                      : "Drop or click to upload"}
                </p>
              </div>

              {/* Uploaded Files with Analysis */}
              {uploadedFiles.map((fileWithPreview, index) => {
                const isSelected = selectedFiles.has(index)
                const file = fileWithPreview.file
                const analysis = facialAnalysisResults.get(file.name)
                const aspectRatio = imageAspectRatios.get(index) || 1

                return (
                  <div key={index} className="space-y-2">
                    <Card
                      className={`bg-gray-800/50 transition-all ${
                        isSelected ? "border-amber-500 ring-2 ring-amber-500/20" : "border-gray-700"
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleFileSelection(index)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div
                          className={`${getAspectRatioClass(index)} relative bg-gray-900 rounded overflow-hidden cursor-pointer`}
                          onClick={() => toggleFileSelection(index)}
                        >
                          <img
                            src={fileWithPreview.preview || "/placeholder.svg"}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`[v0] Failed to load image: ${file.name}`)
                              e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                            }}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-amber-400" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {uploadedFilesWithAnalysis[index]?.isAnalyzing && (
                      <Card className="bg-purple-500/10 border-purple-500/30">
                        <CardContent className="p-3 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                          <span className="text-sm text-purple-300">Analyzing facial features...</span>
                        </CardContent>
                      </Card>
                    )}

                    {analysis && (
                      <FacialAnalysisCard
                        analysis={analysis}
                        selectedCategory={selectedCategory}
                        selectedPreset={ALL_PRESETS[selectedPresetId]?.name || ""}
                      />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Column 2: Processing - with retry button */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                Processing
                <Badge className="bg-amber-500/20 text-amber-300">{processingImages.length}</Badge>
              </CardTitle>
              {processingImages.length > 0 && isProcessing && (
                <p className="text-xs text-amber-400/80">
                  Processing {processingImages.length} image{processingImages.length > 1 ? "s" : ""}...
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {processingImages.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowRight className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500">Images will appear here during enhancement</p>
                </div>
              ) : (
                processingImages.map((img) => (
                  <Card
                    key={img.id}
                    className={`bg-gray-800/50 ${
                      img.status.includes("Error") || img.status.includes("failed")
                        ? "border-red-500/30"
                        : "border-amber-500/30"
                    }`}
                  >
                    <CardContent className="p-3 space-y-3">
                      <div
                        className={`${getAspectRatioClass(processingImages.findIndex((p) => p.id === img.id))} relative bg-gray-900 rounded overflow-hidden`}
                      >
                        <img
                          src={img.preview || "/placeholder.svg"}
                          alt="Processing"
                          className={`w-full h-full ${shouldUseContain(processingImages.findIndex((p) => p.id === img.id)) ? "object-contain" : "object-cover"}`}
                        />
                        {!img.status.includes("Error") && !img.status.includes("failed") && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                          </div>
                        )}
                        {(img.status.includes("Error") || img.status.includes("failed")) && (
                          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={
                              img.status.includes("Error") || img.status.includes("failed")
                                ? "text-red-400"
                                : "text-gray-400"
                            }
                          >
                            {img.status}
                          </span>
                          <span className="text-amber-400">{img.progress}%</span>
                        </div>
                        <Progress value={img.progress} className="h-1" />
                        <p className="text-xs text-gray-500 truncate">{img.file.name}</p>
                        {(img.status.includes("Error") || img.status.includes("failed")) && (
                          <Button
                            onClick={() => retryProcessing(img.id)}
                            size="sm"
                            variant="outline"
                            className="w-full bg-transparent border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs h-7"
                          >
                            <Loader2 className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Column 3: Processed - with download state */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Processed
                <Badge className="bg-green-500/20 text-green-300">{enhancedImages.length}</Badge>
              </CardTitle>
              {enhancedImages.length > 0 && processingImages.length > 0 && (
                <p className="text-xs text-green-400/80 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  You can download ready images while others are processing
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {enhancedImages.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500">Enhanced images will appear here</p>
                </div>
              ) : (
                enhancedImages.map((img) => (
                  <Card key={img.id} className="bg-gray-800/50 border-green-500/30">
                    <CardContent className="p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Original</p>
                          <div className="aspect-square relative bg-gray-900 rounded overflow-hidden">
                            <img
                              src={img.originalPreview || "/placeholder.svg"}
                              alt="Original"
                              className="w-full h-full object-cover"
                              onError={() => console.error("[v0] Failed to load original preview")}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-green-400">Enhanced</p>
                          <div className="aspect-square relative bg-gray-900 rounded overflow-hidden">
                            {img.imageError ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 border border-red-500/30 rounded">
                                <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                                <p className="text-xs text-red-400 text-center px-2">Failed to load</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEnhancedImages((prev) =>
                                      prev.map((i) => (i.id === img.id ? { ...i, imageError: false } : i)),
                                    )
                                  }}
                                  className="mt-2 text-xs h-6 bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  Retry
                                </Button>
                              </div>
                            ) : (
                              <img
                                src={img.enhanced || "/placeholder.svg"}
                                alt="Enhanced"
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(img.id)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{img.original.name}</p>
                      {img.imageError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded p-2 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-400">
                            Image URL expired. Download immediately after processing to avoid this.
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => downloadImage(img.enhanced, img.original.name, img.id)}
                          size="sm"
                          className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 text-xs h-8"
                          disabled={img.imageError || downloadingImages.has(img.id)}
                        >
                          {downloadingImages.has(img.id) ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEnhancedImage(img.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">18 Specialized Presets</h3>
              <p className="text-sm text-gray-400">
                6 for faces, 6 for creative work, 6 experimental, and 6 for avatars - each optimized for specific use
                cases
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
                Face mode preserves features, Creative & Experimental modes allow artistic freedom, Avatar mode
                transforms your photos.
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
