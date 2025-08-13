import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("🚀 Starting Replicate enhancement...")

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

    // Parse FormData with detailed error handling
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

    // Extract file with validation
    const file = formData.get("file") as File
    if (!file) {
      console.error("❌ No file provided in FormData")
      return NextResponse.json({ success: false, error: "No file provided", step: "file_extraction" }, { status: 400 })
    }

    console.log(`✅ File extracted: ${file.name} (${file.size} bytes, ${file.type})`)

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error(`❌ File too large: ${file.size} bytes (max: ${maxSize})`)
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
          step: "file_validation",
        },
        { status: 413 },
      )
    }

    // Validate file
    if (!file.type.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json(
        { success: false, error: "File must be an image", step: "file_validation" },
        { status: 400 },
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

      // Check base64 size
      if (base64.length > 15 * 1024 * 1024) {
        // 15MB base64 limit
        throw new Error("Image too large after base64 encoding")
      }
    } catch (error: any) {
      console.error("❌ Failed to convert image to base64:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process image - file may be too large",
          step: "image_conversion",
          details: error.message,
        },
        { status: 413 },
      )
    }

    // Use fetch API directly instead of Replicate SDK to avoid JSON parsing issues
    const modelId = settings.model || "clarity-upscaler"

    // Model configuration
    const modelConfigs: Record<string, any> = {
      "clarity-upscaler": {
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
      "real-esrgan-4x": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: { image: imageDataUrl, scale: settings.upscaleFactor || 4 },
      },
      "real-esrgan-2x": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: { image: imageDataUrl, scale: 2 },
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

    console.log(`✅ Using model version: ${config.version}`)

    // Create prediction using direct API call
    let prediction: any
    try {
      console.log("🔄 Creating prediction via direct API...")

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

      // Read response body once and handle based on content type
      const responseText = await response.text()

      if (!response.ok) {
        console.error(`❌ API request failed: ${response.status} ${response.statusText}`)
        console.error("Response body:", responseText)

        let errorMessage = "Failed to create prediction"
        if (response.status === 413) {
          errorMessage = "Image file too large for processing"
        } else if (response.status === 401) {
          errorMessage = "Invalid API token"
        } else if (response.status === 429) {
          errorMessage = "Rate limit exceeded"
        }

        return NextResponse.json(
          { success: false, error: errorMessage, step: "create_prediction", details: responseText },
          { status: response.status },
        )
      }

      // Try to parse JSON response
      try {
        prediction = JSON.parse(responseText)
      } catch (jsonError: any) {
        console.error("❌ Failed to parse JSON response:", jsonError)
        console.error("Response text:", responseText)
        return NextResponse.json(
          { success: false, error: "Invalid response from API", step: "parse_response", details: responseText },
          { status: 500 },
        )
      }

      if (!prediction?.id) {
        throw new Error("No prediction ID returned")
      }

      console.log(`✅ Prediction created: ${prediction.id}`)
    } catch (error: any) {
      console.error("❌ Failed to create prediction:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create prediction",
          step: "create_prediction",
          details: error.message,
        },
        { status: 500 },
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
          const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            },
          })

          if (!statusResponse.ok) {
            throw new Error(`Failed to get prediction status: ${statusResponse.status}`)
          }

          const statusText = await statusResponse.text()
          finalPrediction = JSON.parse(statusText)
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
        { status: 500 },
      )
    }

    // Extract result
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
    })
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error", step: "unexpected_error" },
      { status: 500 },
    )
  }
}
