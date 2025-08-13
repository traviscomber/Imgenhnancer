/**
 * Image processing utilities for pre and post enhancement
 */

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

/**
 * Pre-process image before enhancement
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

        // Apply pre-processing filters
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
              reject(new Error("Failed to create processed blob"))
            }
          },
          "image/png",
          1.0,
        )
      } catch (error) {
        reject(new Error(`Image processing failed: ${error instanceof Error ? error.message : "Unknown error"}`))
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
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

        // Apply post-processing filters
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
              reject(new Error("Failed to create processed blob"))
            }
          },
          "image/png",
          1.0,
        )
      } catch (error) {
        reject(new Error(`Post-processing failed: ${error instanceof Error ? error.message : "Unknown error"}`))
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image for post-processing"))
    }

    img.src = URL.createObjectURL(blob)
  })
}

// Helper functions for image processing
function applyDeblock(imageData: ImageData, strength: "low" | "medium"): ImageData {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const factor = strength === "low" ? 0.3 : 0.6

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        const current = data[idx + c]
        const neighbors = [
          data[((y - 1) * width + x) * 4 + c],
          data[((y + 1) * width + x) * 4 + c],
          data[(y * width + (x - 1)) * 4 + c],
          data[(y * width + (x + 1)) * 4 + c],
        ]

        const avg = neighbors.reduce((sum, val) => sum + val, 0) / neighbors.length
        data[idx + c] = Math.round(current * (1 - factor) + avg * factor)
      }
    }
  }

  return imageData
}

function applyDenoise(imageData: ImageData, strength: "low" | "medium"): ImageData {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const factor = strength === "low" ? 0.2 : 0.4

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        const current = data[idx + c]
        const neighbors = []

        // 3x3 kernel
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
            neighbors.push(data[nIdx])
          }
        }

        const avg = neighbors.reduce((sum, val) => sum + val, 0) / neighbors.length
        data[idx + c] = Math.round(current * (1 - factor) + avg * factor)
      }
    }
  }

  return imageData
}

function applyAutoWhiteBalance(imageData: ImageData): ImageData {
  const data = imageData.data
  const length = data.length

  // Calculate average RGB values
  let rSum = 0,
    gSum = 0,
    bSum = 0,
    count = 0

  for (let i = 0; i < length; i += 4) {
    rSum += data[i]
    gSum += data[i + 1]
    bSum += data[i + 2]
    count++
  }

  const rAvg = rSum / count
  const gAvg = gSum / count
  const bAvg = bSum / count

  // Calculate gray world assumption correction
  const grayTarget = (rAvg + gAvg + bAvg) / 3
  const rFactor = grayTarget / rAvg
  const gFactor = grayTarget / gAvg
  const bFactor = grayTarget / bAvg

  // Apply correction with subtle strength
  const strength = 0.3
  for (let i = 0; i < length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] * (1 + (rFactor - 1) * strength)))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * (1 + (gFactor - 1) * strength)))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * (1 + (bFactor - 1) * strength)))
  }

  return imageData
}

function applyLocalContrast(imageData: ImageData, strength: "low" | "medium"): ImageData {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const factor = strength === "low" ? 0.3 : 0.6

  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        const current = data[idx + c]
        let localSum = 0
        let count = 0

        // 5x5 kernel for local average
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
            localSum += data[nIdx]
            count++
          }
        }

        const localAvg = localSum / count
        const diff = current - localAvg
        data[idx + c] = Math.min(255, Math.max(0, current + diff * factor))
      }
    }
  }

  return imageData
}

function applySharpen(imageData: ImageData, strength: "low" | "medium"): ImageData {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const factor = strength === "low" ? 0.3 : 0.6

  // Unsharp mask kernel
  const kernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      for (let c = 0; c < 3; c++) {
        let sum = 0
        let kIdx = 0

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4 + c
            sum += data[nIdx] * kernel[kIdx]
            kIdx++
          }
        }

        const original = data[idx + c]
        const sharpened = sum / 9
        data[idx + c] = Math.min(255, Math.max(0, original + (sharpened - original) * factor))
      }
    }
  }

  return imageData
}

function applyGrain(imageData: ImageData, strength: "very-low" | "low"): ImageData {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const factor = strength === "very-low" ? 0.1 : 0.2

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      // Generate noise
      const noise = (Math.random() - 0.5) * 2 * factor * 255

      for (let c = 0; c < 3; c++) {
        data[idx + c] = Math.min(255, Math.max(0, data[idx + c] + noise))
      }
    }
  }

  return imageData
}
