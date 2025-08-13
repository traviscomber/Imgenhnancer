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

    // Smart image processing to ensure API compatibility
    let imageInput: string
    try {
      console.log("🔄 Processing image for API compatibility...")

      // Create image element to get dimensions and process
      const arrayBuffer = await file.arrayBuffer()
      const blob = new Blob([arrayBuffer], { type: file.type })

      // Process image to ensure it's within API limits
      const processedBlob = await processImageForAPI(blob, file.name)

      // Convert to base64
      const processedArrayBuffer = await processedBlob.arrayBuffer()
      const base64 = Buffer.from(processedArrayBuffer).toString("base64")
      imageInput = `data:${processedBlob.type};base64,${base64}`

      const originalSizeMB = Math.round(file.size / 1024 / 1024)
      const processedSizeMB = Math.round(processedBlob.size / 1024 / 1024)
      const base64SizeMB = Math.round(base64.length / 1024 / 1024)

      console.log(`✅ Image processed: ${originalSizeMB}MB → ${processedSizeMB}MB (base64: ${base64SizeMB}MB)`)

      // Additional safety check for base64 size
      if (base64SizeMB > 25) {
        throw new Error(`Base64 payload too large: ${base64SizeMB}MB (max 25MB)`)
      }
    } catch (error: any) {
      console.error("❌ Failed to process image:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process image file",
          step: "image_processing",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Model configuration
    const modelId = settings.model || "clarity-upscaler"
    const modelConfigs: Record<string, any> = {
      "clarity-upscaler": {
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: imageInput,
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
        input: {
          image: imageInput,
          scale: settings.upscaleFactor || 4,
          face_enhance: false,
        },
      },
      "real-esrgan-2x": {
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: {
          image: imageInput,
          scale: 2,
          face_enhance: false,
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

    console.log(`✅ Using model: ${modelId} (version: ${config.version})`)

    // Create prediction with enhanced error handling
    let prediction: any
    try {
      console.log("🔄 Creating prediction via Replicate API...")

      const requestBody = JSON.stringify({
        version: config.version,
        input: config.input,
      })

      const requestSizeMB = Math.round(requestBody.length / 1024 / 1024)
      console.log(`📤 Request payload size: ${requestSizeMB}MB`)

      // Additional safety check before sending
      if (requestSizeMB > 30) {
        throw new Error(`Request payload too large: ${requestSizeMB}MB (max 30MB)`)
      }

      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
      })

      // Get response text first and check what we received
      const responseText = await response.text()
      const contentType = response.headers.get("content-type") || ""

      console.log(`📥 Response status: ${response.status}`)
      console.log(`📥 Content-Type: ${contentType}`)
      console.log(`📥 Response length: ${responseText.length} chars`)
      console.log(`📥 Response preview: ${responseText.substring(0, 200)}...`)

      // Check if we got an HTML error page (common with payload too large errors)
      const isHtmlResponse =
        responseText.trim().toLowerCase().startsWith("<!doctype html") ||
        responseText.trim().toLowerCase().startsWith("<html") ||
        contentType.includes("text/html")

      if (isHtmlResponse) {
        console.error("❌ Received HTML error page instead of JSON")

        let userMessage = "Server returned an error page instead of processing the image"

        // Check for common error patterns in HTML
        if (
          responseText.includes("Request Entity Too Large") ||
          responseText.includes("413") ||
          responseText.includes("FUNCTION_PAYLOAD_TOO_LARGE")
        ) {
          userMessage = "Image file is too large for processing. Please try a smaller image or lower quality."
        } else if (responseText.includes("502") || responseText.includes("Bad Gateway")) {
          userMessage = "AI service is temporarily unavailable. Please try again in a few minutes."
        } else if (responseText.includes("504") || responseText.includes("Gateway Timeout")) {
          userMessage = "Request timed out. Please try again with a smaller image."
        }

        return NextResponse.json(
          {
            success: false,
            error: userMessage,
            step: "html_error_page",
            httpStatus: response.status,
            isHtmlResponse: true,
            responsePreview: responseText.substring(0, 300),
          },
          { status: response.status || 502 },
        )
      }

      // Check for non-OK status
      if (!response.ok) {
        console.error("❌ Non-OK response status")

        let userMessage = "Failed to process image with AI service"
        if (response.status === 401) {
          userMessage = "Authentication failed with AI service"
        } else if (response.status === 429) {
          userMessage = "Too many requests. Please try again in a few minutes."
        } else if (response.status >= 500) {
          userMessage = "AI service is temporarily unavailable. Please try again later."
        } else if (response.status === 413) {
          userMessage = "Image is too large for processing. Please try a smaller image."
        }

        return NextResponse.json(
          {
            success: false,
            error: userMessage,
            step: "http_error",
            httpStatus: response.status,
            responsePreview: responseText.substring(0, 200),
          },
          { status: response.status },
        )
      }

      // Check if response looks like JSON
      if (!contentType.includes("application/json") && !responseText.trim().startsWith("{")) {
        console.error("❌ Response doesn't appear to be JSON")
        return NextResponse.json(
          {
            success: false,
            error: "Invalid response format from AI service",
            step: "non_json_response",
            contentType,
            responsePreview: responseText.substring(0, 200),
          },
          { status: 502 },
        )
      }

      // Try to parse JSON response
      try {
        prediction = JSON.parse(responseText)
        console.log(`✅ JSON parsed successfully`)
      } catch (jsonError: any) {
        console.error("❌ Failed to parse JSON response:", jsonError)
        return NextResponse.json(
          {
            success: false,
            error: "Invalid JSON response from AI service",
            step: "json_parse_error",
            details: `JSON parse error: ${jsonError.message}`,
            responsePreview: responseText.substring(0, 200),
          },
          { status: 502 },
        )
      }

      if (!prediction?.id) {
        console.error("❌ No prediction ID in response:", prediction)
        return NextResponse.json(
          {
            success: false,
            error: "No prediction ID returned from AI service",
            step: "missing_prediction_id",
            details: prediction,
          },
          { status: 500 },
        )
      }

      console.log(`✅ Prediction created: ${prediction.id}`)
    } catch (error: any) {
      console.error("❌ Failed to create prediction:", error)

      // Handle specific network errors
      let userMessage = "Network error while contacting AI service"
      if (error.message.includes("fetch")) {
        userMessage = "Unable to connect to AI service. Please check your internet connection."
      } else if (error.message.includes("timeout")) {
        userMessage = "Request timed out. Please try again."
      } else if (error.message.includes("too large")) {
        userMessage = error.message
      }

      return NextResponse.json(
        {
          success: false,
          error: userMessage,
          step: "network_error",
          details: error.message,
        },
        { status: 500 },
      )
    }

    // Wait for completion
    const startTime = Date.now()
    const timeout = 20 * 60 * 1000 // 20 minutes
    let finalPrediction: any

    try {
      console.log("⏳ Waiting for prediction to complete...")

      while (true) {
        if (Date.now() - startTime > timeout) {
          throw new Error("Prediction timed out after 20 minutes")
        }

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

        // Wait 5 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    } catch (error: any) {
      console.error("❌ Prediction processing failed:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          step: "prediction_processing",
          predictionId: prediction.id,
        },
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
          step: "missing_output",
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
      console.error("❌ Unexpected output format:", typeof output)
      return NextResponse.json(
        {
          success: false,
          error: "Unexpected output format from AI service",
          step: "invalid_output_format",
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
          step: "invalid_download_url",
          predictionId: prediction.id,
        },
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
      originalSize: `${Math.round(file.size / 1024 / 1024)}MB`,
    })
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unexpected error occurred",
        step: "unexpected_error",
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

/**
 * Process image to ensure it's within API limits - Server-side version
 */
async function processImageForAPI(blob: Blob, fileName: string): Promise<Blob> {
  try {
    // For server-side processing, we need to use a different approach
    // since we don't have access to DOM APIs like Image and Canvas

    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Check if we have sharp available for server-side image processing
    try {
      const sharp = require("sharp")

      const image = sharp(buffer)
      const metadata = await image.metadata()

      console.log(`📐 Original dimensions: ${metadata.width}x${metadata.height}`)

      let { width = 1920, height = 1080 } = metadata
      const maxDimension = 4096
      const targetFileSize = 10 * 1024 * 1024 // 10MB target for safety

      // Resize if too large
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
        console.log(`📐 Resizing to: ${width}x${height}`)
      }

      // Process with sharp
      let processedBuffer = await image
        .resize(width, height, {
          kernel: sharp.kernel.lanczos3,
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
          progressive: true,
          mozjpeg: true,
        })
        .toBuffer()

      // If still too large, reduce quality
      let quality = 85
      while (processedBuffer.length > targetFileSize && quality > 30) {
        quality -= 10
        processedBuffer = await image
          .resize(width, height, {
            kernel: sharp.kernel.lanczos3,
            withoutEnlargement: true,
          })
          .jpeg({
            quality,
            progressive: true,
            mozjpeg: true,
          })
          .toBuffer()

        console.log(`🔄 Reduced quality to ${quality}%, size: ${Math.round(processedBuffer.length / 1024 / 1024)}MB`)
      }

      const finalSizeMB = Math.round(processedBuffer.length / 1024 / 1024)
      console.log(`✅ Final processed size: ${finalSizeMB}MB`)

      return new Blob([processedBuffer], { type: "image/jpeg" })
    } catch (sharpError) {
      console.warn("⚠️ Sharp not available, using fallback processing")

      // Fallback: just return the original blob if it's not too large
      const sizeMB = blob.size / 1024 / 1024
      if (sizeMB <= 15) {
        console.log(`✅ Using original image (${Math.round(sizeMB)}MB)`)
        return blob
      } else {
        throw new Error(`Image too large (${Math.round(sizeMB)}MB) and no image processing available`)
      }
    }
  } catch (error: any) {
    console.error("❌ Image processing failed:", error)
    throw new Error(`Image processing failed: ${error.message}`)
  }
}
