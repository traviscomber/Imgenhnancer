import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import sharp from "sharp"

/**
 * POST /api/enhance-replicate
 *
 * Body (multipart/form-data)
 *  ├─ file:      image file
 *  └─ settings:  JSON string (model, upscaleFactor, …)
 *
 * This route processes images with Replicate AI models
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()

  console.log("🚀 Starting image enhancement with Replicate...")
  console.log("📊 Request headers:", Object.fromEntries(req.headers.entries()))

  try {
    // Guard: Check API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ REPLICATE_API_TOKEN not configured")
      return NextResponse.json(
        {
          success: false,
          error: "REPLICATE_API_TOKEN not configured",
          step: "configuration_check",
        },
        { status: 400 },
      )
    }

    console.log("✅ API token is configured")

    // Parse form data
    let form
    try {
      console.log("📋 Parsing form data...")
      form = await req.formData()
      console.log("✅ Form data parsed successfully")
      console.log("📊 Form entries:", Array.from(form.keys()))
    } catch (error) {
      console.error("❌ Failed to parse form data:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse form data",
          details: error.message,
          step: "form_parsing",
        },
        { status: 400 },
      )
    }

    const file = form.get("file") as File | null
    const settingsRaw = form.get("settings") as string | null

    if (!file) {
      console.error("❌ No file uploaded")
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded",
          step: "file_validation",
        },
        { status: 400 },
      )
    }

    console.log(`📁 Processing file: ${file.name}`)
    console.log(`📊 File type: ${file.type}`)
    console.log(`📊 Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)

    // Parse settings
    let settings
    try {
      console.log("⚙️ Parsing settings...")
      settings = settingsRaw ? JSON.parse(settingsRaw) : {}
      console.log(`✅ Settings parsed:`, settings)
    } catch (error) {
      console.error("❌ Failed to parse settings JSON:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid settings JSON",
          details: error.message,
          step: "settings_parsing",
        },
        { status: 400 },
      )
    }

    const selectedModel: string = settings.model ?? "real-esrgan-4x"
    const upscaleFactor: number = settings.upscaleFactor ?? 2
    console.log(`🤖 Selected model: ${selectedModel}`)
    console.log(`📈 Upscale factor: ${upscaleFactor}x`)

    // Read file buffer
    let buf
    try {
      console.log("📖 Reading file buffer...")
      buf = Buffer.from(await file.arrayBuffer())
      console.log(`📊 Original buffer size: ${(buf.length / 1024).toFixed(0)} KB`)
    } catch (error) {
      console.error("❌ Failed to read file buffer:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to read uploaded file",
          details: error.message,
          step: "file_reading",
        },
        { status: 400 },
      )
    }

    // Compress image to under 1MB for Replicate
    let compressedImage
    try {
      console.log("🗜️ Starting image compression...")

      // Get image metadata first
      const metadata = await sharp(buf).metadata()
      console.log(`📊 Original image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`)

      // First pass: resize and compress
      compressedImage = await sharp(buf)
        .rotate() // respect EXIF orientation
        .resize({
          width: 2048,
          height: 2048,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
          mozjpeg: true,
          progressive: true,
        })
        .toBuffer()

      console.log(`📊 After first compression: ${(compressedImage.length / 1024).toFixed(0)} KB`)

      // Second pass if still too large
      if (compressedImage.length > 1_000_000) {
        console.log("🔄 Image still too large, applying further compression...")
        compressedImage = await sharp(compressedImage)
          .jpeg({
            quality: 70,
            mozjpeg: true,
            progressive: true,
          })
          .toBuffer()
        console.log(`📊 After second compression: ${(compressedImage.length / 1024).toFixed(0)} KB`)
      }

      // Final check with more aggressive compression
      if (compressedImage.length > 1_000_000) {
        console.log("🔄 Applying final aggressive compression...")
        compressedImage = await sharp(compressedImage)
          .resize({
            width: 1536,
            height: 1536,
            fit: "inside",
          })
          .jpeg({
            quality: 60,
            mozjpeg: true,
            progressive: true,
          })
          .toBuffer()
        console.log(`📊 Final compressed size: ${(compressedImage.length / 1024).toFixed(0)} KB`)
      }

      if (compressedImage.length > 1_000_000) {
        console.warn("⚠️ Image is still over 1MB after compression")
      }
    } catch (error) {
      console.error("❌ Image compression failed:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process image",
          details: error.message,
          step: "image_compression",
        },
        { status: 500 },
      )
    }

    const dataUrl = `data:image/jpeg;base64,${compressedImage.toString("base64")}`
    console.log(`📋 Data URL size: ${(dataUrl.length / 1024).toFixed(0)} KB`)

    // Model configuration
    type ModelConfig = {
      version: string
      input: Record<string, unknown>
      replicateModel: string
      displayName: string
    }

    const modelConfigs: Record<string, ModelConfig> = {
      "real-esrgan-4x": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        replicateModel: "nightmareai/real-esrgan",
        displayName: "Real-ESRGAN 4x",
        input: {
          image: dataUrl,
          scale: Math.min(upscaleFactor, 4),
        },
      },
      "real-esrgan-2x": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        replicateModel: "nightmareai/real-esrgan",
        displayName: "Real-ESRGAN 2x",
        input: {
          image: dataUrl,
          scale: 2,
        },
      },
      "gfpgan-face": {
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        replicateModel: "tencentarc/gfpgan",
        displayName: "GFPGAN Face Enhancement",
        input: {
          image: dataUrl,
          version: "v1.4",
          scale: Math.min(upscaleFactor, 4),
        },
      },
      "codeformer-face": {
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        replicateModel: "sczhou/codeformer",
        displayName: "CodeFormer Face Restoration",
        input: {
          image: dataUrl,
          fidelity: 0.7,
          upscale: Math.min(upscaleFactor, 4),
          face_upsample: true,
          background_enhance: true,
          codeformer_fidelity: 0.7,
        },
      },
      "clarity-upscaler": {
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        replicateModel: "philz1337x/clarity-upscaler",
        displayName: "Clarity Upscaler",
        input: {
          image: dataUrl,
          scale_factor: Math.min(upscaleFactor, 4),
          dynamic: 6,
          creativity: 0.35,
          resemblance: 0.6,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
        },
      },
    }

    const modelConfig = modelConfigs[selectedModel]
    if (!modelConfig) {
      console.error(`❌ Unsupported model: ${selectedModel}`)
      console.error(`Available models: ${Object.keys(modelConfigs).join(", ")}`)
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported model "${selectedModel}"`,
          availableModels: Object.keys(modelConfigs),
          receivedModel: selectedModel,
          step: "model_validation",
        },
        { status: 400 },
      )
    }

    console.log(`🤖 Using model: ${modelConfig.replicateModel} (${modelConfig.displayName})`)
    console.log(`📋 Model version: ${modelConfig.version}`)
    console.log(`📋 Input parameters:`, {
      ...modelConfig.input,
      image: `[base64 data - ${(dataUrl.length / 1024).toFixed(0)} KB]`,
    })

    // Initialize Replicate client
    let replicate
    try {
      console.log("🔧 Initializing Replicate client...")
      replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
        userAgent: "ai-image-enhancer/1.0",
      })
      console.log("✅ Replicate client initialized")
    } catch (error) {
      console.error("❌ Failed to initialize Replicate client:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize Replicate client",
          details: error.message,
          step: "client_initialization",
        },
        { status: 500 },
      )
    }

    // Create prediction
    console.log("🔄 Creating prediction...")
    let prediction
    try {
      prediction = await replicate.predictions.create({
        version: modelConfig.version,
        input: modelConfig.input,
      })

      console.log("✅ Prediction creation response received")
      console.log(`📊 Prediction object keys: ${Object.keys(prediction || {}).join(", ")}`)
    } catch (error) {
      console.error("❌ Failed to create prediction:", error)
      console.error("❌ Error details:", {
        message: error.message,
        status: error.status,
        response: error.response?.data || error.response,
      })

      return NextResponse.json(
        {
          success: false,
          error: `Failed to create prediction: ${error.message}`,
          modelUsed: modelConfig.replicateModel,
          version: modelConfig.version,
          details: error.response?.data || error.toString(),
          step: "prediction_creation",
        },
        { status: 500 },
      )
    }

    if (!prediction?.id || !prediction?.status) {
      console.error("❌ Invalid prediction response:", prediction)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid prediction response from Replicate",
          modelUsed: modelConfig.replicateModel,
          predictionResponse: prediction,
          step: "prediction_validation",
        },
        { status: 500 },
      )
    }

    console.log(`✅ Prediction created: ${prediction.id}`)
    console.log(`📊 Initial status: ${prediction.status}`)

    // Poll for completion
    const pollStartTime = Date.now()
    let current = prediction
    let pollCount = 0

    while (["starting", "processing"].includes(current.status)) {
      pollCount++
      const elapsed = Math.round((Date.now() - pollStartTime) / 1000)
      console.log(`⏳ Poll #${pollCount}: Status: ${current.status} (${elapsed}s elapsed)`)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      try {
        current = await replicate.predictions.get(current.id)
        console.log(`📊 Updated prediction status: ${current.status}`)

        if (current.logs) {
          console.log(`📝 Prediction logs: ${current.logs.slice(-200)}`) // Last 200 chars
        }
      } catch (error) {
        console.error("❌ Failed to get prediction status:", error)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to check prediction status",
            details: error.message,
            predictionId: current.id,
            step: "prediction_polling",
          },
          { status: 500 },
        )
      }

      // Timeout after 5 minutes
      if (Date.now() - pollStartTime > 5 * 60 * 1000) {
        console.error("⏰ Prediction timed out after 5 minutes")
        return NextResponse.json(
          {
            success: false,
            error: "Processing timed out after 5 minutes",
            predictionId: current.id,
            finalStatus: current.status,
            step: "timeout",
          },
          { status: 504 },
        )
      }
    }

    const totalTime = Date.now() - startTime
    console.log(`⏱️ Total processing time: ${Math.round(totalTime / 1000)}s`)
    console.log(`🏁 Final status: ${current.status}`)

    if (current.status !== "succeeded") {
      console.error("❌ Prediction failed with status:", current.status)
      console.error("❌ Prediction error:", current.error)
      console.error("❌ Prediction logs:", current.logs)

      return NextResponse.json(
        {
          success: false,
          error: current.error || `Prediction failed with status: ${current.status}`,
          status: current.status,
          logs: current.logs,
          modelUsed: modelConfig.replicateModel,
          predictionId: current.id,
          step: "prediction_failed",
        },
        { status: 500 },
      )
    }

    const outputUrl = Array.isArray(current.output) ? current.output[0] : current.output

    if (!outputUrl) {
      console.error("❌ No output URL in successful prediction:", current)
      return NextResponse.json(
        {
          success: false,
          error: "No output URL returned from successful prediction",
          predictionResponse: current,
          step: "output_validation",
        },
        { status: 500 },
      )
    }

    console.log(`🎉 Enhancement successful!`)
    console.log(`📥 Output URL: ${outputUrl}`)

    return NextResponse.json({
      success: true,
      downloadUrl: outputUrl,
      model: selectedModel,
      modelName: modelConfig.displayName,
      replicateModel: modelConfig.replicateModel,
      predictionId: current.id,
      processingTime: `${Math.round(totalTime / 1000)}s`,
      fileSize: `${(compressedImage.length / 1024).toFixed(0)} KB`,
      originalFileName: file.name,
      upscaleFactor: upscaleFactor,
      enhancedSize: `Enhanced with ${modelConfig.displayName}`,
      logs: current.logs,
      step: "success",
    })
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error("❌ Unexpected enhancement error:", error)
    console.error("❌ Error stack:", error.stack)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error occurred",
        details: error.toString(),
        stack: error.stack,
        processingTime: `${Math.round(totalTime / 1000)}s`,
        timestamp: new Date().toISOString(),
        step: "unexpected_error",
      },
      { status: 500 },
    )
  }
}
