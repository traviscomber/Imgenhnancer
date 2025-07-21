import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting Replicate enhancement request")

    // Check for API token
    const replicateToken = process.env.REPLICATE_API_TOKEN
    if (!replicateToken) {
      console.error("❌ REPLICATE_API_TOKEN not found")
      return NextResponse.json(
        {
          success: false,
          error: "Replicate API token not configured",
          step: "configuration",
        },
        { status: 500 },
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const settingsStr = formData.get("settings") as string

    if (!file) {
      console.error("❌ No file provided")
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
          step: "validation",
        },
        { status: 400 },
      )
    }

    console.log("📁 File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Check file size limit (5MB for Replicate)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_FILE_SIZE) {
      console.error("❌ File too large:", file.size, "bytes (max:", MAX_FILE_SIZE, ")")
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB, but your file is ${Math.round(file.size / 1024 / 1024)}MB`,
          step: "validation",
          fileSize: file.size,
          maxSize: MAX_FILE_SIZE,
        },
        { status: 400 },
      )
    }

    // Parse settings
    let settings
    try {
      settings = JSON.parse(settingsStr || "{}")
    } catch (error) {
      console.error("❌ Invalid settings JSON:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid settings format",
          step: "validation",
        },
        { status: 400 },
      )
    }

    console.log("⚙️ Settings parsed:", settings)

    // Model configuration
    const modelConfigs = {
      "real-esrgan-4x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        maxFileSize: 5 * 1024 * 1024, // 5MB
      },
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        inputField: "img",
        maxFileSize: 3 * 1024 * 1024, // 3MB
      },
      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        inputField: "image",
        maxFileSize: 3 * 1024 * 1024, // 3MB
      },
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        inputField: "image",
        maxFileSize: 4 * 1024 * 1024, // 4MB
      },
    }

    const selectedModel = settings.model || "real-esrgan-4x"
    const modelConfig = modelConfigs[selectedModel]

    if (!modelConfig) {
      console.error("❌ Unknown model:", selectedModel)
      return NextResponse.json(
        {
          success: false,
          error: `Unknown model: ${selectedModel}`,
          step: "model-selection",
        },
        { status: 400 },
      )
    }

    // Check model-specific file size limit
    if (file.size > modelConfig.maxFileSize) {
      console.error(
        "❌ File too large for model:",
        file.size,
        "bytes (max for",
        selectedModel,
        ":",
        modelConfig.maxFileSize,
        ")",
      )
      return NextResponse.json(
        {
          success: false,
          error: `File too large for ${selectedModel}. Maximum size is ${Math.round(modelConfig.maxFileSize / 1024 / 1024)}MB, but your file is ${Math.round(file.size / 1024 / 1024)}MB`,
          step: "validation",
          model: selectedModel,
          fileSize: file.size,
          maxSize: modelConfig.maxFileSize,
        },
        { status: 400 },
      )
    }

    console.log("🤖 Using model config:", modelConfig)

    // Try URL upload first (more efficient for large files)
    let imageInput: string

    try {
      // Option 1: Upload to a temporary storage service (recommended)
      console.log("📤 Attempting URL-based upload...")

      // For now, we'll use base64 but with compression
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Compress image if it's too large
      let finalBuffer = buffer
      let compressionApplied = false

      if (buffer.length > 2 * 1024 * 1024) {
        // If larger than 2MB
        console.log("🗜️ Compressing image to reduce payload size...")

        // Simple compression by reducing quality (this is a basic approach)
        // In production, you'd use a proper image compression library
        const base64 = buffer.toString("base64")
        const dataUrl = `data:${file.type};base64,${base64}`

        // For now, we'll proceed with the original but warn about size
        finalBuffer = buffer
        compressionApplied = false

        console.log("⚠️ Large file detected. Consider implementing image compression.")
      }

      const base64 = finalBuffer.toString("base64")
      imageInput = `data:${file.type};base64,${base64}`

      console.log("📊 Final payload size:", imageInput.length, "characters")

      // Check if payload is still too large
      const payloadSizeBytes = Buffer.byteLength(imageInput, "utf8")
      const maxPayloadSize = 10 * 1024 * 1024 // 10MB payload limit

      if (payloadSizeBytes > maxPayloadSize) {
        console.error("❌ Payload too large after processing:", payloadSizeBytes, "bytes")
        return NextResponse.json(
          {
            success: false,
            error: `Image payload too large for processing. Please use a smaller image (under ${Math.round(maxPayloadSize / 1024 / 1024)}MB when encoded).`,
            step: "payload-size-check",
            payloadSize: payloadSizeBytes,
            maxPayloadSize: maxPayloadSize,
            suggestion: "Try reducing image dimensions or using a lower quality JPEG",
          },
          { status: 400 },
        )
      }
    } catch (error) {
      console.error("❌ Error processing image:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process image for upload",
          step: "image-processing",
        },
        { status: 500 },
      )
    }

    // Create prediction with optimized payload
    const createUrl = "https://api.replicate.com/v1/predictions"
    const createPayload = {
      version: modelConfig.version,
      input: {
        [modelConfig.inputField]: imageInput,
        scale: Math.min(settings.upscaleFactor || 2, 4), // Limit to 4x to reduce processing load
      },
    }

    console.log("🌐 Creating prediction with payload size:", JSON.stringify(createPayload).length, "characters")

    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createPayload),
    })

    console.log("📥 Create prediction response:", {
      status: createRes.status,
      statusText: createRes.statusText,
      ok: createRes.ok,
    })

    // Get response text first, then try to parse as JSON
    const createResponseText = await createRes.text()
    console.log("📄 Raw create response:", createResponseText.substring(0, 500))

    let createData
    try {
      createData = JSON.parse(createResponseText)
    } catch (parseError) {
      console.error("❌ Failed to parse create prediction response as JSON:", parseError)
      console.error("❌ Raw response text:", createResponseText)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create prediction: ${createResponseText}`,
          step: "create-prediction",
        },
        { status: createRes.status },
      )
    }

    if (!createRes.ok) {
      console.error("❌ Create prediction failed:", createData)

      // Handle specific error cases
      if (
        createResponseText.includes("FUNCTION_PAYLOAD_TOO_LARGE") ||
        createResponseText.includes("Request Entity Too Large")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Image file is too large for processing. Please use a smaller image (recommended: under 2MB).",
            step: "payload-too-large",
            details: "The image data exceeds Replicate's payload size limits",
            suggestions: [
              "Reduce image dimensions (e.g., resize to 1024x1024 or smaller)",
              "Use JPEG format with lower quality (70-80%)",
              "Crop the image to focus on the main subject",
              "Try a different AI model that supports larger files",
            ],
            originalError: createData.detail || createData.error || createResponseText,
          },
          { status: 413 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: createData.detail || createData.error || "Failed to create prediction",
          step: "create-prediction",
          details: createData,
        },
        { status: createRes.status },
      )
    }

    console.log("✅ Prediction created:", {
      id: createData.id,
      status: createData.status,
    })

    // Poll for completion
    const predictionId = createData.id
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds
      attempts++

      console.log(`🔄 Polling attempt ${attempts}/${maxAttempts}`)

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          Authorization: `Token ${replicateToken}`,
        },
      })

      // Get response text first, then try to parse as JSON
      const pollResponseText = await pollRes.text()

      let pollData
      try {
        pollData = JSON.parse(pollResponseText)
      } catch (parseError) {
        console.error("❌ Failed to parse poll response as JSON:", parseError)
        console.error("❌ Raw poll response:", pollResponseText.substring(0, 500))
        continue // Try again
      }

      console.log("📊 Poll response:", {
        status: pollData.status,
        progress: pollData.progress,
      })

      if (pollData.status === "succeeded") {
        console.log("✅ Enhancement completed successfully")
        return NextResponse.json({
          success: true,
          downloadUrl: pollData.output?.[0] || pollData.output,
          predictionId: predictionId,
          model: selectedModel,
          method: "replicate",
          processingTime: `${attempts * 5}s`,
          enhancedSize: "Enhanced",
        })
      }

      if (pollData.status === "failed") {
        console.error("❌ Enhancement failed:", pollData.error)
        return NextResponse.json(
          {
            success: false,
            error: pollData.error || "Enhancement failed",
            step: "processing",
            predictionId: predictionId,
          },
          { status: 500 },
        )
      }

      if (pollData.status === "canceled") {
        console.error("❌ Enhancement was canceled")
        return NextResponse.json(
          {
            success: false,
            error: "Enhancement was canceled",
            step: "processing",
            predictionId: predictionId,
          },
          { status: 500 },
        )
      }

      // Continue polling for "starting" and "processing" statuses
    }

    // Timeout
    console.error("❌ Enhancement timed out")
    return NextResponse.json(
      {
        success: false,
        error: "Enhancement timed out after 5 minutes",
        step: "timeout",
        predictionId: predictionId,
      },
      { status: 408 },
    )
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        step: "unexpected",
      },
      { status: 500 },
    )
  }
}
