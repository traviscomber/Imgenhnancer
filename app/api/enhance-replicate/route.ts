import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

export async function POST(request: NextRequest) {
  console.log("🚀 Starting Replicate enhancement...")

  try {
    // Check API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ REPLICATE_API_TOKEN not configured")
      return NextResponse.json(
        { success: false, error: "REPLICATE_API_TOKEN not configured", step: "config_check" },
        { status: 500 }
      )
    }

    console.log("✅ API token configured")

    // Initialize Replicate client
    let replicate: Replicate
    try {
      replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
      console.log("✅ Replicate client initialized")
    } catch (error: any) {
      console.error("❌ Failed to initialize Replicate client:", error)
      return NextResponse.json(
        { success: false, error: "Failed to initialize Replicate client", step: "client_init", details: error.message },
        { status: 500 }
      )
    }

    // Parse FormData with detailed error handling
    let formData: FormData
    try {
      formData = await request.formData()
      console.log("✅ FormData parsed successfully")
    } catch (error: any) {
      console.error("❌ Failed to parse FormData:", error)
      return NextResponse.json(
        { success: false, error: "Failed to parse form data", step: "formdata_parse", details: error.message },
        { status: 400 }
      )
    }

    // Extract file with validation
    const file = formData.get("file") as File
    if (!file) {
      console.error("❌ No file provided in FormData")
      return NextResponse.json(
        { success: false, error: "No file provided", step: "file_extraction" },
        { status: 400 }
      )
    }

    console.log(`✅ File extracted: ${file.name} (${file.size} bytes, ${file.type})`)

    // Validate file
    if (!file.type.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json(
        { success: false, error: "File must be an image", step: "file_validation" },
        { status: 400 }
      )
    }

    // Extract settings
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

    // Convert file to base64 data URL
    let imageDataUrl: string
    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      imageDataUrl = `data:${file.type};base64,${base64}`
      console.log(`✅ Image converted to base64 (${base64.length} chars)`)
    } catch (error: any) {
      console.error("❌ Failed to convert image to base64:", error)
      return NextResponse.json(
        { success: false, error: "Failed to process image", step: "image_conversion", details: error.message },
        { status: 500 }
      )
    }

    // Model configuration
    const modelConfigs: Record<string, any> = {
      "real-esrgan-4x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: { image: imageDataUrl, scale: settings.upscaleFactor || 4 },
      },
      "real-esrgan-2x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: { image: imageDataUrl, scale: 2 },
      },
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        input: { img: imageDataUrl, scale: settings.upscaleFactor || 2 },
      },
      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        input: {
          image: imageDataUrl,
          fidelity: 0.7,
          upscale: settings.upscaleFactor || 2,
          face_upsample: true,
          background_enhance: true,
          codeformer_fidelity: 0.7,
        },
      },
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageDataUrl,
          scale_factor: settings.upscaleFactor || 2,
          dynamic: 6,
          creativity: 0.35,
          resemblance: 0.6,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
        },
      },
    }

    const modelId = settings.model || "real-esrgan-4x"
    const config = modelConfigs[modelId]

    if (!config) {
      console.error("❌ Unknown model:", modelId)
      return NextResponse.json(
        { success: false, error: `Unknown model: ${modelId}`, step: "model_config" },
        { status: 400 }
      )
    }

    console.log(`✅ Using model: ${config.model} (${modelId})`)

    // Create prediction
    let prediction: any
    try {
      console.log("🔄 Creating prediction...")
      prediction = await replicate.predictions.create({
        version: config.version,
        input: config.input,
      })

      if (!prediction?.id) {
        throw new Error("No prediction ID returned")
      }

      console.log(`✅ Prediction created: ${prediction.id}`)
    } catch (error: any) {
      console.error("❌ Failed to create prediction:", error)
      return NextResponse.json(
        { success: false, error: "Failed to create prediction", step: "create_prediction", details: error.message },
        { status: 500 }
      )
    }

    // Wait for completion with timeout
    const startTime = Date.now()
    const timeout = 10 * 60 * 1000 // 10 minutes
    let finalPrediction: any

    try {
      console.log("⏳ Waiting for prediction to complete...")
      
      while (true) {
        if (Date.now() - startTime > timeout) {
          throw new Error("Prediction timed out after 10 minutes")
        }

        try {
          finalPrediction = await replicate.predictions.get(prediction.id)
        } catch (error: any) {
          console.error("❌ Failed to get prediction status:", error)
          throw new Error(`Failed to get prediction status: ${error.message}`)
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

        // Wait before next check
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    } catch (error: any) {
      console.error("❌ Prediction processing failed:", error)
      return NextResponse.json(
        { success: false, error: error.message, step: "prediction_wait", predictionId: prediction.id },
        { status: 500 }
      )
    }

    // Extract result
    const output = finalPrediction.output
    if (!output) {
      console.error("❌ No output from prediction")
      return NextResponse.json(
        { success: false, error: "No output from prediction", step: "output_extraction", predictionId: prediction.id },
        { status: 500 }
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
        { status: 500 }
      )
    }

    if (!downloadUrl || !downloadUrl.startsWith("http")) {
      console.error("❌ Invalid download URL:", downloadUrl)
      return NextResponse.json(
        { success: false, error: "Invalid download URL", step: "url_validation", predictionId: prediction.id },
        { status: 500 }
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
    })
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error", step: "unexpected_error" },
      { status: 500 }
    )
  }
}
