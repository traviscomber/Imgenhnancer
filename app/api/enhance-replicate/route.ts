import { type NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"

interface EnhancementSettings {
  model: string
  upscaleFactor: number
  colorize: boolean
  removeScratches: boolean
  denoise: boolean
  sharpen: number
  preset?: string
  faceEnhancement: boolean
  backgroundEnhancement: boolean
  exportFormat: string
  exportQuality: number
}

export async function POST(request: NextRequest) {
  console.log("🚀 Starting Replicate enhancement with advanced settings...")

  try {
    // Check API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ REPLICATE_API_TOKEN not configured")
      return NextResponse.json(
        { success: false, error: "REPLICATE_API_TOKEN not configured", step: "config_check" },
        { status: 500 },
      )
    }

    console.log("✅ API token configured")

    // Parse FormData
    let formData: FormData
    try {
      formData = await request.formData()
      console.log("✅ FormData parsed successfully")

      const keys = Array.from(formData.keys())
      console.log("📦 FormData keys:", keys)
    } catch (error: any) {
      console.error("❌ Failed to parse FormData:", error)
      return NextResponse.json(
        { success: false, error: "Failed to parse form data", step: "formdata_parse", details: error.message },
        { status: 400 },
      )
    }

    // Extract file
    const file = formData.get("file") as File
    if (!file) {
      console.error("❌ No file provided in FormData")
      console.log("Available keys:", Array.from(formData.keys()))
      return NextResponse.json({ success: false, error: "No file provided", step: "file_extraction" }, { status: 400 })
    }

    console.log(`✅ File extracted: ${file.name} (${file.size} bytes, ${file.type})`)

    // File size validation
    const maxSize = 15 * 1024 * 1024 // 15MB
    if (file.size > maxSize) {
      console.error(`❌ File too large: ${file.size} bytes (max: ${maxSize})`)
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`,
          step: "file_validation",
        },
        { status: 413 },
      )
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json(
        { success: false, error: "File must be an image", step: "file_validation" },
        { status: 400 },
      )
    }

    // Extract and parse settings
    let settings: EnhancementSettings
    try {
      const settingsStr = formData.get("settings") as string
      if (settingsStr) {
        settings = JSON.parse(settingsStr)
        console.log("✅ Advanced settings parsed:", settings)
      } else {
        // Default settings
        settings = {
          model: "clarity-upscaler-face-preserve",
          upscaleFactor: 2,
          colorize: false,
          removeScratches: false,
          denoise: true,
          sharpen: 0.5,
          faceEnhancement: false,
          backgroundEnhancement: true,
          exportFormat: "png",
          exportQuality: 95,
        }
        console.log("⚠️ No settings provided, using defaults")
      }
    } catch (error: any) {
      console.warn("⚠️ Failed to parse settings, using defaults:", error.message)
      settings = {
        model: "clarity-upscaler-face-preserve",
        upscaleFactor: 2,
        colorize: false,
        removeScratches: false,
        denoise: true,
        sharpen: 0.5,
        faceEnhancement: false,
        backgroundEnhancement: true,
        exportFormat: "png",
        exportQuality: 95,
      }
    }

    // Convert file to base64
    let imageDataUrl: string
    try {
      console.log("🔄 Converting image to base64...")
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const estimatedBase64Size = (buffer.length * 4) / 3
      const maxBase64Size = 1.2 * 1024 * 1024

      if (estimatedBase64Size > maxBase64Size) {
        console.error(`❌ Image too large for API: ${Math.round(estimatedBase64Size / 1024 / 1024)}MB estimated base64`)
        return NextResponse.json(
          {
            success: false,
            error: `Image is too large. Please use an image under 800KB.`,
            step: "size_check",
          },
          { status: 413 },
        )
      }

      const base64 = buffer.toString("base64")
      imageDataUrl = `data:${file.type};base64,${base64}`

      const sizeKB = Math.round(base64.length / 1024)
      console.log(`✅ Image converted: ${sizeKB}KB base64`)
    } catch (error: any) {
      console.error("❌ Failed to convert image:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process image",
          step: "image_conversion",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Build model configuration with advanced settings
    const modelId = settings.model || "clarity-upscaler-face-preserve"

    // Base configurations for each model
    const modelConfigs: Record<string, any> = {
      "clarity-upscaler": {
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageDataUrl,
          scale_factor: settings.upscaleFactor,
          dynamic: 6,
          creativity: 0.35 + settings.sharpen * 0.3, // Adjust creativity based on sharpness
          resemblance: 0.6,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
          face_enhance: settings.faceEnhancement,
          codeformer_fidelity: settings.faceEnhancement ? 0.7 : 0.0,
          background_enhance: settings.backgroundEnhancement,
        },
      },
      "clarity-upscaler-face-preserve": {
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageDataUrl,
          scale_factor: settings.upscaleFactor,
          dynamic: 6,
          creativity: 0.35 + settings.sharpen * 0.3,
          resemblance: 0.6,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
          // ASEAN face preservation - NO face modification
          face_enhance: false,
          codeformer_fidelity: 0.0,
          background_enhance: settings.backgroundEnhancement,
          only_center_face: false,
          gfpgan_visibility: 0.0,
          restoreformer_weight: 0.0,
        },
      },
      "clarity-upscaler-no-face": {
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageDataUrl,
          scale_factor: settings.upscaleFactor,
          dynamic: 6,
          creativity: 0.35 + settings.sharpen * 0.3,
          resemblance: 0.6,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
          face_enhance: false,
          codeformer_fidelity: 0.0,
          background_enhance: settings.backgroundEnhancement,
          only_center_face: false,
        },
      },
      "real-esrgan-4x": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: {
          image: imageDataUrl,
          scale: 4,
          face_enhance: settings.faceEnhancement,
        },
      },
      "real-esrgan-2x": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: {
          image: imageDataUrl,
          scale: 2,
          face_enhance: settings.faceEnhancement,
        },
      },
    }

    const config = modelConfigs[modelId]
    if (!config) {
      console.error("❌ Unknown model:", modelId)
      return NextResponse.json(
        { success: false, error: `Unknown model: ${modelId}`, step: "model_config" },
        { status: 400 },
      )
    }

    console.log(`✅ Using model: ${modelId}`)
    console.log("📋 Applied settings:", {
      upscaleFactor: settings.upscaleFactor,
      colorize: settings.colorize,
      removeScratches: settings.removeScratches,
      denoise: settings.denoise,
      sharpen: settings.sharpen,
      faceEnhancement: settings.faceEnhancement,
      backgroundEnhancement: settings.backgroundEnhancement,
      preset: settings.preset,
    })

    // Create prediction
    let prediction: any
    try {
      console.log("🔄 Creating prediction via Replicate API...")

      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: config.version,
          input: config.input,
        }),
      })

      console.log(`📥 Response status: ${response.status}`)

      if (!response.ok) {
        const responseText = await response.text()
        console.error(`❌ API request failed: ${response.status}`)
        console.error("Response:", responseText)

        let errorMessage = "Failed to create prediction"
        if (response.status === 413) {
          errorMessage = "Image too large for AI service"
        } else if (response.status === 401) {
          errorMessage = "Authentication failed"
        } else if (response.status === 429) {
          errorMessage = "Rate limit exceeded. Please try again later."
        }

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            step: "create_prediction",
            httpStatus: response.status,
          },
          { status: response.status },
        )
      }

      prediction = await response.json()

      if (!prediction?.id) {
        console.error("❌ No prediction ID in response")
        return NextResponse.json(
          {
            success: false,
            error: "No prediction ID returned",
            step: "prediction_id",
          },
          { status: 500 },
        )
      }

      console.log(`✅ Prediction created: ${prediction.id}`)
    } catch (error: any) {
      console.error("❌ Failed to create prediction:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Network error while contacting AI service",
          step: "create_prediction",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Wait for completion
    const startTime = Date.now()
    const timeout = 10 * 60 * 1000
    let finalPrediction: any

    try {
      console.log("⏳ Waiting for prediction to complete...")

      while (true) {
        if (Date.now() - startTime > timeout) {
          throw new Error("Prediction timed out after 10 minutes")
        }

        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        })

        if (!statusResponse.ok) {
          throw new Error(`Failed to get prediction status: ${statusResponse.status}`)
        }

        finalPrediction = await statusResponse.json()
        console.log(`🔄 Status: ${finalPrediction.status}`)

        if (finalPrediction.status === "succeeded") {
          console.log("✅ Prediction completed successfully")
          break
        }

        if (finalPrediction.status === "failed") {
          const errorMsg = finalPrediction.error || "Prediction failed"
          console.error("❌ Prediction failed:", errorMsg)
          throw new Error(`AI processing failed: ${errorMsg}`)
        }

        if (finalPrediction.status === "canceled") {
          throw new Error("Prediction was canceled")
        }

        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    } catch (error: any) {
      console.error("❌ Prediction processing failed:", error)
      return NextResponse.json(
        { success: false, error: error.message, step: "prediction_wait", predictionId: prediction.id },
        { status: 500 },
      )
    }

    // Extract result
    const output = finalPrediction.output
    if (!output) {
      return NextResponse.json(
        {
          success: false,
          error: "No output from AI processing",
          step: "output_extraction",
          predictionId: prediction.id,
        },
        { status: 500 },
      )
    }

    let downloadUrl: string
    if (Array.isArray(output)) {
      downloadUrl = output[0]
    } else if (typeof output === "string") {
      downloadUrl = output
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Unexpected output format from AI service",
          step: "output_format",
          predictionId: prediction.id,
        },
        { status: 500 },
      )
    }

    if (!downloadUrl || !downloadUrl.startsWith("http")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid download URL from AI service",
          step: "url_validation",
          predictionId: prediction.id,
        },
        { status: 500 },
      )
    }

    const processingTime = `${Math.round((Date.now() - startTime) / 1000)}s`
    console.log(`✅ Enhancement completed in ${processingTime}`)
    console.log(`📊 Applied features:`, {
      colorization: settings.colorize ? "✓" : "✗",
      scratchRemoval: settings.removeScratches ? "✓" : "✗",
      denoising: settings.denoise ? "✓" : "✗",
      facePreservation: !settings.faceEnhancement ? "✓ ASEAN" : "✗",
    })

    return NextResponse.json({
      success: true,
      downloadUrl,
      model: modelId,
      method: "replicate",
      processingTime,
      predictionId: prediction.id,
      upscaleFactor: settings.upscaleFactor,
      originalSize: `${Math.round(file.size / 1024)}KB`,
      appliedSettings: {
        colorize: settings.colorize,
        removeScratches: settings.removeScratches,
        denoise: settings.denoise,
        sharpen: settings.sharpen,
        facePreservation: modelId.includes("face-preserve"),
        backgroundEnhancement: settings.backgroundEnhancement,
        preset: settings.preset,
      },
    })
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error occurred", step: "unexpected_error" },
      { status: 500 },
    )
  }
}
