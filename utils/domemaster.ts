export type DomemasterProjection = "equidistant" | "equisolid" | "orthographic" | "stereographic"

export interface DomemasterOptions {
  size: number // Output resolution (e.g., 4096, 8192)
  bleedPercent: number // Black border percentage (0-50)
  overlay: boolean // Show guide overlays
  projection: "equidistant" | "equisolid" | "orthographic" | "stereographic" // Projection type
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
function drawGuideOverlays(ctx: CanvasRenderingContext2D, size: number) {
  const center = size / 2
  const radius = center * 0.97 // Slightly inside the circle

  ctx.save()
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
  ctx.lineWidth = Math.max(1, size / 2048) // Scale line width with resolution
  ctx.setLineDash([10, 5])

  // Center crosshairs
  const crosshairSize = Math.max(20, size / 200)
  ctx.beginPath()
  ctx.moveTo(center - crosshairSize, center)
  ctx.lineTo(center + crosshairSize, center)
  ctx.moveTo(center, center - crosshairSize)
  ctx.lineTo(center, center + crosshairSize)
  ctx.stroke()

  // Concentric circles at elevation angles (10°, 20°, 30°, 40°, 50°, 60°, 70°, 80°)
  for (let elevation = 10; elevation <= 80; elevation += 10) {
    const elevationRad = (elevation * Math.PI) / 180
    const circleRadius = (elevationRad / (Math.PI / 2)) * radius

    ctx.beginPath()
    ctx.arc(center, center, circleRadius, 0, 2 * Math.PI)
    ctx.stroke()
  }

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
  const markerSize = Math.max(10, size / 400)
  const corners = [
    { x: markerSize, y: markerSize },
    { x: size - markerSize, y: markerSize },
    { x: markerSize, y: size - markerSize },
    { x: size - markerSize, y: size - markerSize },
  ]

  ctx.setLineDash([])
  ctx.lineWidth = Math.max(2, size / 1024)
  ctx.strokeStyle = "rgba(255, 0, 0, 0.7)"
  corners.forEach((corner) => {
    ctx.beginPath()
    ctx.moveTo(corner.x - markerSize / 2, corner.y)
    ctx.lineTo(corner.x + markerSize / 2, corner.y)
    ctx.moveTo(corner.x, corner.y - markerSize / 2)
    ctx.lineTo(corner.x, corner.y + markerSize / 2)
    ctx.stroke()
  })

  // Cardinal direction labels
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
  ctx.font = `${Math.max(12, size / 200)}px Arial`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const labelRadius = radius * 0.9
  const directions = [
    { label: "N", angle: -Math.PI / 2 },
    { label: "E", angle: 0 },
    { label: "S", angle: Math.PI / 2 },
    { label: "W", angle: Math.PI },
  ]

  directions.forEach((dir) => {
    const x = center + Math.cos(dir.angle) * labelRadius
    const y = center + Math.sin(dir.angle) * labelRadius
    ctx.fillText(dir.label, x, y)
  })

  // Center zenith marker
  ctx.fillStyle = "rgba(255, 0, 0, 0.8)"
  ctx.beginPath()
  ctx.arc(center, center, Math.max(2, size / 512), 0, 2 * Math.PI)
  ctx.fill()

  ctx.restore()
}

/**
 * Generate domemaster from equirectangular image
 */
export async function generateDomemaster(imageBlob: Blob, options: DomemasterOptions): Promise<Blob> {
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
        const { size, bleedPercent, overlay, projection } = options

        canvas.width = size
        canvas.height = size

        // Fill with black background
        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 0, size, size)

        const centerX = size / 2
        const centerY = size / 2
        const radius = (size / 2) * (1 - bleedPercent / 100)

        console.log(`🔄 Generating ${size}x${size} domemaster with ${projection} projection...`)

        // Create image data for pixel manipulation
        const imageData = ctx.createImageData(size, size)
        const data = imageData.data

