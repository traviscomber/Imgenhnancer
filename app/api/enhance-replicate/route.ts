import { type NextRequest, NextResponse } from "next/server"
import { Buffer } from "buffer"

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

    // File size validation - be more restrictive for production
    const maxSize = 15 * 1024 * 1024 // 15MB max (increased for mobile photos)
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

    // Convert file to base64 using Node.js Buffer (server-safe)
    let imageDataUrl: string
    try {
      console.log("🔄 Converting image to base64...")
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Check if base64 will be too large - be very conservative
      const estimatedBase64Size = (buffer.length * 4) / 3
      const maxBase64Size = 1.2 * 1024 * 1024 // Reduced to 1.2MB max for base64

      if (estimatedBase64Size > maxBase64Size) {
        console.error(`❌ Image too large for API: ${Math.round(estimatedBase64Size / 1024 / 1024)}MB estimated base64`)
        return NextResponse.json(
          {
            success: false,
            error: `Image is still too large after compression. Please use an image under 800KB before uploading.`,
            step: "size_check",
            details: `Current size: ${Math.round(estimatedBase64Size / 1024 / 1024)}MB, Maximum: 1.2MB base64`,
            suggestion: "Try using a smaller image or compress it further before uploading.",
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

    // Model configuration with enhanced face preservation control
    const modelId = settings.model || "clarity-upscaler-face-preserve"
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
          face_enhance: true,
          codeformer_fidelity: 0.7,
          background_enhance: true,
        },
      },
      "clarity-upscaler-face-preserve": {
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageDataUrl,
          scale_factor: settings.upscaleFactor || 2,
          dynamic: 6,
          creativity: 0.35,
          resemblance: 0.6,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
          // Completely disable all face enhancement
          face_enhance: false,
          codeformer_fidelity: 0.0,
          background_enhance: true,
          only_center_face: false,
          // Additional parameters to ensure no face modification
          gfpgan_visibility: 0.0,
          restoreformer_weight: 0.0,
        },
      },
      "clarity-upscaler-no-face": {
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageDataUrl,
          scale_factor: settings.upscaleFactor || 2,
          dynamic: 6,
          creativity: 0.35,
          resemblance: 0.6,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
          // Disable face enhancement by setting face-related parameters to minimal values
          face_enhance: false,
          codeformer_fidelity: 0.0,
          background_enhance: true,
          only_center_face: false,
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

    console.log(`✅ Using model: ${modelId} (version: ${config.version})`)
    if (modelId === "clarity-upscaler-face-preserve" || modelId === "clarity-upscaler-no-face") {
      console.log("🛡️ Face preservation mode enabled - no facial modifications will be applied")
    }

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

      console.log(`📥 Response status: ${response.status}`)

      if (!response.ok) {
        const responseText = await response.text()
        console.error(`❌ API request failed: ${response.status} ${response.statusText}`)
        console.error("Response body:", responseText)

        let errorMessage = "Failed to create prediction"
        let userMessage = errorMessage

        if (response.status === 413 || responseText.includes("Request Entity Too Large")) {
          errorMessage = "Image too large for Replicate API"
          userMessage =
            "Image file is too large for the AI service. Try using a smaller image (under 3MB recommended) or compress it on the client side."
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
          },
          { status: response.status },
        )
      }

      const responseText = await response.text()
      try {
        prediction = JSON.parse(responseText)
      } catch (jsonError: any) {
        console.error("❌ Failed to parse JSON response:", jsonError)
        console.error("Response text:", responseText.substring(0, 500))
        return NextResponse.json(
          {
            success: false,
            error: "Invalid response from AI service",
            step: "parse_response",
            details: `JSON parse error: ${jsonError.message}`,
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

        // Wait before next check
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

    const facePreservationMode = modelId === "clarity-upscaler-face-preserve" || modelId === "clarity-upscaler-no-face"

    return NextResponse.json({
      success: true,
      downloadUrl,
      model: modelId,
      method: "replicate",
      processingTime,
      predictionId: prediction.id,
      fileSize: "Enhanced image",
      upscaleFactor: settings.upscaleFactor || 2,
      originalSize: `${Math.round(file.size / 1024)}KB`,
      faceEnhancement: !facePreservationMode,
      facePreservation: facePreservationMode,
    })
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error occurred", step: "unexpected_error" },
      { status: 500 },
    )
  }
}
