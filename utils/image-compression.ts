/**
 * Advanced image compression and optimization utilities
 * Handles large payloads by intelligently compressing images
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "jpeg" | "png" | "webp"
  progressive?: boolean
  preserveAspectRatio?: boolean
  maxFileSize?: number // in bytes
}

export interface CompressionResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  dimensions: { width: number; height: number }
  format: string
}

/**
 * Intelligent image compression that adapts based on image characteristics
 */
export async function compressImageIntelligently(
  file: File,
  targetMaxSize: number = 10 * 1024 * 1024, // 10MB default
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    img.onload = async () => {
      try {
        const originalSize = file.size
        const { width, height } = img

        // Calculate optimal dimensions based on file size and target
        const compressionNeeded = originalSize > targetMaxSize
        let scaleFactor = 1

        if (compressionNeeded) {
          // Calculate scale factor based on file size ratio
          const sizeRatio = Math.sqrt(targetMaxSize / originalSize)
          scaleFactor = Math.min(sizeRatio, 1)

          // Ensure minimum quality thresholds
          if (scaleFactor < 0.3) scaleFactor = 0.3
        }

        // Apply intelligent scaling
        const targetWidth = Math.round(width * scaleFactor)
        const targetHeight = Math.round(height * scaleFactor)

        canvas.width = targetWidth
        canvas.height = targetHeight

        // Use high-quality scaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        // Determine optimal format and quality
        const isPhoto = await isPhotographicImage(canvas, ctx)
        const hasTransparency = await hasImageTransparency(file)

        let format: "jpeg" | "png" | "webp" = "jpeg"
        let quality = 0.85

        if (hasTransparency) {
          format = "png"
          quality = 0.9
        } else if (isPhoto) {
          format = "jpeg"
          quality = compressionNeeded ? 0.75 : 0.85
        } else {
          // Graphics/illustrations work better with PNG
          format = "png"
          quality = 0.8
        }

        // Try WebP if supported and beneficial
        if (supportsWebP() && !hasTransparency) {
          const webpResult = await tryWebPCompression(canvas, quality)
          if (webpResult && webpResult.size < targetMaxSize) {
            const result: CompressionResult = {
              blob: webpResult,
              originalSize,
              compressedSize: webpResult.size,
              compressionRatio: originalSize / webpResult.size,
              dimensions: { width: targetWidth, height: targetHeight },
              format: "webp",
            }
            resolve(result)
            return
          }
        }

        // Fallback to JPEG/PNG with progressive quality reduction
        let finalBlob = await canvasToBlob(canvas, format, quality)
        let attempts = 0
        const maxAttempts = 5

        while (finalBlob.size > targetMaxSize && attempts < maxAttempts) {
          quality *= 0.8 // Reduce quality by 20% each attempt
          if (quality < 0.3) quality = 0.3 // Minimum quality threshold

          finalBlob = await canvasToBlob(canvas, format, quality)
          attempts++
        }

        const result: CompressionResult = {
          blob: finalBlob,
          originalSize,
          compressedSize: finalBlob.size,
          compressionRatio: originalSize / finalBlob.size,
          dimensions: { width: targetWidth, height: targetHeight },
          format,
        }

        resolve(result)
        URL.revokeObjectURL(img.src)
      } catch (error) {
        reject(error)
        URL.revokeObjectURL(img.src)
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Multi-stage compression for extremely large images
 */
export async function compressLargeImageInStages(
  file: File,
  targetSize: number = 10 * 1024 * 1024,
): Promise<CompressionResult> {
  const originalSize = file.size

  // Stage 1: Initial compression if file is very large (>50MB)
  let currentFile = file
  if (originalSize > 50 * 1024 * 1024) {
    console.log("🔄 Stage 1: Initial compression for very large file")
    const stage1Result = await compressImageIntelligently(currentFile, 25 * 1024 * 1024)
    currentFile = new File([stage1Result.blob], file.name, { type: stage1Result.blob.type })
  }

  // Stage 2: Target compression
  console.log("🔄 Stage 2: Target compression")
  const finalResult = await compressImageIntelligently(currentFile, targetSize)

  // Update original size reference
  finalResult.originalSize = originalSize
  finalResult.compressionRatio = originalSize / finalResult.compressedSize

  return finalResult
}

/**
 * Chunk-based upload for very large files
 */
export async function uploadInChunks(
  file: File,
  chunkSize: number = 5 * 1024 * 1024, // 5MB chunks
  onProgress?: (progress: number) => void,
): Promise<string> {
  const totalChunks = Math.ceil(file.size / chunkSize)
  const uploadId = generateUploadId()

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize
    const end = Math.min(start + chunkSize, file.size)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append("chunk", chunk)
    formData.append("chunkIndex", chunkIndex.toString())
    formData.append("totalChunks", totalChunks.toString())
    formData.append("uploadId", uploadId)
    formData.append("fileName", file.name)

    const response = await fetch("/api/upload-chunk", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.statusText}`)
    }

    const progress = ((chunkIndex + 1) / totalChunks) * 100
    onProgress?.(progress)
  }

  return uploadId
}

// Helper functions
async function isPhotographicImage(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<boolean> {
  const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100))
  const pixels = imageData.data

  let colorVariance = 0
  let edgeCount = 0

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]

    // Calculate color variance
    const avg = (r + g + b) / 3
    colorVariance += Math.abs(r - avg) + Math.abs(g - avg) + Math.abs(b - avg)

    // Simple edge detection
    if (i > imageData.width * 4) {
      const prevR = pixels[i - imageData.width * 4]
      const diff = Math.abs(r - prevR)
      if (diff > 30) edgeCount++
    }
  }

  const avgColorVariance = colorVariance / (pixels.length / 4)
  const edgeRatio = edgeCount / (pixels.length / 4)

  // Photos typically have higher color variance and more gradual edges
  return avgColorVariance > 20 && edgeRatio < 0.1
}

async function hasImageTransparency(file: File): Promise<boolean> {
  return file.type === "image/png" || file.type === "image/gif"
}

function supportsWebP(): boolean {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0
}

async function tryWebPCompression(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", quality)
  })
}

async function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Failed to create blob"))
        }
      },
      `image/${format}`,
      quality,
    )
  })
}

function generateUploadId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Progressive image loading for large files
 */
export async function createProgressivePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    img.onload = () => {
      // Create a small preview (max 400px)
      const maxSize = 400
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)

      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob))
          } else {
            reject(new Error("Failed to create preview"))
          }
        },
        "image/jpeg",
        0.7,
      )

      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      reject(new Error("Failed to load image for preview"))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}
