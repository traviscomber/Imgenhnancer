import { type NextRequest, NextResponse } from "next/server"

// Smart compression to manage file sizes between upscale iterations
async function smartCompress(imageBuffer: ArrayBuffer, targetSizeMB = 15): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      // Start with high quality and reduce if needed
      let quality = 0.95
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"))
              return
            }

            const sizeMB = blob.size / (1024 * 1024)
            console.log(`Compression attempt: ${sizeMB.toFixed(1)}MB at quality ${quality}`)

            if (sizeMB <= targetSizeMB || quality <= 0.3) {
              blob.arrayBuffer().then(resolve).catch(reject)
            } else {
              quality -= 0.1
              tryCompress()
            }
          },
          "image/jpeg",
          quality,
        )
      }

      tryCompress()
    }

    img.onerror = () => reject(new Error("Failed to load image for compression"))

    const blob = new Blob([imageBuffer])
    img.src = URL.createObjectURL(blob)
  })
}

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

    // Significantly increased file size limit to 100MB - no compression
    const maxSize = 100 * 1024 * 1024 // 100MB
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

    // Check if this is a cascading upscale request
    const cascadeIteration = Number.parseInt(formData.get("cascadeIteration") as string) || 1
    const totalIterations = Number.parseInt(formData.get("totalIterations") as string) || 1
    const isMultiIteration = totalIterations > 1

    console.log(`🔄 Cascade iteration ${cascadeIteration}/${totalIterations}`)

    // For multi-iteration, use 2x per iteration
    const iterationUpscale = isMultiIteration ? 2 : settings.upscaleFactor || 2

    // Convert file to base64 with smart compression for iterations > 1
    let imageDataUrl: string
    try {
      console.log("🔄 Converting image to base64...")
      const arrayBuffer = await file.arrayBuffer()

      // Apply smart compression for subsequent iterations
      let processedBuffer = arrayBuffer
      if (cascadeIteration > 1) {
        console.log("🗜️ Applying smart compression for iteration", cascadeIteration)
        processedBuffer = await smartCompress(arrayBuffer, 15) // 15MB target
      }

      const base64 = Buffer.from(processedBuffer).toString("base64")
      imageDataUrl = `data:${file.type};base64,${base64}`

      const sizeKB = Math.round(base64.length / 1024)
      const sizeMB = Math.round(sizeKB / 1024)
      console.log(`✅ Image converted: ${sizeKB}KB (${sizeMB}MB) for iteration ${cascadeIteration}`)
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

    // Update model configs to use iteration upscale
    const modelConfigs: Record<string, any> = {
      "clarity-upscaler": {
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageDataUrl,
          scale_factor: iterationUpscale,
          dynamic: 6,
          creativity: 0.35,
          resemblance: 0.6,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
        },
      },
      "real-esrgan-4x": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: { image: imageDataUrl, scale: iterationUpscale },
      },
      "real-esrgan-2x": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: { image: imageDataUrl, scale: 2 },
      },
      "esrgan-general": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: { image: imageDataUrl, scale: iterationUpscale },
      },
    }

    const modelId = settings.model || "clarity-upscaler"
    const config = modelConfigs[modelId]
    if (!config) {
      console.error("❌ Unknown model:", modelId)
      return NextResponse.json(
        { success: false, error: `Unknown model: ${modelId}`, step: "model_config" },
        { status: 400 },
      )
    }

    console.log(`✅ Using model: ${modelId} (version: ${config.version})`)

    // Create prediction using direct API call
    let prediction: any
    try {
      console.log("🔄 Creating prediction via Replicate API...")

      const requestBody = JSON.stringify({
        version: config.version,
        input: config.input,
      })

      const requestSizeMB = Math.round(requestBody.length / 1024 / 1024)
      console.log(`📤 Request size: ${requestSizeMB}MB`)

      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
      })

      // Get response text first
      const responseText = await response.text()
      const contentType = response.headers.get("content-type") || ""
      console.log(`📥 Response status: ${response.status}, Content-Type: ${contentType}`)

      if (!response.ok) {
        console.error(`❌ API request failed: ${response.status} ${response.statusText}`)
        console.error("Response body:", responseText.substring(0, 500))

        let errorMessage = "Failed to create prediction"
        let userMessage = errorMessage

        if (response.status === 413 || responseText.includes("Request Entity Too Large")) {
          errorMessage = "Image too large for Replicate API"
          userMessage =
            "Image file is too large for the AI service. Try using a smaller image (under 20MB recommended)."
        } else if (response.status === 401) {
          errorMessage = "Invalid API token"
          userMessage = "Authentication failed with AI service"
        } else if (response.status === 429) {
          errorMessage = "Rate limit exceeded"
          userMessage = "Too many requests. Please try again in a few minutes."
        } else if (response.status === 422) {
          errorMessage = "Invalid input parameters"
          userMessage = "Invalid image format or parameters"
        } else if (response.status >= 500) {
          errorMessage = "Server error"
          userMessage = "AI service is temporarily unavailable. Please try again later."
        }

        return NextResponse.json(
          {
            success: false,
            error: userMessage,
            step: "create_prediction",
            details: errorMessage,
            httpStatus: response.status,
            responsePreview: responseText.substring(0, 200),
          },
          { status: response.status },
        )
      }

      // Try to parse JSON response
      try {
        prediction = JSON.parse(responseText)
      } catch (jsonError: any) {
        console.error("❌ Failed to parse JSON response:", jsonError)
        console.error("Response text (first 200 chars):", responseText.substring(0, 200))
        return NextResponse.json(
          {
            success: false,
            error: "Invalid response from AI service",
            step: "parse_response",
            details: `JSON parse error: ${jsonError.message}`,
            responsePreview: responseText.substring(0, 100),
          },
          { status: 500 },
        )
      }

      if (!prediction?.id) {
        console.error("❌ No prediction ID in response:", prediction)
        return NextResponse.json(
          {
            success: false,
            error: "No prediction ID returned from AI service",
            step: "prediction_id",
            details: prediction,
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

    // Wait for completion with extended timeout for large files
    const startTime = Date.now()
    const timeout = 20 * 60 * 1000 // 20 minutes for large files
    let finalPrediction: any

    try {
      console.log("⏳ Waiting for prediction to complete...")

      while (true) {
        if (Date.now() - startTime > timeout) {
          throw new Error("Prediction timed out after 20 minutes")
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

          try {
            finalPrediction = JSON.parse(statusText)
          } catch (parseError) {
            throw new Error(`Failed to parse status response: ${parseError}`)
          }
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
          throw new Error(`AI processing failed: ${errorMsg}`)
        }

        if (finalPrediction.status === "canceled") {
          throw new Error("Prediction was canceled")
        }

        // Wait before next check - longer intervals for large files
        await new Promise((resolve) => setTimeout(resolve, 5000))
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
        {
          success: false,
          error: "No output from AI processing",
          step: "output_extraction",
          predictionId: prediction.id,
        },
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
      console.error("❌ Invalid download URL:", downloadUrl)
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

    // Calculate final upscale factor
    const currentUpscale = Math.pow(iterationUpscale, cascadeIteration)
    const finalUpscale = Math.pow(iterationUpscale, totalIterations)

    return NextResponse.json({
      success: true,
      downloadUrl,
      model: modelId,
      method: "replicate",
      processingTime,
      predictionId: prediction.id,
      fileSize: "Enhanced image",
      upscaleFactor: currentUpscale,
      finalUpscaleFactor: finalUpscale,
      cascadeIteration,
      totalIterations,
      isComplete: cascadeIteration >= totalIterations,
      originalSize: `${Math.round(file.size / 1024)}KB`,
    })
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error occurred", step: "unexpected_error" },
      { status: 500 },
    )
  }
}
