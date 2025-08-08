import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/enhance-replicate
 *
 * Enhanced image processing with Replicate AI models
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let step = "initialization"

  console.log("🚀 Starting Replicate image enhancement...")
  console.log("📊 Request method:", req.method)
  console.log("📊 Content-Type:", req.headers.get("content-type"))
  console.log("📊 All headers:", Object.fromEntries(req.headers.entries()))

  try {
    /* ------------------------------------------------------------------ */
    step = "validate-token"
    const token = process.env.REPLICATE_API_TOKEN
    if (!token) {
      console.error("❌ REPLICATE_API_TOKEN not configured")
      return NextResponse.json(
        {
          success: false,
          error: "Replicate API token not configured",
          step,
          details: "Environment variable REPLICATE_API_TOKEN is missing",
        },
        { status: 500 },
      )
    }
    if (!token.startsWith("r8_")) {
      console.error("❌ Invalid REPLICATE_API_TOKEN format")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Replicate API token format",
          step,
          details: "Token should start with 'r8_'",
        },
        { status: 500 },
      )
    }
    console.log("✅ API token is configured and has correct format")

    /* ------------------------------------------------------------------ */
    step = "parse-form"
    let formData: FormData
    let file: File | null = null
    let settingsRaw: string = "{}"

    try {
      console.log("📥 Parsing form data...")
      
      // Check if the request has the correct content type (more lenient check)
      const contentType = req.headers.get("content-type")
      console.log("📊 Content-Type header:", contentType)
      
      // More lenient content type check - just check if it contains multipart
      if (contentType && !contentType.includes("multipart")) {
        console.warn("⚠️ Unexpected content type, but attempting to parse anyway:", contentType)
      }

      // Parse form data with better error handling
      try {
        formData = await req.formData()
        console.log("✅ Form data parsed successfully")
      } catch (formDataError) {
        console.error("❌ FormData parsing failed:", formDataError)
        console.error("❌ Error details:", {
          name: formDataError.name,
          message: formDataError.message,
          stack: formDataError.stack?.split('\n').slice(0, 3)
        })
        throw new Error(`FormData parsing failed: ${formDataError.message}`)
      }
      
      // Log form data keys for debugging
      const keys = Array.from(formData.keys())
      console.log("📊 Form data keys:", keys)
      
      // Extract file and settings
      file = formData.get("file") as File | null
      settingsRaw = (formData.get("settings") as string) || "{}"
      
      console.log("📊 Extracted data:", {
        hasFile: !!file,
        fileType: file?.constructor?.name,
        fileName: file?.name,
        fileSize: file?.size,
        settingsLength: settingsRaw.length
      })
      
    } catch (parseError) {
      console.error("❌ Failed to parse form data:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse form data",
          step,
          details: parseError.message,
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // Validate file after extraction
    if (!file) {
      console.error("❌ No file field in form-data")
      console.error("❌ Available fields:", Array.from(formData.keys()))
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
          step,
          details: `File field is missing from form data. Available fields: ${Array.from(formData.keys()).join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Validate file object
    if (!(file instanceof File)) {
      console.error("❌ File field is not a File object:", typeof file, file?.constructor?.name)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file object",
          step,
          details: `Expected File object, got ${typeof file} (${file?.constructor?.name})`,
        },
        { status: 400 },
      )
    }

    if (!file.type.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type",
          step,
          details: `Expected image file, got ${file.type}`,
        },
        { status: 400 },
      )
    }

    if (file.size > 50 * 1024 * 1024) {
      console.error("❌ File too large:", file.size)
      return NextResponse.json(
        {
          success: false,
          error: "File too large",
          step,
          details: `File size ${file.size} bytes exceeds 50MB limit`,
        },
        { status: 400 },
      )
    }

    let settings
    try {
      settings = JSON.parse(settingsRaw) as {
        model?: string
        upscaleFactor?: number
        preserveAsianFeatures?: boolean
      }
    } catch (settingsError) {
      console.error("❌ Failed to parse settings JSON:", settingsError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid settings format",
          step,
          details: `Failed to parse settings JSON: ${settingsError.message}`,
        },
        { status: 400 },
      )
    }

    console.log("📊 File info:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })
    console.log("📊 Settings:", settings)

    /* ------------------------------------------------------------------ */
    step = "buffer→b64"
    let buffer: Buffer
    let base64Image: string
    
    try {
      console.log("🔄 Converting file to buffer...")
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      console.log(`✅ Buffer created: ${buffer.length} bytes`)
      
      base64Image = `data:${file.type};base64,${buffer.toString("base64")}`
      console.log(`✅ Converted to base64: ${base64Image.length} characters`)
      
      if (base64Image.length > 10 * 1024 * 1024) {
        console.error("❌ Base64 image too large:", base64Image.length)
        return NextResponse.json(
          {
            success: false,
            error: "Image too large for processing",
            step,
            details: `Base64 size ${base64Image.length} exceeds limit`,
          },
          { status: 400 },
        )
      }
    } catch (bufferError) {
      console.error("❌ Failed to process file buffer:", bufferError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process file",
          step,
          details: bufferError.message,
        },
        { status: 500 },
      )
    }

    /* ------------------------------------------------------------------ */
    step = "model-map"
    const modelMap = {
      "real-esrgan-4x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        getInput: (image, settings) => ({
          image,
          scale: 4,
          tile: settings.tile || 512,
          face_enhance: false, // Preserve natural features
          fp32: false,
        }),
      },
      "real-esrgan-2x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        getInput: (image, settings) => ({
          image,
          scale: 2,
          tile: settings.tile || 512,
          face_enhance: false, // Preserve natural features
          fp32: false,
        }),
      },
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        inputField: "img",
        getInput: (image, settings) => ({
          img: image, // Note: GFPGAN uses 'img' not 'image'
          scale: Math.min(settings.upscaleFactor || 2, 4),
        }),
      },
      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        inputField: "image",
        getInput: (image, settings) => ({
          image,
          fidelity: 0.7,
          upscale: Math.min(settings.upscaleFactor || 2, 4),
          face_upsample: true,
          background_enhance: true,
          codeformer_fidelity: 0.7,
        }),
      },
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        inputField: "image",
        getInput: (image, settings) => ({
          image,
          scale_factor: Math.min(settings.upscaleFactor || 2, 4),
          dynamic: 6,
          creativity: 0.35,
          resemblance: 0.6,
          tiling: false,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
        }),
      },
    }

    const selectedModel = settings.model || "real-esrgan-4x"
    const modelConfig = modelMap[selectedModel]

    if (!modelConfig) {
      console.error(`❌ Unknown model: ${selectedModel}`)
      console.error(`❌ Available models: ${Object.keys(modelMap).join(", ")}`)
      return NextResponse.json(
        {
          success: false,
          error: `Unknown model: ${selectedModel}`,
          step,
          details: `Available models: ${Object.keys(modelMap).join(", ")}`,
        },
        { status: 400 },
      )
    }
    console.log(`✅ Using model: ${modelConfig.model} (${selectedModel})`)

    /* ------------------------------------------------------------------ */
    step = "create-prediction"
    let createRes: Response
    let prediction: any
    
    try {
      console.log("🌐 Creating Replicate prediction...")
      createRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: modelConfig.version,
          input: modelConfig.getInput(base64Image, settings),
        }),
      })

      console.log(`📥 Replicate response status: ${createRes.status}`)

      if (createRes.status === 413) {
        console.error("❌ Image too large for Replicate (413)")
        return NextResponse.json(
          {
            success: false,
            error: "Image too large for Replicate (413)",
            step,
          },
          { status: 413 },
        )
      }

      if (!createRes.ok) {
        const errorText = await createRes.text()
        console.error(`❌ Prediction creation failed: ${errorText}`)
        return NextResponse.json(
          {
            success: false,
            error: "Prediction creation failed",
            step,
            details: errorText.slice(0, 500),
          },
          { status: createRes.status },
        )
      }

      prediction = await createRes.json()
      console.log("✅ Prediction creation response received")
      console.log(`📊 Prediction keys: ${Object.keys(prediction || {}).join(", ")}`)

      if (!prediction || !prediction.id) {
        throw new Error("No prediction ID returned from Replicate")
      }

      console.log(`🔮 Prediction created: ${prediction.id}`)
      console.log(`📊 Initial status: ${prediction.status}`)
      
    } catch (replicateError) {
      console.error("❌ Failed to create Replicate prediction:", replicateError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create prediction",
          step,
          details: replicateError.message,
        },
        { status: 500 },
      )
    }

    /* ------------------------------------------------------------------ */
    step = "poll"
    const deadline = Date.now() + 5 * 60 * 1000 // 5 minutes
    let poll = prediction
    let attempts = 0
    const maxAttempts = 150 // 5 minutes with 2-second intervals
    
    while (["starting", "processing"].includes(poll.status) && attempts < maxAttempts) {
      if (Date.now() > deadline) {
        console.error("❌ Prediction timed out after maximum time")
        return NextResponse.json(
          {
            success: false,
            error: "Prediction timed out",
            step,
            details: {
              predictionId: poll.id,
              finalStatus: poll.status,
              attempts,
              maxWaitTime: "300s",
            },
          },
          { status: 408 },
        )
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
      attempts++

      try {
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${poll.id}`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!pollRes.ok) {
          const errorText = await pollRes.text()
          console.error(`❌ Polling failed: ${errorText}`)
          return NextResponse.json(
            {
              success: false,
              error: "Polling failed",
              step,
              details: errorText.slice(0, 500),
            },
            { status: pollRes.status },
          )
        }

        poll = await pollRes.json()
        console.log(`📊 Updated status (attempt ${attempts}): ${poll.status}`)

        if (poll.logs) {
          const recentLogs = poll.logs.slice(-200) // Last 200 chars
          console.log(`📝 Recent logs: ${recentLogs}`)
        }
      } catch (pollError) {
        console.error(`❌ Polling error (attempt ${attempts}):`, pollError)
        // Continue polling unless we've exceeded max attempts
        if (attempts >= maxAttempts) {
          return NextResponse.json(
            {
              success: false,
              error: "Polling failed after max attempts",
              step,
              details: pollError.message,
            },
            { status: 500 },
          )
        }
      }
    }

    if (poll.status !== "succeeded" || !poll.output) {
      console.error("❌ Prediction finished without output", poll)
      return NextResponse.json(
        {
          success: false,
          error: "Prediction finished without output",
          step,
          details: {
            status: poll.status,
            error: poll.error,
            logs: poll.logs,
          },
        },
        { status: 500 },
      )
    }

    const outputUrl = Array.isArray(poll.output) ? poll.output[0] : poll.output

    console.log(`🎯 Enhanced image URL: ${outputUrl}`)

    /* ------------------------------------------------------------------ */
    step = "done"
    const processingTime = `${Math.round((Date.now() - startTime) / 1000)}s`

    const result = {
      success: true,
      downloadUrl: outputUrl,
      model: selectedModel,
      modelName: modelConfig.model,
      replicateModel: modelConfig.model,
      predictionId: poll.id,
      processingTime,
      originalFileName: file.name,
      fileSize: `${Math.round(buffer.length / 1024)}KB`,
      enhancedSize: `Enhanced with ${modelConfig.model}`,
      upscaleFactor: settings.upscaleFactor || 2,
      preserveAsianFeatures: settings.preserveAsianFeatures || false,
      logs: poll.logs,
      step: "completed",
    }

    console.log(`🎉 Enhancement completed successfully in ${processingTime}`)
    console.log(`📊 Final result keys: ${Object.keys(result).join(", ")}`)

    return NextResponse.json(result)
  } catch (error) {
    const processingTime = `${Math.round((Date.now() - startTime) / 1000)}s`

    console.error(`❌ Enhancement failed at step ${step}:`, error)
    console.error(`❌ Error name: ${error.name}`)
    console.error(`❌ Error message: ${error.message}`)
    console.error(`❌ Error stack: ${error.stack}`)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error occurred",
        step,
        processingTime,
        timestamp: new Date().toISOString(),
        details: {
          errorName: error.name,
          errorStack: error.stack?.split("\n").slice(0, 5).join("\n"), // First 5 lines of stack
        },
      },
      { status: 500 },
    )
  }
}
