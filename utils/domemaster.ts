export type DomemasterProjection = "equidistant" | "stereographic"

export interface DomemasterOptions {
  size: number // Output size (e.g., 8192 for 8K)
  bleedPercent: number // Black border percentage (0-5%)
  overlay: boolean // Show guide overlays
  projection: "equidistant" | "stereographic" // Fisheye projection type
}

export interface DomemasterSettings {
  preset: "dome-8k" | "dome-12k" | "custom"
  outputWidth: number
  outputHeight: number
  fov: number
  bleedMargin: number
  showGuides: boolean
  guideColor: string
  backgroundColor: string
}

export interface Point2D {
  x: number
  y: number
}

export interface Point3D {
  x: number
  y: number
  z: number
}

export interface FisheyeProjectionSettings {
  inputWidth: number
  inputHeight: number
  outputSize: number
  fov: number
  centerX?: number
  centerY?: number
}

/**
 * Convert equirectangular coordinates to 3D sphere coordinates
 */
function equirectangularTo3D(u: number, v: number): Point3D {
  const theta = u * 2 * Math.PI // Longitude: 0 to 2π
  const phi = v * Math.PI // Latitude: 0 to π

  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  }
}

/**
 * Convert 3D sphere coordinates to fisheye coordinates
 */
function sphereToFisheye(point: Point3D, projection: "equidistant" | "stereographic"): Point2D | null {
  // Only process front hemisphere (y >= 0)
  if (point.y < 0) return null

  const r = Math.sqrt(point.x * point.x + point.z * point.z)
  const theta = Math.atan2(point.z, point.x)

  let fisheyeR: number
  if (projection === "equidistant") {
    // Equidistant projection: r = angle
    fisheyeR = Math.acos(point.y) / (Math.PI / 2) // Normalize to 0-1
  } else {
    // Stereographic projection: r = tan(angle/2)
    const angle = Math.acos(point.y)
    fisheyeR = Math.tan(angle / 2) / Math.tan(Math.PI / 4) // Normalize to 0-1
  }

  // Convert to fisheye coordinates (-1 to 1)
  return {
    x: fisheyeR * Math.cos(theta),
    y: fisheyeR * Math.sin(theta),
  }
}

/**
 * Sample pixel from equirectangular image with bilinear interpolation
 */
function sampleEquirectangular(
  imageData: ImageData,
  u: number,
  v: number,
): { r: number; g: number; b: number; a: number } {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data

  // Wrap u coordinate (longitude)
  u = ((u % 1) + 1) % 1

  // Clamp v coordinate (latitude)
  v = Math.max(0, Math.min(1, v))

  // Convert to pixel coordinates
  const x = u * (width - 1)
  const y = v * (height - 1)

  // Get integer and fractional parts
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = Math.min(x0 + 1, width - 1)
  const y1 = Math.min(y0 + 1, height - 1)

  const fx = x - x0
  const fy = y - y0

  // Sample four neighboring pixels
  const getPixel = (px: number, py: number) => {
    const idx = (py * width + px) * 4
    return {
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3],
    }
  }

  const p00 = getPixel(x0, y0)
  const p10 = getPixel(x1, y0)
  const p01 = getPixel(x0, y1)
  const p11 = getPixel(x1, y1)

  // Bilinear interpolation
  const interpolate = (v00: number, v10: number, v01: number, v11: number) => {
    const v0 = v00 * (1 - fx) + v10 * fx
    const v1 = v01 * (1 - fx) + v11 * fx
    return v0 * (1 - fy) + v1 * fy
  }

  return {
    r: interpolate(p00.r, p10.r, p01.r, p11.r),
    g: interpolate(p00.g, p10.g, p01.g, p11.g),
    b: interpolate(p00.b, p10.b, p01.b, p11.b),
    a: interpolate(p00.a, p10.a, p01.a, p11.a),
  }
}

/**
 * Draw guide overlays on the domemaster
 */
