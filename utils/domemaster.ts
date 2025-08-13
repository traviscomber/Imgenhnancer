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
 * Generate a domemaster projection from an equirectangular image
 */
export async function generateDomemaster(
  sourceBlob: Blob,
  options: DomemasterOptions = {
    size: 8192,
    bleedPercent: 3,
    overlay: true,
    projection: "equidistant",
  },
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
      try {
        console.log(`🔄 Processing ${options.size}x${options.size} domemaster...`)

        canvas.width = options.size
        canvas.height = options.size
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, options.size, options.size)

        const center = options.size / 2
        const radius = center * (1 - options.bleedPercent / 100)

        // Create circular mask
        ctx.save()
        ctx.beginPath()
        ctx.arc(center, center, radius, 0, 2 * Math.PI)
        ctx.clip()

        // Process each pixel in the dome
        const imageData = ctx.createImageData(options.size, options.size)
        const data = imageData.data

        // Create temporary canvas for source image
        const sourceCanvas = document.createElement("canvas")
        const sourceCtx = sourceCanvas.getContext("2d")!
        sourceCanvas.width = img.width
        sourceCanvas.height = img.height
        sourceCtx.drawImage(img, 0, 0)
        const sourceData = sourceCtx.getImageData(0, 0, img.width, img.height)

        for (let y = 0; y < options.size; y++) {
          for (let x = 0; x < options.size; x++) {
            const dx = x - center
            const dy = y - center
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance <= radius) {
              // Convert dome coordinates to spherical coordinates
              const spherical = domeToSpherical(dx, dy, radius, options.projection)

              if (spherical) {
                // Convert spherical to equirectangular coordinates
                const equirect = sphericalToEquirectangular(spherical, img.width, img.height)

                // Sample the source image with bilinear interpolation
                const color = bilinearSample(sourceData, equirect.x, equirect.y, img.width, img.height)

                const idx = (y * options.size + x) * 4
                data[idx] = color.r
                data[idx + 1] = color.g
                data[idx + 2] = color.b
                data[idx + 3] = 255
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0)
        ctx.restore()

        // Add overlay guides if requested
        if (options.overlay) {
          drawDomemasterOverlay(ctx, center, radius)
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`✅ Domemaster generated: ${Math.round(blob.size / 1024)}KB`)
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
    img.src = URL.createObjectURL(sourceBlob)
  })
}

/**
 * Convert dome coordinates to spherical coordinates
 */
function domeToSpherical(
  x: number,
  y: number,
  radius: number,
  projection: DomemasterOptions["projection"],
): Point3D | null {
  const distance = Math.sqrt(x * x + y * y)
  if (distance > radius) return null

  const normalizedDistance = distance / radius
  let elevation: number

  switch (projection) {
    case "equidistant":
      elevation = (Math.PI / 2) * (1 - normalizedDistance)
      break
    case "equisolid":
      elevation = Math.acos(1 - 2 * normalizedDistance * normalizedDistance)
      break
    case "orthographic":
      elevation = Math.asin(normalizedDistance)
      break
    case "stereographic":
      elevation = 2 * Math.atan(normalizedDistance / 2)
      break
    default:
      elevation = (Math.PI / 2) * (1 - normalizedDistance)
  }

  const azimuth = Math.atan2(y, x)

  // Convert to Cartesian coordinates
  const cosElevation = Math.cos(elevation)
  return {
    x: cosElevation * Math.cos(azimuth),
    y: cosElevation * Math.sin(azimuth),
    z: Math.sin(elevation),
  }
}

/**
 * Convert spherical coordinates to equirectangular coordinates
 */
function sphericalToEquirectangular(point: Point3D, width: number, height: number): Point2D {
  const longitude = Math.atan2(point.y, point.x)
  const latitude = Math.asin(Math.max(-1, Math.min(1, point.z)))

  const u = (longitude + Math.PI) / (2 * Math.PI)
  const v = (Math.PI / 2 - latitude) / Math.PI

  return {
    x: u * width,
    y: v * height,
  }
}

/**
 * Bilinear interpolation sampling
 */
