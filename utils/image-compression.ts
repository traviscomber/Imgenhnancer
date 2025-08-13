export interface CompressionResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  format: string
  quality: number
  width?: number
  height?: number
}

/**
 * Compress large images in multiple stages to reach target size
 */
export async function compressLargeImageInStages(
  file: File,
  targetSize: number = 4 * 1024 * 1024, // Default to 4MB target (Replicate limit)
  maxIterations = 5,
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    img.onload = async () => {
      try {
        // Set initial canvas size
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        let currentBlob: Blob | null = null
        let currentSize = file.size
        let quality = 0.9
        let format = "image/jpeg"
        let scaleFactor = 1.0
        let iteration = 0
        let currentWidth = img.width
        let currentHeight = img.height

        // Determine best format based on image content
        const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 1000), Math.min(canvas.height, 1000))
        const hasTransparency = checkForTransparency(imageData)

        if (hasTransparency) {
          format = "image/png"
          quality = 0.8
        } else if (isPhotographic(imageData)) {
          format = "image/jpeg"
          quality = 0.85
        } else {
          format = "image/webp"
          quality = 0.8
        }

        console.log(`🔍 Initial analysis: ${format}, ${quality} quality, ${currentWidth}x${currentHeight}`)

        while (currentSize > targetSize && iteration < maxIterations) {
          iteration++

          // Adjust compression strategy based on iteration
          if (iteration === 1) {
            // First try: reduce quality
            quality = Math.max(0.6, quality - 0.2)
          } else if (iteration === 2) {
            // Second try: switch to more efficient format if possible
            if (format === "image/png" && !hasTransparency) {
              format = "image/jpeg"
              quality = 0.7
            } else if (format === "image/jpeg") {
              format = "image/webp"
              quality = 0.6
            }
          } else {
            // Subsequent tries: reduce dimensions
            scaleFactor = Math.max(0.5, scaleFactor - 0.15)
            currentWidth = Math.floor(img.width * scaleFactor)
            currentHeight = Math.floor(img.height * scaleFactor)

            canvas.width = currentWidth
            canvas.height = currentHeight
            ctx.clearRect(0, 0, currentWidth, currentHeight)

            // Use high-quality scaling
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
            ctx.drawImage(img, 0, 0, currentWidth, currentHeight)

            quality = Math.max(0.4, quality + 0.1) // Increase quality when reducing size
          }

          // Create blob with current settings
          currentBlob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, format, quality)
          })

          if (!currentBlob) {
            throw new Error("Failed to create compressed blob")
          }

          currentSize = currentBlob.size

          console.log(
            `🔄 Compression iteration ${iteration}: ${format} @ ${Math.round(quality * 100)}% quality, ${currentWidth}x${currentHeight} = ${formatFileSize(currentSize)}`,
          )
        }

        if (!currentBlob) {
          throw new Error("Compression failed to produce a blob")
        }

        const result: CompressionResult = {
          blob: currentBlob,
          originalSize: file.size,
          compressedSize: currentBlob.size,
          compressionRatio: file.size / currentBlob.size,
          format,
          quality: Math.round(quality * 100),
          width: currentWidth,
          height: currentHeight,
        }

        console.log(
          `✅ Compression complete: ${formatFileSize(file.size)} → ${formatFileSize(currentBlob.size)} (${result.compressionRatio.toFixed(2)}x reduction)`,
        )
        resolve(result)
      } catch (error) {
        reject(new Error(`Compression failed: ${error instanceof Error ? error.message : "Unknown error"}`))
      } finally {
        URL.revokeObjectURL(img.src)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error("Failed to load image for compression"))
    }

    try {
      const imageUrl = URL.createObjectURL(file)
      img.src = imageUrl
    } catch (error) {
      reject(
        new Error(
          `Failed to create object URL for compression: ${error instanceof Error ? error.message : "Unknown error"}`,
        ),
      )
    }
  })
}

/**
 * Create a progressive preview for large files
 */
export async function createProgressivePreview(file: File, maxSize = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context for preview"))
      return
    }

    img.onload = () => {
      try {
        // Calculate preview dimensions
        const aspectRatio = img.width / img.height
        let previewWidth = maxSize
        let previewHeight = maxSize

        if (aspectRatio > 1) {
          previewHeight = Math.floor(maxSize / aspectRatio)
        } else {
          previewWidth = Math.floor(maxSize * aspectRatio)
        }

        canvas.width = previewWidth
        canvas.height = previewHeight
        ctx.drawImage(img, 0, 0, previewWidth, previewHeight)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const previewUrl = URL.createObjectURL(blob)
              resolve(previewUrl)
            } else {
              reject(new Error("Failed to create preview blob"))
            }
          },
          "image/jpeg",
          0.7,
        )
      } catch (error) {
        reject(new Error(`Preview generation failed: ${error instanceof Error ? error.message : "Unknown error"}`))
      } finally {
        URL.revokeObjectURL(img.src)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error("Failed to load image for preview"))
    }

    try {
      const imageUrl = URL.createObjectURL(file)
      img.src = imageUrl
    } catch (error) {
      reject(
        new Error(
          `Failed to create object URL for preview: ${error instanceof Error ? error.message : "Unknown error"}`,
        ),
      )
    }
  })
}

/**
 * Check if image has transparency
 */
function checkForTransparency(imageData: ImageData): boolean {
  const data = imageData.data
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true
    }
  }
  return false
}

/**
 * Determine if image is photographic (vs graphics/text)
 */