function drawGuideOverlays(ctx: CanvasRenderingContext2D, size: number): void {
  const center = size / 2
  const radius = center * 0.97 // Slightly inside the circle

  ctx.save()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
  ctx.lineWidth = 2
  ctx.setLineDash([10, 5])

  // Center crosshairs
  ctx.beginPath()
  ctx.moveTo(center - 30, center)
  ctx.lineTo(center + 30, center)
  ctx.moveTo(center, center - 30)
  ctx.lineTo(center, center + 30)
  ctx.stroke()

  // Concentric circles at 30°, 60°, 90° elevation
  const elevations = [30, 60, 90]
  elevations.forEach((elevation) => {
    const elevationRad = (elevation * Math.PI) / 180
    const circleRadius = (elevationRad / (Math.PI / 2)) * radius

    ctx.beginPath()
    ctx.arc(center, center, circleRadius, 0, 2 * Math.PI)
    ctx.stroke()
  })

  // Azimuth lines every 30°
  for (let azimuth = 0; azimuth < 360; azimuth += 30) {
    const azimuthRad = (azimuth * Math.PI) / 180
    const x = center + radius * Math.cos(azimuthRad)
    const y = center + radius * Math.sin(azimuthRad)

    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Corner markers for alignment
  const markerSize = 20
  const corners = [
    { x: markerSize, y: markerSize },
    { x: size - markerSize, y: markerSize },
    { x: markerSize, y: size - markerSize },
    { x: size - markerSize, y: size - markerSize },
  ]

  ctx.setLineDash([])
  ctx.lineWidth = 3
  corners.forEach((corner) => {
    ctx.beginPath()
    ctx.moveTo(corner.x - 10, corner.y)
    ctx.lineTo(corner.x + 10, corner.y)
    ctx.moveTo(corner.x, corner.y - 10)
    ctx.lineTo(corner.x, corner.y + 10)
    ctx.stroke()
  })

  ctx.restore()
}

/**
 * Generate domemaster from equirectangular image
 */
export async function generateDomemaster(imageBlob: Blob, options: DomemasterOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
        // Create source canvas for equirectangular image
        const sourceCanvas = document.createElement("canvas")
        const sourceCtx = sourceCanvas.getContext("2d")
        if (!sourceCtx) {
          reject(new Error("Could not get source canvas context"))
          return
        }

        sourceCanvas.width = img.width
        sourceCanvas.height = img.height
        sourceCtx.drawImage(img, 0, 0)

        const sourceImageData = sourceCtx.getImageData(0, 0, img.width, img.height)

        // Create output canvas for domemaster
        const outputCanvas = document.createElement("canvas")
        const outputCtx = outputCanvas.getContext("2d")
        if (!outputCtx) {
          reject(new Error("Could not get output canvas context"))
          return
        }

        outputCanvas.width = options.size
        outputCanvas.height = options.size
        const outputImageData = outputCtx.createImageData(options.size, options.size)

        const center = options.size / 2
        const maxRadius = center * (1 - options.bleedPercent / 100)

        console.log(`🔄 Generating ${options.size}x${options.size} domemaster...`)

        // Process each pixel in the output domemaster
        for (let y = 0; y < options.size; y++) {
          for (let x = 0; x < options.size; x++) {
            const outputIdx = (y * options.size + x) * 4

            // Convert to centered coordinates (-1 to 1)
            const fx = (x - center) / maxRadius
            const fy = (y - center) / maxRadius

            // Check if pixel is within the fisheye circle
            const distanceFromCenter = Math.sqrt(fx * fx + fy * fy)
            if (distanceFromCenter > 1) {
              // Outside circle - set to black
              outputImageData.data[outputIdx] = 0
              outputImageData.data[outputIdx + 1] = 0
              outputImageData.data[outputIdx + 2] = 0
              outputImageData.data[outputIdx + 3] = 255
              continue
            }

            // Convert fisheye coordinates to 3D sphere
            const theta = Math.atan2(fy, fx)
            let phi: number

            if (options.projection === "equidistant") {
              phi = distanceFromCenter * (Math.PI / 2)
            } else {
              // Stereographic
              phi = 2 * Math.atan(distanceFromCenter * Math.tan(Math.PI / 4))
            }

            // Convert to 3D coordinates
            const point3D: Point3D = {
              x: Math.sin(phi) * Math.cos(theta),
              y: Math.cos(phi),
              z: Math.sin(phi) * Math.sin(theta),
            }

            // Convert 3D to equirectangular UV coordinates
            const u = (Math.atan2(point3D.z, point3D.x) + Math.PI) / (2 * Math.PI)
            const v = Math.acos(Math.max(-1, Math.min(1, point3D.y))) / Math.PI

            // Sample from equirectangular image
            const pixel = sampleEquirectangular(sourceImageData, u, v)

            // Set output pixel
            outputImageData.data[outputIdx] = Math.round(pixel.r)
            outputImageData.data[outputIdx + 1] = Math.round(pixel.g)
            outputImageData.data[outputIdx + 2] = Math.round(pixel.b)
            outputImageData.data[outputIdx + 3] = Math.round(pixel.a)
          }

          // Progress logging
          if (y % Math.floor(options.size / 10) === 0) {
            const progress = Math.round((y / options.size) * 100)
            console.log(`🔄 Domemaster progress: ${progress}%`)
          }
        }

        // Put the processed image data to canvas
        outputCtx.putImageData(outputImageData, 0, 0)

        // Draw guide overlays if requested
        if (options.overlay) {
          drawGuideOverlays(outputCtx, options.size)
        }

        // Convert to blob
        outputCanvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`✅ Domemaster generated: ${options.size}x${options.size}`)
              resolve(blob)
            } else {
              reject(new Error("Failed to create domemaster blob"))
            }
            URL.revokeObjectURL(img.src)
          },
          "image/png",
          1.0,
        )
      } catch (error) {
        reject(new Error(`Domemaster generation failed: ${error instanceof Error ? error.message : "Unknown error"}`))
        URL.revokeObjectURL(img.src)
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image for domemaster generation"))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(imageBlob)
  })
}

