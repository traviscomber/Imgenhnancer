/**
 * Client-side image compression for mobile photos before upload
 */
export async function compressImageForUpload(file: File | Blob, maxSizeMB: number): Promise<File> {
  const fileSizeKB = file.size / 1024
  console.log(`[v0] File size: ${Math.round(fileSizeKB)}KB`)

  // If file is already under 5MB, return as-is
  if (fileSizeKB < 5120) {
    // 5MB threshold
    console.log(`[v0] File is already small enough, skipping compression`)
    if (file instanceof File) {
      return file
    } else {
      return new File([file], "image.jpg", { type: "image/jpeg" })
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    let objectUrl: string | null = null

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }
    }

    img.onload = () => {
      try {
        console.log(`[v0] Image loaded successfully: ${img.width}x${img.height}`)

        const aspectRatio = img.width / img.height
        const isEquirectangular = aspectRatio >= 1.8 && aspectRatio <= 2.2
        const isPanoramic = aspectRatio > 2.2

        console.log(
          `[v0] Aspect ratio: ${aspectRatio.toFixed(2)}${isEquirectangular ? " (equirectangular)" : isPanoramic ? " (panoramic)" : ""}`,
        )

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          cleanup()
          if (file instanceof File) {
            resolve(file)
          } else {
            reject(new Error("Failed to get canvas context"))
          }
          return
        }

        let width = img.width
        let height = img.height

        const maxDimension = isEquirectangular || isPanoramic ? 4096 : 2048

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }

        console.log(`[v0] Resizing to: ${Math.round(width)}x${Math.round(height)}`)

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        const quality = isEquirectangular || isPanoramic ? 0.9 : 0.85

        canvas.toBlob(
          (blob) => {
            cleanup()

            if (!blob) {
              if (file instanceof File) {
                resolve(file)
              } else {
                reject(new Error("Failed to create blob"))
              }
              return
            }

            const compressedFile = new File([blob], file instanceof File ? file.name : "compressed.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            })

            console.log(
              `✅ Compression complete: ${Math.round(file.size / 1024)}KB → ${Math.round(compressedFile.size / 1024)}KB`,
            )

            resolve(compressedFile)
          },
          "image/jpeg",
          quality,
        )
      } catch (error: any) {
        cleanup()
        console.error("[v0] Compression error:", error)
        if (file instanceof File) {
          resolve(file)
        } else {
          reject(error)
        }
      }
    }

    img.onerror = (event) => {
      cleanup()
      console.error("[v0] Image load error:", event)
      if (file instanceof File) {
        console.log("[v0] Returning original file as fallback")
        resolve(file)
      } else {
        reject(new Error("Failed to load image for compression"))
      }
    }

    try {
      objectUrl = URL.createObjectURL(file)
      console.log(`[v0] Created object URL for file: ${file instanceof File ? file.name : "blob"}`)
      img.src = objectUrl
    } catch (error: any) {
      cleanup()
      console.error("[v0] Failed to create object URL:", error)
      if (file instanceof File) {
        resolve(file)
      } else {
        reject(error)
      }
    }
  })
}

export interface EnhancementToggles {
  pre: {
    deblock: "off" | "low" | "medium"
    denoise: "off" | "low" | "medium"
    whiteBalance: "off" | "auto"
  }
  post: {
    localContrast: "off" | "low" | "medium"
    sharpen: "off" | "low" | "medium"
    grain: "off" | "very-low" | "low"
  }
}

export interface ImageProcessingSettings {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
  denoise: number
  grain: number
  vignette: number
  autoWhiteBalance: boolean
  autoLevels: boolean
  model: string
  upscaleFactor: number
}

export interface ImageStats {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
  hasNoise: boolean
  needsWhiteBalance: boolean
}

/**
 * Compress image to reduce file size before API upload
 */
