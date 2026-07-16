"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Metadata } from "next"
import { useRouter } from "next/navigation"
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
  PUBLIC_PRESET_SETTINGS,
  getPresetsByCategory,
  getSettingsForMode,
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
import { useAuth, logout } from "@/lib/auth" // Added for authentication
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
  const router = useRouter()
  const { user: authUser, loading: isCheckingAuth } = useAuth()
  const isAuth = !!authUser

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
    creativity: 0.1,
    resemblance: 3,
    hdr: 0.0,
    tilingWidth: 112,
    tilingHeight: 144,
  })
  const [showAdvanced, setShowAdvanced] = useState(true)
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

      const upscaleFactor = settings.upscaleFactor ?? 2
      formData.append("scale_factor", upscaleFactor.toString())
      formData.append("model", settings.model || "philz1337x/clarity-upscaler")

      const creativity = settings.creativity ?? 0
      const resemblance = settings.resemblance ?? 3
      formData.append("creativity", creativity.toString())
      formData.append("resemblance", resemblance.toString())

      const dynamic = settings.dynamic ?? 1
      formData.append("dynamic", dynamic.toString())

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
        // Derive credit cost from ENHANCEMENT_MODES to keep definitions in sync
        const creditCost = ENHANCEMENT_MODES.find((m) => m.factor === settings.upscaleFactor)?.credits ?? 6

        const deductResponse = await fetch("/api/credits/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: creditCost,
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
    // useAuth() reacts to Supabase onAuthStateChange automatically
    setShowLoginModal(false)
  }, [])

  const handleShowLogin = useCallback(() => {
    setShowLoginModal(true)
  }, [])

  const handleLogout = useCallback(async () => {
    await logout()
    window.location.href = "/"
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

  // Enhancement mode options (x2, x3, x4) mapped to upscaleFactor
  const ENHANCEMENT_MODES = [
    {
      label: "x2 Enhance",
      factor: 2,
      credits: 6,
      description: "Balanced enhancement. Closest to the original. Best for clean, modern images.",
    },
    {
      label: "x3 Restore",
      factor: 3,
      credits: 8,
      description: "Stronger restoration with improved detail and damage recovery.",
    },
    {
      label: "x4 Pro Restore",
      factor: 4,
      credits: 10,
      description: "Maximum detail and clarity. Best for highly damaged or degraded images.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ADDED CONDITIONAL LOGIN MODAL */}
      {!isAuth && showLoginModal && <LoginModal onSuccess={handleLoginSuccess} onClose={() => router.push("/")} />}

      <main className="mx-auto max-w-7xl px-4 lg:px-6 py-10">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Enhance <span className="text-[#c8963e]">Studio</span>
          </h1>
          <p className="mt-2 text-muted-foreground text-base">
            Professional AI enhancement for your most important images.
          </p>
        </div>

        {/* ── STEP 1: Choose a preset ── */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            1. Choose a <span className="text-[#c8963e]">preset</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PUBLIC_PRESET_ORDER.map((presetKey) => {
              const preset = PUBLIC_PRESET_DETAILS[presetKey]
              const isActive = selectedPublicPreset === presetKey
              const presetImages: Record<string, string> = {
                archive_scan: "/images/landing/L5-clean-before.png",
                asean_portrait_preserve: "/images/landing/L5-restore-before.png",
                heritage_restore: "/images/landing/L5-face-before.png",
                digital_art_upscale: "/images/landing/L5-cultural-before.png",
              }
              return (
                <button
                  key={presetKey}
                  onClick={() => {
                    setSelectedPublicPreset(presetKey)
                    setSelectedCategory(PUBLIC_PRESET_SETTINGS[presetKey].category)
                    const currentFactor = ([2, 3, 4].includes(settings.upscaleFactor) ? settings.upscaleFactor : 2) as 2 | 3 | 4
                    setSettings(getSettingsForMode(presetKey, currentFactor))
                  }}
                  className={`flex gap-0 border text-left transition-colors overflow-hidden ${
                    isActive
                      ? "border-[#c8963e] bg-[#c8963e]/5"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  {/* Image panel */}
                  <div className="relative w-32 shrink-0 bg-black overflow-hidden">
                    <img
                      src={presetImages[presetKey] || "/images/landing/L5-clean-before.png"}
                      alt={preset.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  {/* Text panel */}
                  <div className="flex-1 p-5 relative">
                    {isActive && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle2 className="w-5 h-5 text-[#c8963e]" />
                      </div>
                    )}
                    <h3 className="text-base font-semibold text-foreground mb-1">{preset.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{preset.description}</p>
                    <ul className="space-y-1">
                      {preset.bestFor.map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground/70">
                          <span className="text-[#c8963e] shrink-0 mt-0.5">—</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── STEP 2: Choose enhancement mode ── */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            2. Choose <span className="text-[#c8963e]">enhancement mode</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ENHANCEMENT_MODES.map((mode) => {
              const isActive = settings.upscaleFactor === mode.factor
              return (
                <button
                  key={mode.factor}
                  onClick={() => {
                    if (selectedPublicPreset) {
                      setSettings(getSettingsForMode(selectedPublicPreset, mode.factor as 2 | 3 | 4))
                    } else {
                      setSettings((prev) => ({ ...prev, upscaleFactor: mode.factor }))
                    }
                  }}
                  className={`relative p-6 border text-left transition-colors ${
                    isActive
                      ? "border-[#c8963e] bg-[#c8963e]/5"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="w-5 h-5 text-[#c8963e]" />
                    </div>
                  )}
                  <p className={`text-xl font-semibold mb-3 ${isActive ? "text-[#c8963e]" : "text-foreground"}`}>
                    {mode.label}
                  </p>
                  <p className="text-sm font-medium text-foreground mb-1">{mode.credits} credits</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{mode.description}</p>
                </button>
              )
            })}
          </div>
          {/* Info note */}
          <div className="mt-4 flex items-start gap-3 border border-white/10 bg-white/[0.02] px-4 py-3">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Two x2 passes usually stay closer to the original appearance and preserve a more natural look. A single x4 pass applies a stronger enhancement in one step and may introduce more AI-generated detail, while still remaining visually close to the original image.
            </p>
          </div>
        </section>

        {/* ── STEP 3: Upload image ── */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            3. Upload <span className="text-[#c8963e]">image</span>
          </h2>

          {/* Error messages */}
          {error && (
            <div className="mb-4 p-4 border border-red-500/30 bg-red-500/5 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400 text-lg leading-none">×</button>
            </div>
          )}

          {/* Upload errors */}
          {uploadErrors.map((ue) => (
            <div key={ue.id} className="mb-2 p-3 border border-red-500/20 bg-red-500/5 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-400 font-medium truncate">{ue.fileName}</p>
                <p className="text-xs text-red-400/70">{ue.tip}</p>
              </div>
              <button onClick={() => setUploadErrors((prev) => prev.filter((e) => e.id !== ue.id))} className="text-red-400/60 hover:text-red-400 text-lg leading-none shrink-0">×</button>
            </div>
          ))}

          {/* Pipeline: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* ── Column 1: Uploaded ── */}
            <div className="border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Uploaded</span>
                  {uploadedFiles.length > 0 && (
                    <span className="text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full">{uploadedFiles.length}</span>
                  )}
                </div>
                {uploadedFiles.length > 0 && (
                  <Button
                    onClick={handleEnhance}
                    disabled={selectedFiles.size === 0 || isProcessing}
                    size="sm"
                    className="bg-foreground text-background hover:bg-foreground/90 text-xs h-7 gap-1.5"
                  >
                    Process selected
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="p-3 space-y-2">
                {/* Select all row */}
                {uploadedFiles.length > 0 && (
                  <div className="flex items-center gap-2 px-1 pb-1">
                    <Checkbox
                      id="select-all"
                      checked={selectedFiles.size === uploadedFiles.length && uploadedFiles.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="border-white/20"
                    />
                    <label htmlFor="select-all" className="text-xs text-muted-foreground cursor-pointer">
                      Select all
                    </label>
                  </div>
                )}

                {/* Uploaded file rows */}
                {uploadedFiles.map((fileWithPreview, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2 border transition-colors ${
                      selectedFiles.has(idx) ? "border-[#c8963e]/40 bg-[#c8963e]/5" : "border-transparent hover:border-white/10"
                    }`}
                  >
                    <Checkbox
                      checked={selectedFiles.has(idx)}
                      onCheckedChange={() => toggleFileSelection(idx)}
                      className="border-white/20 shrink-0"
                    />
                    <div className="w-10 h-10 shrink-0 bg-white/5 overflow-hidden">
                      <img
                        src={fileWithPreview.preview}
                        alt={fileWithPreview.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{fileWithPreview.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(fileWithPreview.file.size / 1024 / 1024).toFixed(2)} MB · {fileWithPreview.file.type.split("/")[1].toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                      aria-label="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Dropzone */}
                <DropzoneArea
                  onDrop={onDrop}
                  getRootProps={getRootProps}
                  getInputProps={getInputProps}
                  isDragActive={isDragActive}
                />
              </div>
            </div>

            {/* ── Column 2: Processing ── */}
            <div className="border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <span className="text-sm font-medium text-foreground">Processing</span>
                {processingImages.length > 0 && (
                  <span className="text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full">{processingImages.length}</span>
                )}
              </div>
              <div className="p-3 space-y-3">
                {processingImages.length === 0 ? (
                  <div className="py-10 text-center">
                    <Loader2 className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Now enhancing</p>
                  </div>
                ) : (
                  processingImages.map((img) => (
                    <div key={img.id} className="border border-white/10 bg-white/[0.02] p-3 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 shrink-0 overflow-hidden bg-white/5">
                          <img src={img.preview} alt={img.file.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate font-medium">{img.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(img.file.size / 1024 / 1024).toFixed(2)} MB · {img.file.type.split("/")[1].toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          <span>Preset</span>{" "}
                          <span className="text-foreground">{PUBLIC_PRESET_DETAILS[selectedPublicPreset].title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span>Mode</span>{" "}
                          <span className="text-foreground">UPSCALE x{settings.upscaleFactor} (Balanced)</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{img.status}</span>
                          <span className="text-xs text-[#c8963e] font-medium">{img.progress}%</span>
                        </div>
                        <Progress value={img.progress} className="h-1 bg-white/10 [&>div]:bg-[#c8963e]" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Info className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                        <p className="text-xs text-muted-foreground/60">This may take a few moments.</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Column 3: Processed ── */}
            <div className="border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Processed</span>
                  {enhancedImages.length > 0 && (
                    <span className="text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full">{enhancedImages.length}</span>
                  )}
                </div>
                {enhancedImages.length > 1 && (
                  <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    Download all
                  </button>
                )}
              </div>
              <div className="p-3 space-y-3">
                {enhancedImages.length === 0 ? (
                  <div className="py-10 text-center">
                    <CheckCircle2 className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Ready</p>
                  </div>
                ) : (
                  enhancedImages.map((img) => (
                    <div key={img.id} className="border border-white/10 bg-white/[0.02] p-3 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 shrink-0"></span>
                        <span className="text-xs text-green-400 font-medium">Ready</span>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-16 h-16 shrink-0 overflow-hidden bg-white/5">
                          {img.imageError ? (
                            <div className="w-full h-full flex items-center justify-center bg-red-500/10">
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            </div>
                          ) : (
                            <img
                              src={img.enhanced}
                              alt={`Enhanced ${img.original.name}`}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(img.id)}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate font-medium">
                            {img.original.name.replace(/\.[^.]+$/, "")}_enhanced{img.original.name.match(/\.[^.]+$/) ?? ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {img.original.type.split("/")[1].toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => downloadImage(img.enhanced, img.original.name, img.id)}
                          disabled={img.imageError || downloadingImages.has(img.id)}
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs border-white/15 bg-transparent text-foreground hover:bg-white/5 gap-1.5"
                        >
                          {downloadingImages.has(img.id) ? (
                            <><Loader2 className="w-3 h-3 animate-spin" />Saving…</>
                          ) : (
                            <><Download className="w-3 h-3" />Download</>
                          )}
                        </Button>
                        <Button
                          onClick={() => window.open(img.enhanced, "_blank", "noopener,noreferrer")}
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-white/15 bg-transparent text-foreground hover:bg-white/5 gap-1.5 px-3"
                        >
                          <ImageIcon className="w-3 h-3" />
                          View
                        </Button>
                        <Button
                          onClick={() => removeEnhancedImage(img.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// ── Extracted Dropzone component to avoid hook-in-render issues ──
function DropzoneArea({
  onDrop,
  getRootProps,
  getInputProps,
  isDragActive,
}: {
  onDrop: (accepted: File[], rejected: any[]) => void
  getRootProps: () => Record<string, any>
  getInputProps: () => Record<string, any>
  isDragActive: boolean
}) {
  return (
    <div
      {...getRootProps()}
      className={`mt-2 border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? "border-[#c8963e] bg-[#c8963e]/5" : "border-white/10 hover:border-white/20"
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm font-medium text-foreground">Add more images</p>
      <p className="text-xs text-muted-foreground mt-1">Drag &amp; drop or click to upload</p>
      <p className="text-xs text-muted-foreground">JPG, PNG, TIFF up to 50MB</p>
    </div>
  )
}
