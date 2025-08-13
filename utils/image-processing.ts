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
 * Pre-process image before AI enhancement
 */
export async function preProcessImage(file: File, settings: EnhancementToggles["pre"]): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    img.onload = () => {
      try {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Apply pre-processing in order
        if (settings.deblock !== "off") {
          imageData = applyDeblock(imageData, settings.deblock)
        }

        if (settings.denoise !== "off") {
          imageData = applyDenoise(imageData, settings.denoise)
        }

        if (settings.whiteBalance === "auto") {
          imageData = applyAutoWhiteBalance(imageData)
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob from canvas"))
            }
            URL.revokeObjectURL(img.src)
          },
          "image/png",
          0.95,
        )
      } catch (error) {
        reject(new Error(`Image processing failed: ${error instanceof Error ? error.message : "Unknown error"}`))
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
 * Post-process enhanced image
 */
export async function postProcessImage(blob: Blob, settings: EnhancementToggles["post"]): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    img.onload = () => {
      try {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Apply post-processing in order
        if (settings.localContrast !== "off") {
          imageData = applyLocalContrast(imageData, settings.localContrast)
        }

        if (settings.sharpen !== "off") {
          imageData = applySharpen(imageData, settings.sharpen)
        }

        if (settings.grain !== "off") {
          imageData = applyGrain(imageData, settings.grain)
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob from canvas"))
            }
            URL.revokeObjectURL(img.src)
          },
          "image/png",
          0.95,
        )
      } catch (error) {
        reject(new Error(`Post-processing failed: ${error instanceof Error ? error.message : "Unknown error"}`))
        URL.revokeObjectURL(img.src)
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image for post-processing"))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(blob)
  })
}

/**
 * Apply JPEG deblocking filter
 */
function applyDeblock(imageData: ImageData, strength: "low" | "medium"): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const width = imageData.width
  const height = imageData.height

  const factor = strength === "low" ? 0.3 : 0.6

  // Simple deblocking - reduce high frequency artifacts
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      // Average with neighbors to reduce blocking
      for (let c = 0; c < 3; c++) {
        const current = data[idx + c]
        const neighbors = [
          data[((y - 1) * width + x) * 4 + c],
          data[((y + 1) * width + x) * 4 + c],
          data[(y * width + (x - 1)) * 4 + c],
          data[(y * width + (x + 1)) * 4 + c],
        ]
        const avg = neighbors.reduce((a, b) => a + b, 0) / 4
        data[idx + c] = Math.round(current * (1 - factor) + avg * factor)
      }
    }
  }

  return new ImageData(data, width, height)
}

/**
 * Apply noise reduction using bilateral filtering approximation
 */
function applyDenoise(imageData: ImageData, strength: "low" | "medium"): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const width = imageData.width
  const height = imageData.height

  const threshold = strength === "low" ? 15 : 25

  // Bilateral-like filter for noise reduction
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        const current = data[idx + c]
        let sum = current
        let count = 1

        // Check 8-connected neighbors
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue

            const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
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

  return new ImageData(data, width, height)
}

/**
 * Apply automatic white balance using gray world assumption
 */
function applyAutoWhiteBalance(imageData: ImageData): ImageData {
  try {
    const data = imageData.data
    let rSum = 0,
      gSum = 0,
      bSum = 0
    const pixelCount = data.length / 4

    // Calculate average RGB values
    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i]
      gSum += data[i + 1]
      bSum += data[i + 2]
    }

    const rAvg = rSum / pixelCount
    const gAvg = gSum / pixelCount
    const bAvg = bSum / pixelCount

    // Calculate gray world assumption correction
    const grayValue = (rAvg + gAvg + bAvg) / 3
    const rFactor = grayValue / rAvg
    const gFactor = grayValue / gAvg
    const bFactor = grayValue / bAvg

    // Apply correction
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] * rFactor))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * gFactor))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * bFactor))
    }

    return imageData
  } catch (error) {
    console.error("Error applying auto white balance:", error)
    return imageData
  }
}

/**
 * Apply local contrast enhancement using unsharp mask
 */
function applyLocalContrast(imageData: ImageData, strength: "low" | "medium"): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const width = imageData.width
  const height = imageData.height

  const factor = strength === "low" ? 0.2 : 0.4

  // Unsharp mask for local contrast
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        const current = data[idx + c]

        // Calculate local average
        let sum = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += data[((y + dy) * width + (x + dx)) * 4 + c]
          }
        }
        const localAvg = sum / 9

        // Enhance difference from local average
        const diff = current - localAvg
        data[idx + c] = Math.min(255, Math.max(0, current + diff * factor))
      }
    }
  }

  return new ImageData(data, width, height)
}

/**
 * Apply edge-aware sharpening
 */
function applySharpen(imageData: ImageData, strength: "low" | "medium"): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const width = imageData.width
  const height = imageData.height

  const factor = strength === "low" ? 0.3 : 0.6

  // Edge-aware sharpening kernel
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ]

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

  return new ImageData(data, width, height)
}

/**
 * Add film grain texture
 */
function applyGrain(imageData: ImageData, strength: "very-low" | "low"): ImageData {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const intensity = strength === "very-low" ? 3 : 6

  // Add subtle film grain
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity

    data[i] = Math.min(255, Math.max(0, data[i] + noise))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
  }

  return new ImageData(data, width, height)
}

/**
 * Apply brightness adjustment
 */
function applyBrightness(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data
  const adjustment = (amount / 100) * 255

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + adjustment)) // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment)) // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment)) // B
  }

  return imageData
}

/**
 * Apply contrast adjustment
 */
function applyContrast(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data
  const factor = (259 * (amount + 255)) / (255 * (259 - amount))

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128)) // R
    data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128)) // G
    data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128)) // B
  }

  return imageData
}

/**
 * Apply saturation adjustment
 */
function applySaturation(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data
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

  return imageData
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
function applyAutoLevels(imageData: ImageData): ImageData {
  const data = imageData.data
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

  return imageData
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
      imageData = applyAutoWhiteBalance(imageData)
    }

    if (settings.autoLevels) {
      imageData = applyAutoLevels(imageData)
    }

    // Apply basic adjustments
    if (settings.brightness !== 0) {
      imageData = applyBrightness(imageData, settings.brightness)
    }

    if (settings.contrast !== 0) {
      imageData = applyContrast(imageData, settings.contrast)
    }

    if (settings.saturation !== 0) {
      imageData = applySaturation(imageData, settings.saturation)
    }

    // Apply grain before putting back to canvas
    if (settings.grain > 0) {
      imageData = applyGrain(imageData, settings.grain)
    }

    // Put processed data back to canvas
    ctx.putImageData(imageData, 0, 0)

    // Apply effects that work on canvas directly
    if (settings.sharpness > 0) {
      applySharpness(canvas, settings.sharpness)
    }

    if (settings.denoise > 0) {
      applyDenoise(canvas, settings.denoise)
    }

    if (settings.vignette > 0) {
      applyVignette(canvas, settings.vignette)
    }
  } catch (error) {
    console.error("Error processing image:", error)
    throw error
  }
}

// Function declaration for applySharpness
function applySharpness(canvas: HTMLCanvasElement, strength: number): void {
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