function isPhotographic(imageData: ImageData): boolean {
  const data = imageData.data
  const sampleSize = Math.min(10000, data.length / 4) // Sample up to 10k pixels
  const step = Math.floor(data.length / 4 / sampleSize)

  let colorVariations = 0
  let totalSamples = 0

  for (let i = 0; i < data.length - 4; i += step * 4) {
    const r1 = data[i],
      g1 = data[i + 1],
      b1 = data[i + 2]
    const r2 = data[i + 4],
      g2 = data[i + 5],
      b2 = data[i + 6]

    const colorDiff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)
    if (colorDiff > 10) colorVariations++
    totalSamples++
  }

  const variationRatio = colorVariations / totalSamples
  return variationRatio > 0.3 // If >30% of adjacent pixels differ significantly, likely photographic
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Split large image into tiles for processing
 */
export async function splitImageIntoTiles(file: File, maxTileSize = 2048, overlap = 128): Promise<Blob[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        const width = img.width
        const height = img.height

        // Calculate number of tiles needed
        const tilesX = Math.ceil(width / (maxTileSize - overlap))
        const tilesY = Math.ceil(height / (maxTileSize - overlap))

        console.log(`🧩 Splitting image into ${tilesX}x${tilesY} tiles`)

        const tiles: Promise<Blob>[] = []

        // Create tiles
        for (let y = 0; y < tilesY; y++) {
          for (let x = 0; x < tilesX; x++) {
            // Calculate tile coordinates with overlap
            const tileX = x * (maxTileSize - overlap)
            const tileY = y * (maxTileSize - overlap)
            const tileWidth = Math.min(maxTileSize, width - tileX)
            const tileHeight = Math.min(maxTileSize, height - tileY)

            // Create tile canvas
            const tileCanvas = document.createElement("canvas")
            tileCanvas.width = tileWidth
            tileCanvas.height = tileHeight
            const tileCtx = tileCanvas.getContext("2d")

            if (!tileCtx) {
              continue
            }

            // Draw portion of image to tile
            tileCtx.drawImage(img, tileX, tileY, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight)

            // Convert tile to blob
            const tilePromise = new Promise<Blob>((resolve) => {
              tileCanvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(blob)
                  } else {
                    resolve(new Blob([])) // Empty blob as fallback
                  }
                },
                "image/jpeg",
                0.9,
              )
            })

            tiles.push(tilePromise)
          }
        }

        // Wait for all tiles to be created
        Promise.all(tiles).then(resolve).catch(reject)
      } catch (error) {
        reject(error)
      } finally {
        URL.revokeObjectURL(img.src)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error("Failed to load image for tiling"))
    }

    const imageUrl = URL.createObjectURL(file)
    img.src = imageUrl
  })
}

/**
 * Aggressively compress image for API submission
 */
export async function compressForApiSubmission(file: File, maxSizeMB = 4): Promise<CompressionResult> {
  const targetSize = maxSizeMB * 1024 * 1024

  // First try standard compression
  try {
    const result = await compressLargeImageInStages(file, targetSize, 8)

    // If we're still over the limit, apply more aggressive compression
    if (result.compressedSize > targetSize) {
      console.log(`⚠️ Standard compression insufficient, applying aggressive compression`)

      // Create a new image from the compressed blob
      const compressedFile = new File([result.blob], file.name, { type: result.blob.type })

      // Apply a second round with more aggressive settings
      const maxDimension = 1600 // Limit maximum dimension
      const aspectRatio = result.width && result.height ? result.width / result.height : 1

      let newWidth, newHeight
      if (aspectRatio > 1) {
        newWidth = Math.min(maxDimension, result.width || 1600)
        newHeight = Math.round(newWidth / aspectRatio)
      } else {
        newHeight = Math.min(maxDimension, result.height || 1600)
        newWidth = Math.round(newHeight * aspectRatio)
      }

      // Create a new canvas with reduced dimensions
      const canvas = document.createElement("canvas")
      canvas.width = newWidth
      canvas.height = newHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Draw the image at reduced size
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = URL.createObjectURL(compressedFile)
      })

      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      URL.revokeObjectURL(img.src)

      // Get the final blob with very low quality
      const finalBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob || new Blob([]))
          },
          "image/jpeg",
          0.5,
        ) // Very low quality
      })

      return {
        blob: finalBlob,
        originalSize: file.size,
        compressedSize: finalBlob.size,
        compressionRatio: file.size / finalBlob.size,
        format: "image/jpeg",
        quality: 50,
        width: newWidth,
        height: newHeight,
      }
    }

    return result
  } catch (error) {
    console.error("Failed standard compression, falling back to aggressive compression", error)

    // Fallback to very aggressive compression
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        try {
          // Determine dimensions (max 1200px on longest side)
          const maxDimension = 1200
          const aspectRatio = img.width / img.height

          let width, height
          if (aspectRatio > 1) {
            width = maxDimension
            height = Math.round(width / aspectRatio)
          } else {
            height = maxDimension
            width = Math.round(height * aspectRatio)
          }

          // Create canvas and draw image
          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          if (!ctx) {
            throw new Error("Could not get canvas context")
          }

          ctx.drawImage(img, 0, 0, width, height)

          // Get blob with low quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create blob"))
                return
              }

              resolve({
                blob,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: file.size / blob.size,
                format: "image/jpeg",
                quality: 40,
                width,
                height,
              })
            },
            "image/jpeg",
            0.4,
          )
        } catch (error) {
          reject(error)
        } finally {
          URL.revokeObjectURL(img.src)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        reject(new Error("Failed to load image for aggressive compression"))
      }

      img.src = URL.createObjectURL(file)
    })
  }
}
