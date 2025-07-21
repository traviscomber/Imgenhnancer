import { NextResponse } from "next/server"
import sharp from "sharp"

// Force Node.js runtime so native modules like `sharp` work
export const runtime = "nodejs"

// Define the Replicate models with their versions
const REPLICATE_MODELS = {
  "real-esrgan-4x": {
    version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
    inputField: "image",
  },
  "stable-diffusion-upscaler": {
    version: "ad59ca21177f9e217b9075e7300cf6e14f7e5b4505b87b9689dbd866e9768969",
    inputField: "image",
  },
  "swin2sr-4x": {
    version: "d0ee3d708c9d42645a4766f679c2e1ee43ef7783b7afb46a3af1f6e9080f0c69",
    inputField: "image",
  },
}

// Helper function to compress an image using sharp
async function compressImage(base64Image: string, quality = 80): Promise<string> {
  try {
    // Remove the data URL prefix if present
    const base64Data = base64Image.includes("base64,") ? base64Image.split("base64,")[1] : base64Image

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, "base64")

    // Get image info to determine format
    const imageInfo = await sharp(imageBuffer).metadata()
    const format = imageInfo.format || "jpeg"

    // Compress the image
    const compressedBuffer = await sharp(imageBuffer)
      .toFormat(format as keyof sharp.FormatEnum, { quality })
      .toBuffer()

    // Convert back to base64
    const compressedBase64 = compressedBuffer.toString("base64")

    // Return with appropriate data URL prefix
    const mimeType = `image/${format === "jpeg" ? "jpeg" : format}`
    return `data:${mimeType};base64,${compressedBase64}`
  } catch (error) {
    console.error("Image compression failed:", error)
    return base64Image // Return original if compression fails
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()
  const metrics = {
    originalSize: 0,
    compressedSize: 0,
    compressionRatio: 0,
    processingTimeMs: 0,
    compressionTimeMs: 0,
    replicateTimeMs: 0,
    qualityUsed: 100,
    compressionAttempts: 0,
  }

  try {
    // Parse the request body
    let requestBody
    try {
      requestBody = await request.json()
    } catch (error) {
      console.error("Failed to parse request body:", error)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Extract the settings and image data
    const { settings, imageData } = requestBody

    if (!settings || !imageData) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Validate the model ID
    const modelId = settings.modelId || "real-esrgan-4x"
    if (!REPLICATE_MODELS[modelId as keyof typeof REPLICATE_MODELS]) {
      return NextResponse.json({ error: `Unknown model ID: ${modelId}` }, { status: 400 })
    }

    // Get model configuration
    const modelConfig = REPLICATE_MODELS[modelId as keyof typeof REPLICATE_MODELS]

    // Prepare the Replicate API request with the correct version and input field
    const replicateSettings = {
      ...settings,
      version: modelConfig.version,
    }

    // Calculate original size
    metrics.originalSize = Math.round((imageData.length * 3) / 4) // Approximate size of base64 data

    // Check if the image is too large (8MB limit for Replicate API)
    const MAX_PAYLOAD_SIZE = 8 * 1024 * 1024 // 8MB
    const COMPRESSION_THRESHOLD = 6 * 1024 * 1024 // 6MB

    let compressedImageData = imageData
    let currentQuality = 90

    // Start compression if the image is large
    if (metrics.originalSize > COMPRESSION_THRESHOLD) {
      console.log(`Image size (${Math.round(metrics.originalSize / 1024)}KB) exceeds threshold, compressing...`)

      const compressionStart = Date.now()
      metrics.compressionAttempts++

      // Try to compress the image
      compressedImageData = await compressImage(imageData, currentQuality)
      metrics.compressedSize = Math.round((compressedImageData.length * 3) / 4)

      // If still too large, compress more aggressively
      while (metrics.compressedSize > MAX_PAYLOAD_SIZE && currentQuality > 30) {
        currentQuality -= 10
        metrics.compressionAttempts++
        console.log(`Further compression needed. Trying quality: ${currentQuality}`)
        compressedImageData = await compressImage(compressedImageData, currentQuality)
        metrics.compressedSize = Math.round((compressedImageData.length * 3) / 4)
      }

      metrics.compressionTimeMs = Date.now() - compressionStart
      metrics.qualityUsed = currentQuality
      metrics.compressionRatio = metrics.originalSize / metrics.compressedSize

      console.log(
        `Compression complete: ${Math.round(metrics.compressedSize / 1024)}KB (${Math.round(metrics.compressionRatio * 100)}% reduction)`,
      )
    } else {
      metrics.compressedSize = metrics.originalSize
      metrics.compressionRatio = 1
    }

    // Check if the image is still too large after compression
    if (metrics.compressedSize > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        {
          error: "Image is too large even after compression",
          metrics,
        },
        { status: 413 },
      )
    }

    // Prepare the input for Replicate API
    const input = {
      [modelConfig.inputField]: compressedImageData,
      scale: settings.scale || 4,
    }

    // Make the request to Replicate API
    console.log(`Sending request to Replicate API for model: ${modelId}`)
    const replicateStart = Date.now()

    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: modelConfig.version,
        input,
      }),
    })

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text()
      console.error(`❌ Replicate API error: ${replicateResponse.status} `, errorText)
      return NextResponse.json(
        {
          error: `Replicate API error: ${replicateResponse.status}`,
          details: errorText,
          metrics,
        },
        { status: replicateResponse.status },
      )
    }

    const prediction = await replicateResponse.json()
    metrics.replicateTimeMs = Date.now() - replicateStart

    // Return the prediction data
    metrics.processingTimeMs = Date.now() - startTime

    return NextResponse.json({
      success: true,
      prediction,
      metrics,
    })
  } catch (error) {
    console.error("Error in enhance-replicate API:", error)

    metrics.processingTimeMs = Date.now() - startTime

    return NextResponse.json(
      {
        error: "Failed to process image",
        details: error instanceof Error ? error.message : String(error),
        metrics,
      },
      { status: 500 },
    )
  }
}