        // Process each pixel
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const dx = x - centerX
            const dy = y - centerY
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance <= radius) {
              // Convert dome coordinates to spherical coordinates
              const { theta, phi } = domeToSpherical(dx, dy, radius, projection)

              // Convert spherical to equirectangular coordinates
              const srcX = ((theta + Math.PI) / (2 * Math.PI)) * img.width
              const srcY = (phi / Math.PI) * img.height

              // Bilinear interpolation
              const color = bilinearSample(img, srcX, srcY)

              const idx = (y * size + x) * 4
              data[idx] = color.r
              data[idx + 1] = color.g
              data[idx + 2] = color.b
              data[idx + 3] = 255
            } else {
              // Outside dome - keep black
              const idx = (y * size + x) * 4
              data[idx] = 0
              data[idx + 1] = 0
              data[idx + 2] = 0
              data[idx + 3] = 255
            }
          }
        }

        // Draw the processed image
        ctx.putImageData(imageData, 0, 0)

        // Add overlay guides if requested
        if (overlay) {
          drawDomemasterOverlay(ctx, size, radius)
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`✅ Domemaster generated: ${size}x${size} (${Math.round(blob.size / 1024)}KB)`)
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
        reject(error)
        URL.revokeObjectURL(img.src)
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load source image"))
      URL.revokeObjectURL(img.src)
    }

    img.crossOrigin = "anonymous"
    img.src = URL.createObjectURL(imageBlob)
  })
}

/**
 * Convert dome coordinates to spherical coordinates
 */
function domeToSpherical(
  dx: number,
  dy: number,
  radius: number,
  projection: DomemasterOptions["projection"],
): { theta: number; phi: number } {
  const r = Math.sqrt(dx * dx + dy * dy) / radius

  let phi: number
  switch (projection) {
    case "equidistant":
      phi = r * (Math.PI / 2)
      break
    case "equisolid":
      phi = 2 * Math.asin(r / 2)
      break
    case "orthographic":
      phi = Math.asin(r)
      break
    case "stereographic":
      phi = 2 * Math.atan(r / 2)
      break
    default:
      phi = r * (Math.PI / 2)
  }

  const theta = Math.atan2(dy, dx)

  return { theta, phi }
}

/**
 * Bilinear interpolation sampling
 */
function bilinearSample(img: HTMLImageElement, x: number, y: number): { r: number; g: number; b: number } {
  // Create a temporary canvas to sample the image
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return { r: 0, g: 0, b: 0 }
  }

  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)

  // Clamp coordinates
  x = Math.max(0, Math.min(img.width - 1, x))
  y = Math.max(0, Math.min(img.height - 1, y))

  const x1 = Math.floor(x)
  const y1 = Math.floor(y)
  const x2 = Math.min(x1 + 1, img.width - 1)
  const y2 = Math.min(y1 + 1, img.height - 1)

  const fx = x - x1
  const fy = y - y1

  try {
    const p1 = ctx.getImageData(x1, y1, 1, 1).data
    const p2 = ctx.getImageData(x2, y1, 1, 1).data
    const p3 = ctx.getImageData(x1, y2, 1, 1).data
    const p4 = ctx.getImageData(x2, y2, 1, 1).data

    const r = (1 - fx) * (1 - fy) * p1[0] + fx * (1 - fy) * p2[0] + (1 - fx) * fy * p3[0] + fx * fy * p4[0]
    const g = (1 - fx) * (1 - fy) * p1[1] + fx * (1 - fy) * p2[1] + (1 - fx) * fy * p3[1] + fx * fy * p4[1]
    const b = (1 - fx) * (1 - fy) * p1[2] + fx * (1 - fy) * p2[2] + (1 - fx) * fy * p3[2] + fx * fy * p4[2]

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
  } catch {
    return { r: 0, g: 0, b: 0 }
  }
}

/**
 * Draw overlay guides on domemaster
 */