function bilinearSample(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number,
): { r: number; g: number; b: number } {
  const x1 = Math.floor(x) % width
  const y1 = Math.floor(y) % height
  const x2 = (x1 + 1) % width
  const y2 = (y1 + 1) % height

  const fx = x - Math.floor(x)
  const fy = y - Math.floor(y)

  const getPixel = (px: number, py: number) => {
    const idx = (py * width + px) * 4
    return {
      r: imageData.data[idx] || 0,
      g: imageData.data[idx + 1] || 0,
      b: imageData.data[idx + 2] || 0,
    }
  }

  const p1 = getPixel(x1, y1)
  const p2 = getPixel(x2, y1)
  const p3 = getPixel(x1, y2)
  const p4 = getPixel(x2, y2)

  const interpolate = (a: number, b: number, c: number, d: number) => {
    const top = a * (1 - fx) + b * fx
    const bottom = c * (1 - fx) + d * fx
    return top * (1 - fy) + bottom * fy
  }

  return {
    r: Math.round(interpolate(p1.r, p2.r, p3.r, p4.r)),
    g: Math.round(interpolate(p1.g, p2.g, p3.g, p4.g)),
    b: Math.round(interpolate(p1.b, p2.b, p3.b, p4.b)),
  }
}

/**
 * Draw overlay guides on the domemaster
 */
function drawDomemasterOverlay(ctx: CanvasRenderingContext2D, center: number, radius: number) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
  ctx.lineWidth = 2

  // Draw elevation circles every 10 degrees
  for (let elevation = 10; elevation <= 80; elevation += 10) {
    const elevationRadius = radius * (1 - (elevation * Math.PI) / 180 / (Math.PI / 2))
    ctx.beginPath()
    ctx.arc(center, center, elevationRadius, 0, 2 * Math.PI)
    ctx.stroke()
  }

  // Draw azimuth lines every 30 degrees
  for (let azimuth = 0; azimuth < 360; azimuth += 30) {
    const angle = (azimuth * Math.PI) / 180
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)

    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Draw cardinal directions
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
  ctx.font = `${Math.round(radius / 20)}px Arial`
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
    const x = center + labelRadius * Math.cos(angle)
    const y = center + labelRadius * Math.sin(angle)
    ctx.fillText(label, x, y)
  })
}

/**
 * Generate a test pattern for domemaster validation
 */
export function generateTestPattern(width = 4096, height = 2048): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  canvas.width = width
  canvas.height = height

  // Fill with gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, "#87CEEB") // Sky blue
  gradient.addColorStop(0.7, "#98FB98") // Pale green
  gradient.addColorStop(1, "#8B4513") // Saddle brown

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Draw grid lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
  ctx.lineWidth = 2

  // Longitude lines every 30 degrees
  for (let lon = 0; lon < 360; lon += 30) {
    const x = (lon / 360) * width
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Latitude lines every 30 degrees
  for (let lat = -90; lat <= 90; lat += 30) {
    const y = ((90 - lat) / 180) * height
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Add coordinate labels
  ctx.fillStyle = "white"
  ctx.font = `${Math.round(height / 40)}px Arial`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // Longitude labels
  for (let lon = 0; lon < 360; lon += 60) {
    const x = (lon / 360) * width
    ctx.fillText(`${lon}°`, x, height * 0.1)
  }

  // Latitude labels
  for (let lat = -60; lat <= 60; lat += 60) {
    const y = ((90 - lat) / 180) * height
    ctx.fillText(`${lat}°`, width * 0.05, y)
  }

  // Add center marker
  ctx.fillStyle = "red"
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, height / 100, 0, 2 * Math.PI)
  ctx.fill()

  // Add corner markers
  const markerSize = height / 50
  ctx.fillStyle = "yellow"
  const corners = [
    [markerSize, markerSize],
    [width - markerSize, markerSize],
    [markerSize, height - markerSize],
    [width - markerSize, height - markerSize],
  ]

  corners.forEach(([x, y]) => {
    ctx.beginPath()
    ctx.arc(x, y, markerSize, 0, 2 * Math.PI)
    ctx.fill()
  })

  return canvas
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