/**
 * Create domemaster preset configurations
 */
export const DOMEMASTER_PRESETS = {
  dome4k: {
    size: 4096,
    bleedPercent: 2,
    overlay: true,
    projection: "equidistant" as const,
    name: "Dome 4K Preview",
    description: "4K domemaster for preview and testing",
  },
  dome8k: {
    size: 8192,
    bleedPercent: 3,
    overlay: true,
    projection: "equidistant" as const,
    name: "Dome 8K Standard",
    description: "8K domemaster for most planetarium systems",
  },
  dome12k: {
    size: 12288,
    bleedPercent: 3,
    overlay: false,
    projection: "equidistant" as const,
    name: "Dome 12K Ultra",
    description: "12K domemaster for high-end planetarium systems",
  },
  dome16k: {
    size: 16384,
    bleedPercent: 2,
    overlay: false,
    projection: "equidistant" as const,
    name: "Dome 16K Extreme",
    description: "16K domemaster for cutting-edge installations",
  },
}

/**
 * Validate domemaster options
 */
export function validateDomemasterOptions(options: Partial<DomemasterOptions>): DomemasterOptions {
  return {
    size: Math.max(512, Math.min(16384, options.size || 8192)),
    bleedPercent: Math.max(0, Math.min(10, options.bleedPercent || 3)),
    overlay: options.overlay !== false,
    projection: options.projection || "equidistant",
  }
}

/**
 * Calculate estimated processing time for domemaster generation
 */
export function estimateProcessingTime(size: number): string {
  const pixelCount = size * size
  const baseTime = 0.5 // Base time in seconds
  const timePerMegapixel = 2 // Seconds per megapixel

  const megapixels = pixelCount / (1024 * 1024)
  const estimatedSeconds = baseTime + megapixels * timePerMegapixel

  if (estimatedSeconds < 60) {
    return `~${Math.round(estimatedSeconds)}s`
  } else {
    const minutes = Math.floor(estimatedSeconds / 60)
    const seconds = Math.round(estimatedSeconds % 60)
    return `~${minutes}m ${seconds}s`
  }
}

/**
 * Get recommended settings based on source image dimensions
 */
export function getRecommendedDomemasterSize(sourceWidth: number, sourceHeight: number): number {
  const sourcePixels = sourceWidth * sourceHeight
  const sourceMegapixels = sourcePixels / (1024 * 1024)

  if (sourceMegapixels < 2) return 4096 // 4K for small sources
  if (sourceMegapixels < 8) return 8192 // 8K for medium sources
  if (sourceMegapixels < 20) return 12288 // 12K for large sources
  return 16384 // 16K for very large sources
}

/**
 * Bilinear interpolation sampling from image
 */