export async function compressImage(file: File | Blob, maxSizeKB = 1024): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      try {
        // Calculate new dimensions to keep under size limit
        let { width, height } = img
        const maxDimension = 2048 // Max dimension for API

        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Try different quality levels until we get under the size limit
        const tryCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                URL.revokeObjectURL(objectUrl)
                reject(new Error("Failed to compress image"))
                return
              }

              const sizeKB = blob.size / 1024
              console.log(`🔄 Compressed to ${Math.round(sizeKB)}KB at quality ${quality}`)

              if (sizeKB <= maxSizeKB || quality <= 0.3) {
                console.log(`✅ Final compressed size: ${Math.round(sizeKB)}KB`)
                URL.revokeObjectURL(objectUrl)
                resolve(blob)
              } else {
                // Try lower quality
                tryCompress(quality - 0.1)
              }
            },
            "image/jpeg",
            quality,
          )
        }

        // Start with high quality and reduce if needed
        tryCompress(0.9)
      } catch (error) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error(`Image compression failed: ${error instanceof Error ? error.message : "Unknown error"}`))
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load image for compression"))
    }

    img.crossOrigin = "anonymous"
    img.src = objectUrl
  })
}

/**
 * Pre-process image before AI enhancement
 */
export async function preProcessImage(file: File | Blob, settings: EnhancementToggles["pre"]): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Canvas context not available"))
      return
    }

    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      try {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Apply deblocking (JPEG artifact reduction)
        if (settings.deblock !== "off") {
          const strength = settings.deblock === "low" ? 0.3 : 0.6
          applyDeblock(data, canvas.width, canvas.height, strength)
        }

        // Apply denoising
        if (settings.denoise !== "off") {
          const strength = settings.denoise === "low" ? 0.2 : 0.4
          applyDenoise(data, canvas.width, canvas.height, strength)
        }

        // Apply white balance correction
        if (settings.whiteBalance === "auto") {
          applyAutoWhiteBalance(data)
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl)
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob from canvas"))
            }
          },
          "image/jpeg",
          0.95,
        )
      } catch (error) {
        URL.revokeObjectURL(objectUrl)
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load image"))
    }

    img.crossOrigin = "anonymous"
    img.src = objectUrl
  })
}

/**
 * Post-process enhanced image
 */
export async function postProcessImage(blob: Blob, settings: EnhancementToggles["post"]): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Canvas context not available"))
      return
    }

    const objectUrl = URL.createObjectURL(blob)

    img.onload = () => {
      try {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Apply local contrast enhancement
        if (settings.localContrast !== "off") {
          const strength = settings.localContrast === "low" ? 0.3 : 0.6
          applyLocalContrast(data, canvas.width, canvas.height, strength)
        }

        // Apply sharpening
        if (settings.sharpen !== "off") {
          const strength = settings.sharpen === "low" ? 0.5 : 1.0
          applySharpen(data, canvas.width, canvas.height, strength)
        }

        // Add film grain
        if (settings.grain !== "off") {
          const strength = settings.grain === "very-low" ? 0.1 : 0.2
          applyGrain(data, strength)
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl)
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob from canvas"))
            }
          },
          "image/jpeg",
          0.95,
        )
      } catch (error) {
        URL.revokeObjectURL(objectUrl)
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Failed to load image"))
    }

    img.crossOrigin = "anonymous"
    img.src = objectUrl
  })
}

/**
 * Analyze image to determine optimal processing parameters
 */
export function analyzeImage(canvas: HTMLCanvasElement): ImageStats {
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  let totalBrightness = 0
  let totalSaturation = 0
  let rSum = 0,
    gSum = 0,
    bSum = 0
  let minBrightness = 255,
    maxBrightness = 0
  let edgeStrength = 0

  const pixelCount = data.length / 4

  // Analyze each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Calculate brightness
    const brightness = (r + g + b) / 3
    totalBrightness += brightness
    minBrightness = Math.min(minBrightness, brightness)
    maxBrightness = Math.max(maxBrightness, brightness)

    // Calculate saturation
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max > 0 ? (max - min) / max : 0
    totalSaturation += saturation

    // Sum for white balance
    rSum += r
    gSum += g
    bSum += b
  }

  // Calculate averages
  const avgBrightness = totalBrightness / pixelCount
  const avgSaturation = totalSaturation / pixelCount
  const contrast = maxBrightness - minBrightness

  // Detect if white balance is needed
  const rAvg = rSum / pixelCount
  const gAvg = gSum / pixelCount
  const bAvg = bSum / pixelCount
  const colorBalance = Math.max(rAvg, gAvg, bAvg) - Math.min(rAvg, gAvg, bAvg)
  const needsWhiteBalance = colorBalance > 20

  // Simple edge detection for sharpness
  const sampleSize = Math.min(1000, pixelCount / 4)
  for (let i = 0; i < sampleSize; i++) {
    const idx = Math.floor(Math.random() * (data.length - 8)) & ~3
    if (idx + 4 < data.length) {
      const curr = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      const next = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3
      edgeStrength += Math.abs(curr - next)
    }
  }

  const sharpness = edgeStrength / sampleSize
  const hasNoise = sharpness > 15 // High edge variation suggests noise

  return {
    brightness: avgBrightness / 255,
    contrast: contrast / 255,
    saturation: avgSaturation,
    sharpness: Math.min(sharpness / 30, 1),
    hasNoise,
    needsWhiteBalance,
  }
}

