export type DomemasterProjection = "equidistant" // reservado para futuras proyecciones

export interface DomemasterOptions {
  size: number // 4096, 8192, 12288...
  bleedPercent: number // margen negro de seguridad (0-5%)
  overlay: boolean // dibujar overlays (círculo, anillos cada 10°, ejes)
  projection?: DomemasterProjection // por ahora fijo "equidistant" (placeholder)
}

/**
 * Genera un domemaster "simple":
 * - Lienzo cuadrado N×N
 * - Fondo negro puro (#000)
 * - Máscara circular con bleed (margen) configurable
 * - Imagen centrada y escalada con "cover" para rellenar el círculo
 * - Overlays opcionales (círculo, anillos 10°, ejes)
 *
 * Nota: Este util NO reproyecta equirectangular -> fisheye; es un empaquetado domemaster con máscara.
 *       La conversión de proyección puede añadirse posteriormente sin cambiar la API pública.
 */
export async function generateDomemaster(input: Blob | string, opts: DomemasterOptions): Promise<Blob> {
  const { size, bleedPercent, overlay } = opts
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("No canvas context")

  // Fondo negro
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, size, size)

  // Cargar imagen
  const img = await loadImage(input)

  // Círculo útil (con bleed)
  const cx = size / 2
  const cy = size / 2
  const maxRadius = size / 2
  const radius = maxRadius * (1 - Math.max(0, Math.min(bleedPercent, 10)) / 100)

  // Clip circular
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  // Dibujar imagen "cover" dentro del círculo
  const targetDiameter = radius * 2
  const scale = Math.max(targetDiameter / img.width, targetDiameter / img.height)
  const drawW = img.width * scale
  const drawH = img.height * scale
  const dx = cx - drawW / 2
  const dy = cy - drawH / 2

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(img, dx, dy, drawW, drawH)

  ctx.restore()

  // Overlays opcionales
  if (overlay) {
    drawOverlays(ctx, cx, cy, radius)
  }

  // A Blob
  const blob = await canvasToBlob(canvas, "image/png", 1.0)
  if (!blob) throw new Error("No se pudo generar el PNG")
  return blob
}

function drawOverlays(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  // Círculo exterior (borde del domo útil)
  ctx.save()
  ctx.strokeStyle = "rgba(255,255,255,0.2)"
  ctx.lineWidth = Math.max(1, Math.round(radius * 0.003))
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()

  // Anillos cada 10 grados (0..80°) aproximados
  const stepDeg = 10
  for (let deg = stepDeg; deg <= 80; deg += stepDeg) {
    const r = radius * (deg / 90) // aproximación visual
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Ejes cruzados
  ctx.beginPath()
  ctx.moveTo(cx - radius, cy)
  ctx.lineTo(cx + radius, cy)
  ctx.moveTo(cx, cy - radius)
  ctx.lineTo(cx, cy + radius)
  ctx.stroke()

  ctx.restore()
}

function loadImage(src: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve(img)
    }
    
    img.onerror = (event) => {
      reject(new Error(`Failed to load image: ${event instanceof ErrorEvent ? event.message : 'Image load error'}`))
    }
    
    try {
      if (typeof src === "string") {
        img.src = src
      } else {
        const imageUrl = URL.createObjectURL(src)
        img.src = imageUrl
        
        // Clean up the URL after the image loads or fails
        const cleanup = () => URL.revokeObjectURL(imageUrl)
        img.addEventListener('load', cleanup, { once: true })
        img.addEventListener('error', cleanup, { once: true })
      }
    } catch (error) {
      reject(new Error(`Failed to create image source: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}