function bilinearSample(img: HTMLImageElement, x: number, y: number): { r: number; g: number; b: number } | null {
  // Create a temporary canvas to sample pixel data
  const tempCanvas = document.createElement("canvas")
  const tempCtx = tempCanvas.getContext("2d")
  if (!tempCtx) return null

  tempCanvas.width = img.width
  tempCanvas.height = img.height
  tempCtx.drawImage(img, 0, 0)

  try {
    // Clamp coordinates to image bounds
    x = Math.max(0, Math.min(img.width - 1, x))
    y = Math.max(0, Math.min(img.height - 1, y))

    const x1 = Math.floor(x)
    const y1 = Math.floor(y)
    const x2 = Math.min(x1 + 1, img.width - 1)
    const y2 = Math.min(y1 + 1, img.height - 1)

    const fx = x - x1
    const fy = y - y1

    // Get pixel data for the four corners
    const p1 = tempCtx.getImageData(x1, y1, 1, 1).data // Top-left
    const p2 = tempCtx.getImageData(x2, y1, 1, 1).data // Top-right
    const p3 = tempCtx.getImageData(x1, y2, 1, 1).data // Bottom-left
    const p4 = tempCtx.getImageData(x2, y2, 1, 1).data // Bottom-right

    // Bilinear interpolation
    const r = p1[0] * (1 - fx) * (1 - fy) + p2[0] * fx * (1 - fy) + p3[0] * (1 - fx) * fy + p4[0] * fx * fy
    const g = p1[1] * (1 - fx) * (1 - fy) + p2[1] * fx * (1 - fy) + p3[1] * (1 - fx) * fy + p4[1] * fx * fy
    const b = p1[2] * (1 - fx) * (1 - fy) + p2[2] * fx * (1 - fy) + p3[2] * (1 - fx) * fy + p4[2] * fx * fy

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
  } catch (error) {
    console.warn("Bilinear sampling error:", error)
    return null
  }
}

/**
 * Add guide overlays to domemaster
 */
function addGuideOverlays(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number): void {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
  ctx.lineWidth = 2

  // Center crosshairs
  ctx.beginPath()
  ctx.moveTo(centerX - 20, centerY)
  ctx.lineTo(centerX + 20, centerY)
  ctx.moveTo(centerX, centerY - 20)
  ctx.lineTo(centerX, centerY + 20)
  ctx.stroke()

  // Elevation circles (every 10 degrees)
  for (let elevation = 10; elevation <= 80; elevation += 10) {
    const circleRadius = radius * (elevation / 90)
    ctx.beginPath()
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI)
    ctx.stroke()
  }

  // Azimuth lines (every 30 degrees)
  for (let azimuth = 0; azimuth < 360; azimuth += 30) {
    const angle = (azimuth * Math.PI) / 180
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Corner markers
  const markerSize = 10
  const corners = [
    [markerSize, markerSize],
    [centerX * 2 - markerSize, markerSize],
    [markerSize, centerY * 2 - markerSize],
    [centerX * 2 - markerSize, centerY * 2 - markerSize],
  ]

  ctx.strokeStyle = "rgba(255, 0, 0, 0.7)"
  ctx.lineWidth = 3

  corners.forEach(([x, y]) => {
    ctx.beginPath()
    ctx.moveTo(x - 5, y)
    ctx.lineTo(x + 5, y)
    ctx.moveTo(x, y - 5)
    ctx.lineTo(x, y + 5)
    ctx.stroke()
  })

  // Add text labels
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
  ctx.font = "14px Arial"
  ctx.textAlign = "center"

  // Zenith label
  ctx.fillText("ZENITH", centerX, centerY - 30)

  // Cardinal directions
  ctx.fillText("N", centerX, centerY - radius + 20)
  ctx.fillText("S", centerX, centerY + radius - 10)
  ctx.fillText("E", centerX + radius - 15, centerY + 5)
  ctx.fillText("W", centerX - radius + 15, centerY + 5)
}

/**
 * Get recommended domemaster presets
 */
export function getDomemasterPresets(): Array<{
  name: string
  size: number
  bleedPercent: number
  overlay: boolean
  description: string
  estimatedTime: string
}> {
  return [
    {
      name: "4K Preview",
      size: 4096,
      bleedPercent: 3,
      overlay: true,
      description: "Fast preview for testing and validation",
      estimatedTime: "~15s",
    },
    {
      name: "8K Standard",
      size: 8192,
      bleedPercent: 3,
      overlay: true,
      description: "Standard resolution for most planetariums",
      estimatedTime: "~45s",
    },
    {
      name: "12K High Detail",
      size: 12288,
      bleedPercent: 2,
      overlay: true,
      description: "High detail for premium installations",
      estimatedTime: "~90s",
    },
    {
      name: "16K Ultra",
      size: 16384,
      bleedPercent: 1,
      overlay: false,
      description: "Maximum quality for specialized applications",
      estimatedTime: "~180s",
    },
  ]
}