// Generate optimal settings based on image analysis
export function generateOptimalSettings(
  stats: ImageStats,
  baseSettings: Partial<ImageProcessingSettings> = {},
): ImageProcessingSettings {
  const optimal: ImageProcessingSettings = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    denoise: 0,
    grain: 0,
    vignette: 0,
    autoWhiteBalance: false,
    autoLevels: false,
    model: "clarity-upscaler",
    upscaleFactor: 2,
    ...baseSettings,
  }

  // Adjust brightness if too dark or bright
  if (stats.brightness < 0.3) {
    optimal.brightness = Math.min(30, (0.3 - stats.brightness) * 100)
  } else if (stats.brightness > 0.7) {
    optimal.brightness = Math.max(-20, (0.7 - stats.brightness) * 100)
  }

  // Adjust contrast if too flat
  if (stats.contrast < 0.5) {
    optimal.contrast = Math.min(25, (0.5 - stats.contrast) * 50)
  }

  // Adjust saturation if too dull
  if (stats.saturation < 0.3) {
    optimal.saturation = Math.min(20, (0.3 - stats.saturation) * 67)
  }

  // Apply sharpening if image is soft
  if (stats.sharpness < 0.4) {
    optimal.sharpness = Math.min(15, (0.4 - stats.sharpness) * 37.5)
  }

  // Apply denoising if noisy
  if (stats.hasNoise) {
    optimal.denoise = 10
  }

  // Enable auto white balance if needed
  optimal.autoWhiteBalance = stats.needsWhiteBalance

  // Enable auto levels for low contrast images
  optimal.autoLevels = stats.contrast < 0.3

  return optimal
}

// Process image with all settings
export function processImage(canvas: HTMLCanvasElement, settings: ImageProcessingSettings): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  try {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Apply auto adjustments first
    if (settings.autoWhiteBalance) {
      imageData = applyAutoWhiteBalance(imageData.data)
    }

    if (settings.autoLevels) {
      imageData = applyAutoLevels(imageData.data)
    }

    // Apply basic adjustments
    if (settings.brightness !== 0) {
      imageData = applyBrightness(imageData.data, settings.brightness)
    }

    if (settings.contrast !== 0) {
      imageData = applyContrast(imageData.data, settings.contrast)
    }

    if (settings.saturation !== 0) {
      imageData = applySaturation(imageData.data, settings.saturation)
    }

    // Apply grain before putting back to canvas
    if (settings.grain > 0) {
      imageData = applyGrain(imageData.data, settings.grain)
    }

    // Put processed data back to canvas
    ctx.putImageData(imageData, 0, 0)

    // Apply effects that work on canvas directly
    if (settings.sharpness > 0) {
      applyCanvasSharpen(canvas, settings.sharpness)
    }

    if (settings.denoise > 0) {
      applyCanvasDenoise(canvas, settings.denoise)
    }

    if (settings.vignette > 0) {
      applyVignette(canvas, settings.vignette)
    }
  } catch (error) {
    console.error("Error processing image:", error)
    throw error
  }
}

