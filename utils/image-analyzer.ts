/**
 * AI-Powered Image Analysis for Smart Preset Recommendations
 * Analyzes uploaded images to detect cultural elements, vintage quality, and optimal enhancement settings
 */

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
  analysis: {
    colorVariance: number
    brightness: number
    edgeCount: number
    skinTonePixels: number
    culturalColorPixels: number
  }
}

export async function analyzeImage(file: File): Promise<ImageAnalysisResult> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d", { willReadFrequently: true })

    img.onload = () => {
      try {
        // Set canvas size (downsample for faster analysis)
        const maxSize = 800
        let width = img.width
        let height = img.height

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width
            width = maxSize
          } else {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        if (!ctx) {
          throw new Error("Could not get canvas context")
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height)

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        const pixelCount = width * height

        // ===== COLOR ANALYSIS =====
        let totalR = 0,
          totalG = 0,
          totalB = 0
        let colorVariance = 0
        let brightness = 0

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          totalR += r
          totalG += g
          totalB += b

          // Calculate color variance (how different RGB values are)
          const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)
          colorVariance += variance

          // Calculate brightness
          brightness += (r + g + b) / 3
        }

        const avgR = totalR / pixelCount
        const avgG = totalG / pixelCount
        const avgB = totalB / pixelCount
        const avgColorVariance = colorVariance / pixelCount
        const avgBrightness = brightness / pixelCount

        // Detect black and white (low color variance)
        const isBlackAndWhite = avgColorVariance < 15

        console.log("📊 Color Analysis:", {
          avgR: avgR.toFixed(2),
          avgG: avgG.toFixed(2),
          avgB: avgB.toFixed(2),
          colorVariance: avgColorVariance.toFixed(2),
          brightness: avgBrightness.toFixed(2),
          isBlackAndWhite,
        })

        // ===== VINTAGE QUALITY DETECTION =====
        // Sepia tones: R > G > B with small differences
        const isSepiaLike = avgR > avgG && avgG > avgB && avgR - avgB < 50 && avgR - avgG < 30

        // Low saturation (not B&W but muted colors)
        const isLowSaturation = avgColorVariance > 15 && avgColorVariance < 40

        // Dark or faded (low brightness or very high brightness)
        const isFaded = avgBrightness < 100 || avgBrightness > 200

        const hasVintageQuality = isSepiaLike || isLowSaturation || (isFaded && isBlackAndWhite)

        // ===== ERA ESTIMATION =====
        let estimatedEra = "2000s-Present"
        if (isBlackAndWhite && avgBrightness < 80) {
          estimatedEra = "1920s-1950s"
        } else if (isBlackAndWhite && hasVintageQuality) {
          estimatedEra = "1950s-1970s"
        } else if (hasVintageQuality && isSepiaLike) {
          estimatedEra = "1960s-1980s"
        } else if (hasVintageQuality) {
          estimatedEra = "1980s-1990s"
        }

        // ===== DAMAGE DETECTION =====
        let edgeCount = 0
        const stride = 4 // Sample every 4th pixel for performance

        for (let i = 0; i < data.length - 4; i += 4 * stride) {
          const curr = (data[i] + data[i + 1] + data[i + 2]) / 3
          const next = (data[i + 4] + data[i + 5] + data[i + 6]) / 3

          // High contrast edges might indicate scratches/damage
          if (Math.abs(curr - next) > 100) {
            edgeCount++
          }
        }

        const edgeRatio = edgeCount / (pixelCount / stride)
        const hasScratches = edgeRatio > 0.05 // More than 5% high-contrast edges

        console.log("🔍 Damage Detection:", {
          edgeCount,
          edgeRatio: edgeRatio.toFixed(4),
          hasScratches,
        })

        // ===== FACE/SKIN DETECTION =====
        let skinTonePixels = 0
        let asianSkinTonePixels = 0

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // General skin tone detection
          // Skin has more red than green, more green than blue
          if (r > 60 && g > 40 && b > 20 && r > g && g > b && r - g < 80) {
            skinTonePixels++

            // Asian skin tone detection (warm, medium tones)
            // Typical range: R:180-230, G:140-190, B:110-160
            if (r >= 170 && r <= 240 && g >= 130 && g <= 200 && b >= 100 && b <= 170) {
              asianSkinTonePixels++
            }
          }
        }

        const skinRatio = skinTonePixels / pixelCount
        const asianSkinRatio = asianSkinTonePixels / pixelCount

        const hasFaces = skinRatio > 0.03 // At least 3% skin tone
        const hasAsianFeatures = asianSkinRatio > 0.02 // At least 2% Asian skin tone

        console.log("👤 Face Detection:", {
          skinPixels: skinTonePixels,
          skinRatio: skinRatio.toFixed(4),
          asianSkinRatio: asianSkinRatio.toFixed(4),
          hasFaces,
          hasAsianFeatures,
        })

        // ===== CULTURAL ELEMENTS DETECTION =====
        let culturalColorPixels = 0
        let goldPixels = 0

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // Gold/yellow tones (traditional Indonesian wedding colors)
          // Gold: R>150, G>100, B<100
          if (r > 150 && g > 100 && b < 100 && r > g && g > b) {
            goldPixels++
            culturalColorPixels++
          }

          // Deep red (traditional batik, kebaya)
          // Red: R>120, G<70, B<70
          if (r > 120 && g < 70 && b < 70) {
            culturalColorPixels++
          }

          // Brown/earth tones (batik patterns)
          // Brown: R>80, G>60, B<60
          if (r > 80 && r < 160 && g > 60 && g < 140 && b > 40 && b < 100 && r > g && g > b) {
            culturalColorPixels++
          }
        }

        const culturalRatio = culturalColorPixels / pixelCount
        const goldRatio = goldPixels / pixelCount

        const hasCulturalElements = culturalRatio > 0.08 // At least 8% cultural colors
        const hasTraditionalClothing = culturalRatio > 0.15 || goldRatio > 0.05 // Strong presence

        console.log("🎨 Cultural Detection:", {
          culturalPixels: culturalColorPixels,
          goldPixels,
          culturalRatio: culturalRatio.toFixed(4),
          goldRatio: goldRatio.toFixed(4),
          hasCulturalElements,
          hasTraditionalClothing,
        })

        // ===== IMAGE TYPE CLASSIFICATION =====
        let imageType: ImageAnalysisResult["imageType"] = "portrait"

        // Check filename for hints
        const fileName = file.name.toLowerCase()
        if (
          fileName.includes("wedding") ||
          fileName.includes("pernikahan") ||
          fileName.includes("nikah") ||
          fileName.includes("bride")
        ) {
          imageType = "wedding"
        } else if (
          fileName.includes("batik") ||
          fileName.includes("textile") ||
          fileName.includes("kain") ||
          fileName.includes("fabric")
        ) {
          imageType = "textile"
        } else if (
          fileName.includes("document") ||
          fileName.includes("certificate") ||
          fileName.includes("cert") ||
          fileName.includes("paper")
        ) {
          imageType = "document"
        } else if (
          fileName.includes("family") ||
          fileName.includes("keluarga") ||
          fileName.includes("grup") ||
          fileName.includes("group")
        ) {
          imageType = "family"
        } else if (fileName.includes("vintage") || fileName.includes("old") || fileName.includes("antique")) {
          imageType = "vintage"
        }
        // Content-based classification
        else if (hasFaces && hasTraditionalClothing && goldRatio > 0.03) {
          imageType = "wedding"
        } else if (hasCulturalElements && !hasFaces && culturalRatio > 0.2) {
          imageType = "textile"
        } else if (!hasFaces && hasScratches && isBlackAndWhite) {
          imageType = "document"
        } else if (hasFaces && hasAsianFeatures) {
          imageType = hasVintageQuality ? "vintage" : "family"
        } else if (!hasFaces && !hasCulturalElements) {
          imageType = "landscape"
        }

        console.log("🏷️ Image Type:", imageType)

        // ===== PRESET RECOMMENDATION =====
        let recommendedPreset = "family-portrait"
        let confidence = 0.6

        // Indonesian Wedding (highest priority)
        if (imageType === "wedding" || (hasFaces && hasTraditionalClothing && hasCulturalElements)) {
          recommendedPreset = "indonesian-wedding"
          confidence = 0.85
          if (goldRatio > 0.05) confidence = 0.92 // High confidence if gold present
          if (hasAsianFeatures) confidence += 0.03
        }
        // Batik & Textiles
        else if (imageType === "textile" || (hasCulturalElements && !hasFaces && culturalRatio > 0.15)) {
          recommendedPreset = "batik-textile"
          confidence = 0.8
          if (culturalRatio > 0.25) confidence = 0.88
        }
        // Historical Document
        else if (imageType === "document" || (!hasFaces && hasScratches && isBlackAndWhite)) {
          recommendedPreset = "old-document"
          confidence = 0.75
          if (hasScratches && isBlackAndWhite) confidence = 0.85
        }
        // ASEAN Heritage (vintage with faces)
        else if (hasVintageQuality && isBlackAndWhite && hasFaces) {
          recommendedPreset = "asean-heritage"
          confidence = 0.9
          if (hasAsianFeatures) confidence = 0.93
          if (hasScratches) confidence += 0.02
        }
        // Vintage Photo
        else if (hasVintageQuality && hasFaces) {
          recommendedPreset = "vintage-photo"
          confidence = 0.8
          if (hasAsianFeatures) confidence += 0.05
        }
        // Family Portrait
        else if (hasFaces && hasAsianFeatures) {
          recommendedPreset = "family-portrait"
          confidence = 0.7
          if (!hasVintageQuality && !hasScratches) confidence = 0.75
        }
        // Default to heritage for damaged photos
        else if (hasScratches || hasVintageQuality) {
          recommendedPreset = "asean-heritage"
          confidence = 0.65
        }

        // Confidence boosters
        if (hasAsianFeatures && hasFaces) confidence = Math.min(confidence + 0.05, 0.95)
        if (hasScratches && hasVintageQuality) confidence = Math.min(confidence + 0.03, 0.95)
        if (hasCulturalElements && hasTraditionalClothing) confidence = Math.min(confidence + 0.08, 0.95)

        console.log("✨ Recommendation:", {
          preset: recommendedPreset,
          confidence: confidence.toFixed(2),
        })

        const result: ImageAnalysisResult = {
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
          analysis: {
            colorVariance: avgColorVariance,
            brightness: avgBrightness,
            edgeCount,
            skinTonePixels,
            culturalColorPixels,
          },
        }

        resolve(result)
      } catch (error) {
        console.error("❌ Analysis error:", error)
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    // Load the image
    img.src = URL.createObjectURL(file)
  })
}
