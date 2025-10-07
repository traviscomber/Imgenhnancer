import { type NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"

interface EnhancementSettings {
  model: string
  upscaleFactor: number
  creativity: number
  resemblance: number
  fractality: number
  colorBoost: number
  enablePreProcessing: boolean
  enablePostProcessing: boolean
  outputFormat: "png" | "jpg" | "webp"
  outputQuality: number
}

export async function POST(request: NextRequest) {
  console.log("🚀 Starting Replicate enhancement...")

  try {
    // Check for API token
    const apiToken = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY

    if (!apiToken) {
      console.error("❌ No Replicate API token found")
      return NextResponse.json(
        {
          success: false,
          error:
            "Replicate API token not found. Please add REPLICATE_API_TOKEN to your environment variables and redeploy.",
          step: "config_check",
        },
        { status: 500 },
      )
    }

    console.log("✅ API token configured")

    // Parse FormData
    let formData: FormData
    try {
      formData = await request.formData()
      console.log("✅ FormData parsed")
      console.log("📦 FormData keys:", Array.from(formData.keys()))
    } catch (error: any) {
      console.error("❌ Failed to parse FormData:", error)
      return NextResponse.json(
        { success: false, error: "Failed to parse form data", step: "formdata_parse" },
        { status: 400 },
      )
    }

    // Extract file - try both possible keys
    const file = (formData.get("image") || formData.get("file")) as File

    if (!file) {
      console.error("❌ No file provided in FormData")
      console.log("Available keys:", Array.from(formData.keys()))
      return NextResponse.json(
        {
          success: false,
          error: "No image file provided. Please select an image to enhance.",
          step: "file_extraction",
        },
        { status: 400 },
      )
    }

    console.log(`✅ File received: ${file.name} (${Math.round(file.size / 1024)}KB, ${file.type})`)

    // File size validation
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error(`❌ File too large: ${file.size} bytes`)
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB.", step: "file_validation" },
        { status: 413 },
      )
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json(
        { success: false, error: "File must be an image (JPG, PNG, WebP)", step: "file_validation" },
        { status: 400 },
      )
    }

    // Extract and parse settings
    const settings: Partial<EnhancementSettings> = {}
    try {
      const modelStr = formData.get("model") as string
      const upscaleStr = formData.get("upscale_factor") as string
      const creativityStr = formData.get("creativity") as string
      const resemblanceStr = formData.get("resemblance") as string
      const formatStr = formData.get("output_format") as string

      if (modelStr) settings.model = modelStr
      if (upscaleStr) settings.upscaleFactor = Number.parseFloat(upscaleStr)
      if (creativityStr) settings.creativity = Number.parseFloat(creativityStr)
      if (resemblanceStr) settings.resemblance = Number.parseFloat(resemblanceStr)
      if (formatStr) settings.outputFormat = formatStr as "png" | "jpg" | "webp"

      console.log("✅ Settings extracted:", settings)
    } catch (error) {
      console.warn("⚠️ Failed to parse some settings, using defaults")
    }

    // Apply defaults
    const finalSettings = {
      model: settings.model || "clarity-upscaler",
      upscaleFactor: settings.upscaleFactor || 2,
      creativity: settings.creativity || 0.35,
      resemblance: settings.resemblance || 0.75,
      outputFormat: settings.outputFormat || "png",
    }

    console.log("📋 Final settings:", finalSettings)

    // Convert image to base64
    console.log("🔄 Converting image to base64...")
    let imageDataUrl: string
    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString("base64")
      imageDataUrl = `data:${file.type};base64,${base64}`

      const base64SizeKB = Math.round(base64.length / 1024)
      console.log(`✅ Image converted: ${base64SizeKB}KB base64`)
    } catch (error: any) {
      console.error("❌ Failed to convert image:", error)
      return NextResponse.json(
        { success: false, error: "Failed to process image", step: "image_conversion" },
        { status: 500 },
      )
    }

    // Model configurations
    const modelConfigs: Record<string, any> = {
      "clarity-upscaler": {
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageDataUrl,
          scale_factor: finalSettings.upscaleFactor,
          dynamic: 6,
          creativity: finalSettings.creativity,
          resemblance: finalSettings.resemblance,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
          face_enhance: false, // ASEAN face preservation
          codeformer_fidelity: 0.0,
          background_enhance: true,
        },
      },
      "real-esrgan-4x": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: {
          image: imageDataUrl,
          scale: 4,
          face_enhance: false,
        },
      },
    }

    const config = modelConfigs[finalSettings.model] || modelConfigs["clarity-upscaler"]
    console.log(`✅ Using model: ${finalSettings.model}`)

    // Create prediction
    console.log("🔄 Creating Replicate prediction...")
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: config.version,
        input: config.input,
      }),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error(`❌ API request failed: ${createResponse.status}`)
      console.error("Response:", errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Replicate API error: ${createResponse.status}`,
          details: errorText,
          step: "create_prediction",
        },
        { status: createResponse.status },
      )
    }

    const prediction = await createResponse.json()
    console.log(`✅ Prediction created: ${prediction.id}`)

    // Poll for completion
    console.log("⏳ Waiting for processing...")
    const startTime = Date.now()
    const timeout = 5 * 60 * 1000 // 5 minutes
    let finalPrediction: any

    while (true) {
      if (Date.now() - startTime > timeout) {
        throw new Error("Processing timeout (5 minutes)")
      }

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Token ${apiToken}`,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`)
      }

      finalPrediction = await statusResponse.json()
      console.log(`🔄 Status: ${finalPrediction.status}`)

      if (finalPrediction.status === "succeeded") {
        console.log("✅ Processing complete!")
        break
      }

      if (finalPrediction.status === "failed") {
        const errorMsg = finalPrediction.error || "Processing failed"
        console.error("❌ Processing failed:", errorMsg)
        throw new Error(errorMsg)
      }

      if (finalPrediction.status === "canceled") {
        throw new Error("Processing was canceled")
      }

      // Wait 2 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    // Extract output URL
    const output = finalPrediction.output
    let outputUrl: string

    if (Array.isArray(output)) {
      outputUrl = output[0]
    } else if (typeof output === "string") {
      outputUrl = output
    } else {
      throw new Error("Unexpected output format from Replicate")
    }

    if (!outputUrl || !outputUrl.startsWith("http")) {
      throw new Error("Invalid output URL")
    }

    const processingTime = Math.round((Date.now() - startTime) / 1000)
    console.log(`✅ Enhancement complete in ${processingTime}s`)
    console.log(`📊 Output URL: ${outputUrl}`)

    return NextResponse.json({
      success: true,
      output: outputUrl,
      model: finalSettings.model,
      processingTime: `${processingTime}s`,
      predictionId: prediction.id,
      settings: finalSettings,
    })
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
        step: "unexpected_error",
      },
      { status: 500 },
    )
  }
}