// Function declaration for applyCanvasSharpen
function applyCanvasSharpen(canvas: HTMLCanvasElement, strength: number): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ]
  const factor = strength / 100

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        let sum = 0

        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const pixelIdx = ((y + ky - 1) * width + (x + kx - 1)) * 4 + c
            sum += data[pixelIdx] * kernel[ky][kx]
          }
        }

        const original = data[idx + c]
        const sharpened = sum
        data[idx + c] = Math.min(255, Math.max(0, original * (1 - factor) + sharpened * factor))
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// Function declaration for applyCanvasDenoise
function applyCanvasDenoise(canvas: HTMLCanvasElement, strength: number): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const threshold = strength === 10 ? 15 : 25

  // Bilateral-like filter for noise reduction
  for (let y = 1; y < imageData.height - 1; y++) {
    for (let x = 1; x < imageData.width - 1; x++) {
      const idx = (y * imageData.width + x) * 4

      for (let c = 0; c < 3; c++) {
        const current = data[idx + c]
        let sum = current
        let count = 1

        // Check 8-connected neighbors
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue

            const nIdx = ((y + dy) * imageData.width + (x + dx)) * 4 + c
            const neighbor = data[nIdx]

            // Only average with similar pixels (noise reduction)
            if (Math.abs(current - neighbor) < threshold) {
              sum += neighbor
              count++
            }
          }
        }

        data[idx + c] = Math.round(sum / count)
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Apply brightness adjustment
 */
function applyBrightness(data: Uint8ClampedArray, amount: number): ImageData {
  const adjustment = (amount / 100) * 255

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + adjustment)) // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment)) // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment)) // B
  }

  return new ImageData(data, Math.sqrt(data.length / 4), Math.sqrt(data.length / 4))
}

/**
 * Apply contrast adjustment
 */
function applyContrast(data: Uint8ClampedArray, amount: number): ImageData {
  const factor = (259 * (amount + 255)) / (255 * (259 - amount))

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128)) // R
    data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128)) // G
    data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128)) // B
  }

  return new ImageData(data, Math.sqrt(data.length / 4), Math.sqrt(data.length / 4))
}

/**
 * Apply saturation adjustment
 */
function applySaturation(data: Uint8ClampedArray, amount: number): ImageData {
  const factor = amount / 100

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const gray = 0.299 * r + 0.587 * g + 0.114 * b

    data[i] = Math.max(0, Math.min(255, gray + factor * (r - gray)))
    data[i + 1] = Math.max(0, Math.min(255, gray + factor * (g - gray)))
    data[i + 2] = Math.max(0, Math.min(255, gray + factor * (b - gray)))
  }

  return new ImageData(data, Math.sqrt(data.length / 4), Math.sqrt(data.length / 4))
}

/**
 * Apply vignette effect
 */
function applyVignette(canvas: HTMLCanvasElement, amount: number): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const centerY = height / 2
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      const vignette = 1 - (distance / maxDistance) * (amount / 100)
      const factor = Math.max(0, Math.min(1, vignette))

      const idx = (y * width + x) * 4
      data[idx] *= factor
      data[idx + 1] *= factor
      data[idx + 2] *= factor
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Apply automatic levels adjustment
 */
function applyAutoLevels(data: Uint8ClampedArray): ImageData {
  let minR = 255,
    maxR = 0,
    minG = 255,
    maxG = 0,
    minB = 255,
    maxB = 0

  // Find min and max values for each channel
  for (let i = 0; i < data.length; i += 4) {
    minR = Math.min(minR, data[i])
    maxR = Math.max(maxR, data[i])
    minG = Math.min(minG, data[i + 1])
    maxG = Math.max(maxG, data[i + 1])
    minB = Math.min(minB, data[i + 2])
    maxB = Math.max(maxB, data[i + 2])
  }

  // Calculate stretch factors
  const rRange = maxR - minR
  const gRange = maxG - minG
  const bRange = maxB - minB

  // Apply levels adjustment
  for (let i = 0; i < data.length; i += 4) {
    if (rRange > 0) {
      data[i] = ((data[i] - minR) / rRange) * 255
    }
    if (gRange > 0) {
      data[i + 1] = ((data[i + 1] - minG) / gRange) * 255
    }
    if (bRange > 0) {
      data[i + 2] = ((data[i + 2] - minB) / bRange) * 255
    }
  }

  return new ImageData(data, Math.sqrt(data.length / 4), Math.sqrt(data.length / 4))
}

