export interface ImageAnalysisResult {
  imageType: "portrait" | "wedding" | "document" | "textile" | "landscape" | "family" | "vintage"
  isBlackAndWhite: boolean
  hasVintageQuality: boolean
  hasFaces: boolean
  hasAsianFeatures: boolean
  hasScratches: boolean
  hasCulturalElements: boolean
  hasTraditionalClothing: boolean
  estimatedEra: string
  confidence: number
  recommendedPreset: string
}

export async function analyzeImage(file: File): Promise<ImageAnalysisResult> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    img.onload = () => {
      try {
        // Set canvas size
        canvas.width = img.width
        canvas.height = img.height

        if (!ctx) {
          throw new Error("Could not get canvas context")
        }

        // Draw image
        ctx.drawImage(img, 0, 0)

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Analyze color
        let totalR = 0,
          totalG = 0,
          totalB = 0
        let colorVariance = 0
        let pixelCount = 0

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          totalR += r
          totalG += g
          totalB += b

          // Check color variance (distance between RGB values)
          const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)
          colorVariance += variance

          pixelCount++
        }

        const avgR = totalR / pixelCount
        const avgG = totalG / pixelCount
        const avgB = totalB / pixelCount
        const avgColorVariance = colorVariance / pixelCount

        // Detect black and white
        const isBlackAndWhite = avgColorVariance < 15

        // Detect vintage quality (sepia tones, low saturation)
        const hasVintageQuality =
          (avgR > avgG && avgR > avgB && avgR - avgG < 30) || // Sepia
          (avgColorVariance < 30 && !isBlackAndWhite) // Low saturation

        // Estimate era based on quality
        let estimatedEra = "2000s-Present"
        if (isBlackAndWhite && hasVintageQuality) {
          estimatedEra = "1920s-1960s"
        } else if (hasVintageQuality) {
          estimatedEra = "1960s-1990s"
        } else if (isBlackAndWhite) {
          estimatedEra = "1970s-1990s"
        }

        // Detect scratches and damage (high contrast edges, noise)
        let edgeCount = 0
        for (let i = 0; i < data.length - 4; i += 4) {
          const curr = data[i]
          const next = data[i + 4]
          if (Math.abs(curr - next) > 100) {
            edgeCount++
          }
        }
        const hasScratches = edgeCount > pixelCount * 0.05

        // Basic face detection (skin tone detection)
        let skinTonePixels = 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Skin tone detection (simplified)
          if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) < 50) {
            skinTonePixels++
          }
        }
        const hasFaces = skinTonePixels > pixelCount * 0.03

        // Detect Asian features (warm, medium skin tones)
        let asianSkinTonePixels = 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Asian skin tone range (simplified)
          if (r >= 180 && r <= 230 && g >= 140 && g <= 190 && b >= 110 && b <= 160 && r > g && g > b) {
            asianSkinTonePixels++
          }
        }
        const hasAsianFeatures = asianSkinTonePixels > pixelCount * 0.02

        // Detect cultural elements (gold/yellow tones, rich colors)
        let culturalColorPixels = 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Gold/yellow tones (traditional clothing, batik)
          if (
            (r > 150 && g > 100 && b < 100) || // Gold
            (r > 100 && g < 50 && b < 50)
          ) {
            // Red (traditional)
            culturalColorPixels++
          }
        }
        const hasCulturalElements = culturalColorPixels > pixelCount * 0.08
        const hasTraditionalClothing = culturalColorPixels > pixelCount * 0.15

        // Detect image type
        let imageType: ImageAnalysisResult["imageType"] = "portrait"

        // Check filename for hints
        const fileName = file.name.toLowerCase()
        if (fileName.includes("wedding") || fileName.includes("pernikahan")) {
          imageType = "wedding"
        } else if (fileName.includes("batik") || fileName.includes("textile") || fileName.includes("kain")) {
          imageType = "textile"
        } else if (fileName.includes("document") || fileName.includes("certificate")) {
          imageType = "document"
        } else if (fileName.includes("family") || fileName.includes("keluarga")) {
          imageType = "family"
        } else if (hasVintageQuality) {
          imageType = "vintage"
        } else if (hasFaces && hasTraditionalClothing) {
          imageType = "wedding"
        } else if (hasCulturalElements && !hasFaces) {
          imageType = "textile"
        } else if (hasFaces && hasAsianFeatures) {
          imageType = "family"
        } else if (!hasFaces && !hasCulturalElements) {
          imageType = "landscape"
        }

        // Determine recommended preset
        let recommendedPreset = "family-portrait"
        let confidence = 0.6

        if (imageType === "wedding" || (hasFaces && hasTraditionalClothing && hasCulturalElements)) {
          recommendedPreset = "indonesian-wedding"
          confidence = 0.85
        } else if (imageType === "textile" || (hasCulturalElements && !hasFaces)) {
          recommendedPreset = "batik-textile"
          confidence = 0.8
        } else if (imageType === "document" || (!hasFaces && hasScratches)) {
          recommendedPreset = "old-document"
          confidence = 0.75
        } else if (hasVintageQuality && isBlackAndWhite && hasFaces) {
          recommendedPreset = "asean-heritage"
          confidence = 0.9
        } else if (hasVintageQuality && hasFaces) {
          recommendedPreset = "vintage-photo"
          confidence = 0.8
        } else if (hasFaces && hasAsianFeatures) {
          recommendedPreset = "family-portrait"
          confidence = 0.7
        } else if (hasScratches || hasVintageQuality) {
          recommendedPreset = "asean-heritage"
          confidence = 0.65
        }

        // Boost confidence if multiple indicators match
        if (hasAsianFeatures && hasFaces) confidence += 0.05
        if (hasScratches && hasVintageQuality) confidence += 0.05
        if (hasCulturalElements && hasTraditionalClothing) confidence += 0.1
        confidence = Math.min(confidence, 0.95)

        resolve({
          imageType,
          isBlackAndWhite,
          hasVintageQuality,
          hasFaces,
          hasAsianFeatures,
          hasScratches,
          hasCulturalElements,
          hasTraditionalClothing,
          estimatedEra,
          confidence,
          recommendedPreset,
        })
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    img.src = URL.createObjectURL(file)
  })
}
