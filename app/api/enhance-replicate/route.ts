import { type NextRequest, NextResponse } from "next/server"

// Increase body size limit for large files
export const maxDuration = 900 // 15 minutes
export const dynamic = "force-dynamic"

// Maximum payload size for Replicate API (4MB is a safe limit)
const MAX_REPLICATE_PAYLOAD_SIZE = 4 * 1024 * 1024

export async function POST(request: NextRequest) {
  console.log("🚀 Starting Replicate enhancement...")

  try {
    // Check API token first
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ REPLICATE_API_TOKEN not configured")
      return NextResponse.json(
        { success: false, error: "REPLICATE_API_TOKEN not configured", step: "config_check" },
        { status: 500 },
      )
    }

    console.log("✅ API token configured")

    // Parse FormData with better error handling
    let formData: FormData
    try {
      formData = await request.formData()
      console.log("✅ FormData parsed successfully")
    } catch (error: any) {
      console.error("❌ Failed to parse FormData:", error)
      return NextResponse.json(
        { success: false, error: "Failed to parse form data", step: "formdata_parse", details: error.message },
        { status: 400 },
      )
    }

    // Extract and validate file
    const file = formData.get("file") as File
    if (!file) {
      console.error("❌ No file provided in FormData")
      return NextResponse.json({ success: false, error: "No file provided", step: "file_extraction" }, { status: 400 })
    }

    console.log(`✅ File extracted: ${file.name} (${formatFileSize(file.size)}, ${file.type})`)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json(
        { success: false, error: "File must be an image", step: "file_validation" },
        { status: 400 },
      )
    }

    // Extract and parse settings
    let settings: any = {}
    try {
      const settingsStr = formData.get("settings") as string
      if (settingsStr) {
        settings = JSON.parse(settingsStr)
        console.log("✅ Settings parsed:", settings)
      }
    } catch (error: any) {
      console.warn("⚠️ Failed to parse settings, using defaults:", error.message)
    }

    // Get model configuration
    const modelId = settings.model || "clarity-upscaler"
    const modelConfig = getModelConfig(modelId)

    if (!modelConfig) {
      console.error("❌ Unknown model:", modelId)
      return NextResponse.json(
        { success: false, error: `Unknown model: ${modelId}`, step: "model_config" },
        { status: 400 },
      )
    }

    console.log(`✅ Using model: ${modelConfig.name}`)

    // Check file size against model limits
    if (file.size > modelConfig.maxFileSize) {
      console.error(`❌ File too large: ${formatFileSize(file.size)} > ${formatFileSize(modelConfig.maxFileSize)}`)
      return NextResponse.json(
        {
          success: false,
          error: `File size (${formatFileSize(file.size)}) exceeds model limit (${formatFileSize(modelConfig.maxFileSize)})`,
          step: "size_validation",
        },
        { status: 413 },
      )
    }

    // Convert file to base64 data URL with size check and compression
    let imageDataUrl: string
    let compressionApplied = false
    const originalSize = file.size
    let processedSize = file.size

    try {
      console.log("🔄 Processing image for API submission...")

      // Check if we need to compress (if file is larger than 4MB)
      if (file.size > MAX_REPLICATE_PAYLOAD_SIZE) {
        console.log(
          `⚠️ File size (${formatFileSize(file.size)}) exceeds Replicate payload limit (${formatFileSize(MAX_REPLICATE_PAYLOAD_SIZE)}), applying compression...`,
        )

        // Import the compression function dynamically to avoid issues in server component
        const { compressForApiSubmission } = await import("@/utils/image-compression")

        // Compress the image to fit within Replicate's payload limit
        const compressionResult = await compressForApiSubmission(file, 3.5) // Target 3.5MB to be safe

        console.log(
          `✅ Compression applied: ${formatFileSize(file.size)} → ${formatFileSize(compressionResult.compressedSize)} (${compressionResult.compressionRatio.toFixed(2)}x reduction)`,
        )

        // Convert compressed blob to base64
        const arrayBuffer = await compressionResult.blob.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString("base64")
        imageDataUrl = `data:image/jpeg;base64,${base64}` // Always use JPEG for compressed images

        compressionApplied = true
        processedSize = compressionResult.compressedSize

        console.log(`✅ Compressed image converted to base64 (${formatFileSize(base64.length)})`)
      } else {
        // No compression needed, use original file
        console.log(`✅ File size (${formatFileSize(file.size)}) within Replicate payload limit, no compression needed`)

        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString("base64")
        imageDataUrl = `data:${file.type};base64,${base64}`

        console.log(`✅ Image converted to base64 (${formatFileSize(base64.length)})`)
      }

      // Final check on payload size
      const payloadSize = imageDataUrl.length
      if (payloadSize > MAX_REPLICATE_PAYLOAD_SIZE * 1.33) {
        // Base64 is ~33% larger than binary
        console.error(
          `❌ Payload size (${formatFileSize(payloadSize)}) still exceeds Replicate limit after compression`,
        )
        return NextResponse.json(
          {
            success: false,
            error: `Image too large for API submission even after compression. Please use a smaller image.`,
            step: "payload_size",
            details: `Payload: ${formatFileSize(payloadSize)}, Limit: ${formatFileSize(MAX_REPLICATE_PAYLOAD_SIZE * 1.33)}`,
          },
          { status: 413 },
        )
      }
    } catch (error: any) {
      console.error("❌ Failed to process image for API submission:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process image for API submission",
          step: "image_processing",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Prepare input for the model
    const input: any = {
      [modelConfig.inputField]: imageDataUrl,
    }

    // Add model-specific parameters
    if (modelId === "clarity-upscaler") {
      input.scale_factor = settings.upscaleFactor || 2
      input.dynamic = 6
      input.creativity = 0.35
      input.resemblance = 0.6
      input.tiling = false
      input.sd_model = "juggernaut_reborn.safetensors [338b85bc4f]"
      input.hdr = 0
      input.sharpen = 0
    } else if (modelId.includes("real-esrgan")) {
      input.scale = settings.upscaleFactor || 4
      input.face_enhance = settings.faceEnhance || false
    } else if (modelId === "gfpgan-face") {
      input.scale = settings.upscaleFactor || 2
      input.version = "1.4"
    } else if (modelId === "codeformer-face") {
      input.fidelity = 0.7
      input.upscale = settings.upscaleFactor || 2
      input.face_upsample = true
      input.background_enhance = true
      input.codeformer_fidelity = 0.7
    }

    console.log("📤 Creating Replicate prediction...")

    // Create prediction with better error handling
    let predictionResponse: Response
    try {
      predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: modelConfig.version,
          input: input,
        }),
      })
    } catch (error: any) {
      console.error("❌ Network error creating prediction:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Network error connecting to Replicate",
          step: "network_error",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Handle non-JSON responses (like HTML error pages)
    let prediction: any
    try {
      const responseText = await predictionResponse.text()
      console.log(`📋 Replicate response status: ${predictionResponse.status}`)

      if (!predictionResponse.ok) {
        // Check for specific error types
        if (
          predictionResponse.status === 413 ||
          responseText.includes("Request Entity Too Large") ||
          responseText.includes("FUNCTION_PAYLOAD_TOO_LARGE")
        ) {
          console.error("❌ Replicate payload too large:", responseText.substring(0, 200))
          return NextResponse.json(
            {
              success: false,
              error: "Image too large for Replicate API",
              details: "Please use a smaller image or try more aggressive compression",
              step: "payload_too_large",
            },
            { status: 413 },
          )
        }

        console.error("❌ Replicate prediction creation failed:", responseText.substring(0, 200))
        return NextResponse.json(
          {
            success: false,
            error: `Replicate API error: ${predictionResponse.status}`,
            details: responseText.substring(0, 500), // Limit error message length
            step: "prediction_creation",
          },
          { status: predictionResponse.status },
        )
      }

      // Try to parse as JSON
      try {
        prediction = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Failed to parse Replicate response as JSON:", responseText.substring(0, 200))
        return NextResponse.json(
          {
            success: false,
            error: "Invalid response from Replicate API",
            details: "Response was not valid JSON",
            step: "response_parsing",
          },
          { status: 500 },
        )
      }

      if (!prediction?.id) {
        console.error("❌ No prediction ID in response:", prediction)
        return NextResponse.json(
          { success: false, error: "No prediction ID returned", step: "prediction_validation" },
          { status: 500 },
        )
      }

      console.log(`✅ Prediction created: ${prediction.id}`)
    } catch (error: any) {
      console.error("❌ Error processing Replicate response:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process Replicate response",
          step: "response_processing",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Poll for completion with extended timeout for large files
    const startTime = Date.now()
    const timeout = 15 * 60 * 1000 // 15 minutes
    let finalPrediction: any

    try {
      console.log("⏳ Waiting for prediction to complete...")

      while (true) {
        if (Date.now() - startTime > timeout) {
          throw new Error("Prediction timed out after 15 minutes")
        }

        // Wait before checking status
        await new Promise((resolve) => setTimeout(resolve, 3000))

        try {
          const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            },
          })

          if (!statusResponse.ok) {
            console.error("❌ Status check failed:", statusResponse.status)
            continue // Try again
          }

          const statusText = await statusResponse.text()
          try {
            finalPrediction = JSON.parse(statusText)
          } catch (parseError) {
            console.error("❌ Failed to parse status response:", statusText.substring(0, 200))
            continue // Try again
          }
        } catch (error: any) {
          console.error("❌ Network error checking status:", error)
          continue // Try again
        }

        console.log(`🔄 Prediction status: ${finalPrediction.status}`)

        if (finalPrediction.status === "succeeded") {
          console.log("✅ Prediction completed successfully")
          break
        }

        if (finalPrediction.status === "failed") {
          const errorMsg = finalPrediction.error || "Prediction failed without error message"
          console.error("❌ Prediction failed:", errorMsg)
          throw new Error(`Prediction failed: ${errorMsg}`)
        }

        if (finalPrediction.status === "canceled") {
          throw new Error("Prediction was canceled")
        }
      }
    } catch (error: any) {
      console.error("❌ Prediction processing failed:", error)
      return NextResponse.json(
        { success: false, error: error.message, step: "prediction_wait", predictionId: prediction.id },
        { status: 500 },
      )
    }

    // Extract and validate result
    const output = finalPrediction.output
    if (!output) {
      console.error("❌ No output from prediction")
      return NextResponse.json(
        { success: false, error: "No output from prediction", step: "output_extraction", predictionId: prediction.id },
        { status: 500 },
      )
    }

    // Handle different output formats
    let downloadUrl: string
    if (Array.isArray(output)) {
      downloadUrl = output[0]
    } else if (typeof output === "string") {
      downloadUrl = output
    } else {
      console.error("❌ Unexpected output format:", typeof output)
      return NextResponse.json(
        { success: false, error: "Unexpected output format", step: "output_format", predictionId: prediction.id },
        { status: 500 },
      )
    }

    if (!downloadUrl || !downloadUrl.startsWith("http")) {
      console.error("❌ Invalid download URL:", downloadUrl)
      return NextResponse.json(
        { success: false, error: "Invalid download URL", step: "url_validation", predictionId: prediction.id },
        { status: 500 },
      )
    }

    const processingTime = `${Math.round((Date.now() - startTime) / 1000)}s`
    console.log(`✅ Enhancement completed in ${processingTime}`)

    return NextResponse.json({
      success: true,
      downloadUrl,
      model: modelId,
      method: "replicate",
      processingTime,
      predictionId: prediction.id,
      fileSize: "Enhanced image",
      upscaleFactor: settings.upscaleFactor || 2,
      originalSize,
      processedSize,
      compressionApplied,
    })
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error", step: "unexpected_error" },
      { status: 500 },
    )
  }
}

function getModelConfig(modelId: string) {
  const models: Record<string, any> = {
    "clarity-upscaler": {
      name: "Clarity Upscaler",
      replicateModel: "philz1337x/clarity-upscaler",
      version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
      inputField: "image",
      maxFileSize: 100 * 1024 * 1024, // 100MB
    },
    "real-esrgan-4x": {
      name: "Real-ESRGAN 4x",
      replicateModel: "nightmareai/real-esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      inputField: "image",
      maxFileSize: 50 * 1024 * 1024, // 50MB
    },
    "real-esrgan-2x": {
      name: "Real-ESRGAN 2x",
      replicateModel: "nightmareai/real-esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      inputField: "image",
      maxFileSize: 75 * 1024 * 1024, // 75MB
    },
    "gfpgan-face": {
      name: "GFPGAN",
      replicateModel: "tencentarc/gfpgan",
      version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
      inputField: "img",
      maxFileSize: 25 * 1024 * 1024, // 25MB
    },
    "codeformer-face": {
      name: "CodeFormer",
      replicateModel: "sczhou/codeformer",
      version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
      inputField: "image",
      maxFileSize: 20 * 1024 * 1024, // 20MB
    },
  }

  return models[modelId]
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