// Helper functions for image processing
function applyDeblock(data: Uint8ClampedArray, width: number, height: number, strength: number) {
  // Simple deblocking filter to reduce JPEG artifacts
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const idx = (y * width + x) * 4 + c
        const neighbors = [
          data[((y - 1) * width + x) * 4 + c],
          data[((y + 1) * width + x) * 4 + c],
          data[(y * width + (x - 1)) * 4 + c],
          data[(y * width + (x + 1)) * 4 + c],
        ]
        const avg = neighbors.reduce((a, b) => a + b, 0) / 4
        data[idx] = Math.round(data[idx] * (1 - strength) + avg * strength)
      }
    }
  }
}

function applyDenoise(data: Uint8ClampedArray, width: number, height: number, strength: number) {
  // Simple bilateral filter for noise reduction
  const temp = new Uint8ClampedArray(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const idx = (y * width + x) * 4 + c
        let sum = 0
        let weightSum = 0

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
            const diff = Math.abs(temp[idx] - temp[nIdx])
            const weight = Math.exp((-diff * diff) / (2 * 25 * 25))
            sum += temp[nIdx] * weight
            weightSum += weight
          }
        }

        const filtered = sum / weightSum
        data[idx] = Math.round(temp[idx] * (1 - strength) + filtered * strength)
      }
    }
  }
}

function applyAutoWhiteBalance(data: Uint8ClampedArray): ImageData {
  // Gray world assumption for white balance
  let rSum = 0,
    gSum = 0,
    bSum = 0,
    count = 0

  for (let i = 0; i < data.length; i += 4) {
    rSum += data[i]
    gSum += data[i + 1]
    bSum += data[i + 2]
    count++
  }

  const rAvg = rSum / count
  const gAvg = gSum / count
  const bAvg = bSum / count
  const gray = (rAvg + gAvg + bAvg) / 3

  const rGain = gray / rAvg
  const gGain = gray / gAvg
  const bGain = gray / bAvg

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.round(data[i] * rGain))
    data[i + 1] = Math.min(255, Math.round(data[i + 1] * gGain))
    data[i + 2] = Math.min(255, Math.round(data[i + 2] * bGain))
  }

  return new ImageData(data, Math.sqrt(data.length / 4), Math.sqrt(data.length / 4))
}

function applyLocalContrast(data: Uint8ClampedArray, width: number, height: number, strength: number) {
  // Unsharp mask for local contrast
  const temp = new Uint8ClampedArray(data)

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      for (let c = 0; c < 3; c++) {
        const idx = (y * width + x) * 4 + c
        let sum = 0

        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
            sum += temp[nIdx]
          }
        }

        const blurred = sum / 25
        const diff = temp[idx] - blurred
        data[idx] = Math.max(0, Math.min(255, Math.round(temp[idx] + diff * strength)))
      }
    }
  }
}

function applySharpen(data: Uint8ClampedArray, width: number, height: number, strength: number) {
  // Laplacian sharpening kernel
  const temp = new Uint8ClampedArray(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const idx = (y * width + x) * 4 + c
        const center = temp[idx]
        const neighbors =
          temp[((y - 1) * width + x) * 4 + c] +
          temp[((y + 1) * width + x) * 4 + c] +
          temp[(y * width + (x - 1)) * 4 + c] +
          temp[(y * width + (x + 1)) * 4 + c]

        const sharpened = center + (center * 4 - neighbors) * strength * 0.1
        data[idx] = Math.max(0, Math.min(255, Math.round(sharpened)))
      }
    }
  }
}

function applyGrain(data: Uint8ClampedArray, strength: number): ImageData {
  // Add subtle film grain
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * strength * 20
    data[i] = Math.max(0, Math.min(255, Math.round(data[i] + grain)))
    data[i + 1] = Math.max(0, Math.min(255, Math.round(data[i + 1] + grain)))
    data[i + 2] = Math.max(0, Math.min(255, Math.round(data[i + 2] + grain)))
  }
  return new ImageData(data, Math.sqrt(data.length / 4), Math.sqrt(data.length / 4))
}

/**
 * Convert a file to base64 data URL
 * @param file - The file to convert
 * @returns Base64 data URL string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to read file as string"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}
