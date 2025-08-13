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

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Apply deblocking (JPEG artifact reduction)
        if (settings.deblock !== "off") {
          applyDeblock(data, canvas.width, canvas.height, settings.deblock)
        }

        // Apply denoising
        if (settings.denoise !== "off") {
          applyDenoise(data, canvas.width, canvas.height, settings.denoise)
        }

        // Apply white balance correction
        if (settings.whiteBalance === "auto") {
          applyWhiteBalance(data)
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob"))
            }
            URL.revokeObjectURL(img.src)
          },
          "image/png",
          1.0,
        )
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

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Apply local contrast enhancement
        if (settings.localContrast !== "off") {
          applyLocalContrast(data, canvas.width, canvas.height, settings.localContrast)
        }

        // Apply sharpening
        if (settings.sharpen !== "off") {
          applySharpen(data, canvas.width, canvas.height, settings.sharpen)
        }

        // Add film grain
        if (settings.grain !== "off") {
          applyGrain(data, settings.grain)
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob"))
            }
            URL.revokeObjectURL(img.src)
          },
          "image/png",
          1.0,
        )
      } catch (error) {
        reject(error)
        URL.revokeObjectURL(img.src)
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(blob)
  })
}

/**
 * Apply deblocking filter to reduce JPEG artifacts
 */
function applyDeblock(data: Uint8ClampedArray, width: number, height: number, strength: "low" | "medium") {
  const factor = strength === "low" ? 0.3 : 0.5
  const temp = new Uint8ClampedArray(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        const current = temp[idx + c]
        const neighbors = [
          temp[((y - 1) * width + x) * 4 + c],
          temp[((y + 1) * width + x) * 4 + c],
          temp[(y * width + (x - 1)) * 4 + c],
          temp[(y * width + (x + 1)) * 4 + c],
        ]

        const avg = neighbors.reduce((sum, val) => sum + val, 0) / 4
        data[idx + c] = Math.round(current * (1 - factor) + avg * factor)
      }
    }
  }
}

/**
 * Apply noise reduction using bilateral filtering
 */
function applyDenoise(data: Uint8ClampedArray, width: number, height: number, strength: "low" | "medium") {
  const factor = strength === "low" ? 0.2 : 0.4
  const temp = new Uint8ClampedArray(data)
  const threshold = strength === "low" ? 15 : 25

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        const current = temp[idx + c]
        let sum = current
        let count = 1

        // Check 8-connected neighbors
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue

            const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
            const neighbor = temp[nIdx]

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
}

/**
 * Apply automatic white balance using gray world assumption
 */
function applyWhiteBalance(data: Uint8ClampedArray) {
  let rSum = 0,
    gSum = 0,
    bSum = 0
  let count = 0

  // Calculate average RGB values
  for (let i = 0; i < data.length; i += 4) {
    rSum += data[i]
    gSum += data[i + 1]
    bSum += data[i + 2]
    count++
  }

  const rAvg = rSum / count
  const gAvg = gSum / count
  const bAvg = bSum / count

  // Calculate correction factors using gray world assumption
  const gray = (rAvg + gAvg + bAvg) / 3
  const rFactor = gray / rAvg
  const gFactor = gray / gAvg
  const bFactor = gray / bAvg

  // Apply correction with moderate strength
  const strength = 0.4
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] * (1 + (rFactor - 1) * strength)))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * (1 + (gFactor - 1) * strength)))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * (1 + (bFactor - 1) * strength)))
  }
}

/**
 * Apply local contrast enhancement using unsharp mask
 */
function applyLocalContrast(data: Uint8ClampedArray, width: number, height: number, strength: "low" | "medium") {
  const factor = strength === "low" ? 0.3 : 0.5
  const temp = new Uint8ClampedArray(data)

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        const current = temp[idx + c]
        let sum = 0
        let count = 0

        // 5x5 kernel for local average
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            sum += temp[((y + dy) * width + (x + dx)) * 4 + c]
            count++
          }
        }

        const localAvg = sum / count
        const diff = current - localAvg
        data[idx + c] = Math.max(0, Math.min(255, current + diff * factor))
      }
    }
  }
}

/**
 * Apply edge-aware sharpening using unsharp mask
 */
function applySharpen(data: Uint8ClampedArray, width: number, height: number, strength: "low" | "medium") {
  const factor = strength === "low" ? 0.3 : 0.5
  const temp = new Uint8ClampedArray(data)

  // Sharpening kernel
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
            sum += temp[pixelIdx] * kernel[ky][kx]
          }
        }

        const current = temp[idx + c]
        const sharpened = current + sum * factor
        data[idx + c] = Math.max(0, Math.min(255, sharpened))
      }
    }
  }
}

/**
 * Add subtle film grain texture
 */
function applyGrain(data: Uint8ClampedArray, strength: "very-low" | "low") {
  const factor = strength === "very-low" ? 3 : 6

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * factor
    data[i] = Math.max(0, Math.min(255, data[i] + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
  }
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

    // Sum for white balance analysis
    rSum += r
    gSum += g
    bSum += b
  }

  // Calculate averages
  const avgBrightness = totalBrightness / pixelCount
  const avgSaturation = totalSaturation / pixelCount
  const contrast = maxBrightness - minBrightness

  // Detect if white balance correction is needed
  const rAvg = rSum / pixelCount
  const gAvg = gSum / pixelCount
  const bAvg = bSum / pixelCount
  const colorBalance = Math.max(rAvg, gAvg, bAvg) - Math.min(rAvg, gAvg, bAvg)
  const needsWhiteBalance = colorBalance > 20

  // Simple edge detection for sharpness analysis
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

/**
 * Generate optimal settings based on image analysis
 */
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
