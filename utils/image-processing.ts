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
 * Pre-process image before AI enhancement
 */
export async function preProcessImage(
  file: File,
  settings: EnhancementToggles["pre"]
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      try {
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
              reject(new Error("Failed to create blob"))
            }
          },
          "image/png",
          1.0
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.crossOrigin = "anonymous"
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Post-process enhanced image
 */
export async function postProcessImage(
  blob: Blob,
  settings: EnhancementToggles["post"]
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      try {
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
              reject(new Error("Failed to create blob"))
            }
          },
          "image/png",
          1.0
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.crossOrigin = "anonymous"
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
  
  // Simple deblocking using a mild blur on block boundaries
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // Check if we're near a potential block boundary (every 8 pixels)
      if (x % 8 === 0 || y % 8 === 0) {
        const idx = (y * width + x) * 4
        
        // Apply mild averaging with neighbors
        for (let c = 0; c < 3; c++) {
          const current = data[idx + c]
          const neighbors = [
            data[((y - 1) * width + x) * 4 + c] || current,
            data[((y + 1) * width + x) * 4 + c] || current,
            data[(y * width + (x - 1)) * 4 + c] || current,
            data[(y * width + (x + 1)) * 4 + c] || current
          ]
          
          const avg = neighbors.reduce((sum, val) => sum + val, 0) / neighbors.length
          data[idx + c] = Math.round(current * (1 - factor) + avg * factor)
        }
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
  
  const factor = strength === "low" ? 0.2 : 0.4
  const threshold = strength === "low" ? 15 : 25
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      
      for (let c = 0; c < 3; c++) {
        const current = data[idx + c]
        let sum = 0
        let count = 0
        
        // Check 3x3 neighborhood
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy
            const nx = x + dx
            
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const nIdx = (ny * width + nx) * 4
              const neighbor = data[nIdx + c]
              
              // Only average with similar pixels (bilateral filtering concept)
              if (Math.abs(neighbor - current) < threshold) {
                sum += neighbor
                count++
              }
            }
          }
        }
        
        if (count > 0) {
          const avg = sum / count
          data[idx + c] = Math.round(current * (1 - factor) + avg * factor)
        }
      }
    }
  }
  
  return new ImageData(data, width, height)
}

/**
 * Apply automatic white balance using gray world assumption
 */
function applyAutoWhiteBalance(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const width = imageData.width
  const height = imageData.height
  
  // Calculate average RGB values
  let rSum = 0, gSum = 0, bSum = 0
  let count = 0
  
  for (let i = 0; i < data.length; i += 4) {
    rSum += data[i]
    gSum += data[i + 1]
    bSum += data[i + 2]
    count++
  }
  
  if (count === 0) return imageData
  
  const rAvg = rSum / count
  const gAvg = gSum / count
  const bAvg = bSum / count
  
  // Calculate gray world average
  const grayAvg = (rAvg + gAvg + bAvg) / 3
  
  // Avoid division by zero
  if (rAvg === 0 || gAvg === 0 || bAvg === 0) return imageData
  
  // Calculate correction factors (subtle correction)
  const rFactor = Math.min(1.2, Math.max(0.8, grayAvg / rAvg))
  const gFactor = Math.min(1.2, Math.max(0.8, grayAvg / gAvg))
  const bFactor = Math.min(1.2, Math.max(0.8, grayAvg / bAvg))
  
  // Apply correction
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * rFactor)
    data[i + 1] = Math.min(255, data[i + 1] * gFactor)
    data[i + 2] = Math.min(255, data[i + 2] * bFactor)
  }
  
  return new ImageData(data, width, height)
}

/**
 * Apply local contrast enhancement using unsharp mask
 */
function applyLocalContrast(imageData: ImageData, strength: "low" | "medium"): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const width = imageData.width
  const height = imageData.height
  
  const factor = strength === "low" ? 0.3 : 0.6
  
  // Create blurred version for unsharp mask
  const blurred = new Uint8ClampedArray(data)
  
  // Simple box blur
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      
      for (let c = 0; c < 3; c++) {
        let sum = 0
        let count = 0
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy
            const nx = x + dx
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              sum += data[(ny * width + nx) * 4 + c]
              count++
            }
          }
        }
        
        blurred[idx + c] = count > 0 ? sum / count : data[idx + c]
      }
    }
  }
  
  // Apply unsharp mask
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const original = data[i + c]
      const blur = blurred[i + c]
      const enhanced = original + (original - blur) * factor
      data[i + c] = Math.max(0, Math.min(255, enhanced))
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
  
  const factor = strength === "low" ? 0.2 : 0.4
  
  // Sharpening kernel
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0]
  ]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      
      for (let c = 0; c < 3; c++) {
        let sum = 0
        
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const py = y + ky - 1
            const px = x + kx - 1
            const pIdx = (py * width + px) * 4
            sum += data[pIdx + c] * kernel[ky][kx]
          }
        }
        
        const original = data[idx + c]
        const sharpened = sum
        data[idx + c] = Math.max(0, Math.min(255, original * (1 - factor) + sharpened * factor))
      }
    }
  }
  
  return new ImageData(data, width, height)
}

/**
 * Add film grain texture
 */
function applyGrain(imageData: ImageData, strength: "very-low" | "low"): ImageData {
  const data = new Uint8ClampedArray(imageData.data)
  const intensity = strength === "very-low" ? 3 : 6
  
  for (let i = 0; i < data.length; i += 4) {
    // Generate random grain
    const grain = (Math.random() - 0.5) * intensity
    
    // Apply to RGB channels
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.max(0, Math.min(255, data[i + c] + grain))
    }
  }
  
  return new ImageData(data, width, height)
}
