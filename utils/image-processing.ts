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
          applyDeblocking(data, canvas.width, canvas.height, settings.deblock)
        }

        // Apply denoising
        if (settings.denoise !== "off") {
          applyDenoising(data, canvas.width, canvas.height, settings.denoise)
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
          applySharpening(data, canvas.width, canvas.height, settings.sharpen)
        }

        // Add subtle grain to reduce AI plasticity
        if (settings.grain !== "off") {
          addGrain(data, settings.grain)
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

function applyDeblocking(data: Uint8ClampedArray, width: number, height: number, strength: "low" | "medium") {
  const factor = strength === "low" ? 0.3 : 0.6
  const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c
            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)]
          }
        }
        const idx = (y * width + x) * 4 + c
        data[idx] = Math.max(0, Math.min(255, data[idx] + sum * factor))
      }
    }
  }
}

function applyDenoising(data: Uint8ClampedArray, width: number, height: number, strength: "low" | "medium") {
  const radius = strength === "low" ? 1 : 2
  const factor = strength === "low" ? 0.2 : 0.4

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        let count = 0
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4 + c
            sum += data[idx]
            count++
          }
        }
        const avg = sum / count
        const idx = (y * width + x) * 4 + c
        data[idx] = data[idx] * (1 - factor) + avg * factor
      }
    }
  }
}

function applyWhiteBalance(data: Uint8ClampedArray) {
  let rSum = 0,
    gSum = 0,
    bSum = 0,
    count = 0

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
  const grayAvg = (rAvg + gAvg + bAvg) / 3

  const rFactor = grayAvg / rAvg
  const gFactor = grayAvg / gAvg
  const bFactor = grayAvg / bAvg

  // Apply correction with subtle strength
  const strength = 0.3
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] * (1 + (rFactor - 1) * strength)))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * (1 + (gFactor - 1) * strength)))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * (1 + (bFactor - 1) * strength)))
  }
}

function applyLocalContrast(data: Uint8ClampedArray, width: number, height: number, strength: "low" | "medium") {
  const factor = strength === "low" ? 0.2 : 0.4
  const radius = 3

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        let count = 0
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4 + c
            sum += data[idx]
            count++
          }
        }
        const avg = sum / count
        const idx = (y * width + x) * 4 + c
        const diff = data[idx] - avg
        data[idx] = Math.max(0, Math.min(255, data[idx] + diff * factor))
      }
    }
  }
}

function applySharpening(data: Uint8ClampedArray, width: number, height: number, strength: "low" | "medium") {
  const factor = strength === "low" ? 0.3 : 0.6
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c
            sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)]
          }
        }
        const idx = (y * width + x) * 4 + c
        data[idx] = Math.max(0, Math.min(255, data[idx] * (1 - factor) + sum * factor))
      }
    }
  }
}

function addGrain(data: Uint8ClampedArray, strength: "very-low" | "low") {
  const factor = strength === "very-low" ? 2 : 4

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