function drawDomemasterOverlay(ctx: CanvasRenderingContext2D, size: number, radius: number) {
  const centerX = size / 2
  const centerY = size / 2

  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
  ctx.lineWidth = 2

  // Draw elevation circles (10°, 30°, 60°, 90°)
  const elevations = [10, 30, 60, 90]
  elevations.forEach((elev) => {
    const r = (elev / 90) * radius
    ctx.beginPath()
    ctx.arc(centerX, centerY, r, 0, 2 * Math.PI)
    ctx.stroke()
  })

  // Draw azimuth lines (every 30°)
  for (let az = 0; az < 360; az += 30) {
    const angle = (az * Math.PI) / 180
    const x2 = centerX + Math.cos(angle) * radius
    const y2 = centerY + Math.sin(angle) * radius

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  // Draw cardinal directions
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
  ctx.font = `${Math.round(size / 40)}px Arial`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const labelRadius = radius * 0.9
  const directions = [
    { label: "N", angle: -Math.PI / 2 },
    { label: "E", angle: 0 },
    { label: "S", angle: Math.PI / 2 },
    { label: "W", angle: Math.PI },
  ]

  directions.forEach(({ label, angle }) => {
    const x = centerX + Math.cos(angle) * labelRadius
    const y = centerY + Math.sin(angle) * labelRadius
    ctx.fillText(label, x, y)
  })
}

/**
 * Generate synthetic equirectangular test pattern
 */
export function generateTestPattern(width = 4096, height = 2048): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    canvas.width = width
    canvas.height = height

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, "#1a1a2e")
    gradient.addColorStop(0.5, "#16213e")
    gradient.addColorStop(1, "#0f3460")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    ctx.lineWidth = 2

    // Longitude lines (vertical)
    for (let x = 0; x <= width; x += width / 24) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Latitude lines (horizontal)
    for (let y = 0; y <= height; y += height / 12) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Add text labels
    ctx.fillStyle = "white"
    ctx.font = "24px Arial"
    ctx.textAlign = "center"
    ctx.fillText("EQUIRECTANGULAR TEST PATTERN", width / 2, height / 10)
    ctx.fillText("360° × 180° Coverage", width / 2, height / 8)

    // Add directional markers
    ctx.font = "bold 16px Arial"
    ctx.fillText("ZENITH", width / 2, height * 0.05)
    ctx.fillText("HORIZON", width / 2, height / 2 + 10)
    ctx.fillText("NADIR", width / 2, height * 0.95)

    // Cardinal directions
    ctx.fillText("0°", width / 2, height * 0.15)
    ctx.fillText("90°", width * 0.75, height * 0.15)
    ctx.fillText("180°", width - 50, height * 0.15)
    ctx.fillText("270°", width * 0.25, height * 0.15)

    // Add corner markers
    const markerSize = 20
    ctx.fillStyle = "red"
    ctx.fillRect(0, 0, markerSize, markerSize)
    ctx.fillRect(width - markerSize, 0, markerSize, markerSize)
    ctx.fillRect(0, height - markerSize, markerSize, markerSize)
    ctx.fillRect(width - markerSize, height - markerSize, markerSize, markerSize)

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        resolve(blob!)
      },
      "image/png",
      1.0,
    )
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
    projection: "equidistant",
    name: "Dome 4K Preview",
    description: "4K domemaster for preview and testing",
  },
  dome8k: {
    size: 8192,
    bleedPercent: 3,
    overlay: true,
    projection: "equidistant",
    name: "Dome 8K Standard",
    description: "8K domemaster for most planetarium systems",
  },
  dome12k: {
    size: 12288,
    bleedPercent: 3,
    overlay: false,
    projection: "equidistant",
    name: "Dome 12K Ultra",
    description: "12K domemaster for high-end planetarium systems",
  },
  dome16k: {
    size: 16384,
    bleedPercent: 2,
    overlay: false,
    projection: "equidistant",
    name: "Dome 16K Extreme",
    description: "16K domemaster for cutting-edge installations",
  },
}

/**
 * Validate domemaster options
 */
export function validateDomemasterOptions(options: DomemasterOptions): string[] {
  const errors: string[] = []

  if (options.size <= 0 || options.size > 16384) {
    errors.push("Size must be between 1 and 16384 pixels")
  }

  if (options.bleedPercent < 0 || options.bleedPercent > 50) {
    errors.push("Bleed percent must be between 0 and 50")
  }

  const validProjections = ["equidistant", "equisolid", "orthographic", "stereographic"]
  if (!validProjections.includes(options.projection)) {
    errors.push(`Projection must be one of: ${validProjections.join(", ")}`)
  }

  return errors
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
