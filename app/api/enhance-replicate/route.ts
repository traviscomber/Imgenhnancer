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
      },
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        inputField: "img",
      },
      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        inputField: "image",
      },
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        inputField: "image",
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

    console.log("🤖 Using model config:", modelConfig)

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log("📤 File converted to data URL, size:", dataUrl.length)

    // Create prediction
    const createUrl = "https://api.replicate.com/v1/predictions"
    const createPayload = {
      version: modelConfig.version,
      input: {
        [modelConfig.inputField]: dataUrl,
        scale: settings.upscaleFactor || 2,
      },
    }

    console.log("🌐 Creating prediction with payload:", {
      version: modelConfig.version,
      inputField: modelConfig.inputField,
      scale: settings.upscaleFactor || 2,
    })

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

    let createData
    try {
      createData = await createRes.json()
    } catch (parseError) {
      console.error("❌ Failed to parse create prediction response as JSON:", parseError)
      const textResponse = await createRes.text()
      console.error("❌ Raw response text:", textResponse)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create prediction: ${textResponse}`,
          step: "create-prediction",
        },
        { status: createRes.status },
      )
    }

    if (!createRes.ok) {
      console.error("❌ Create prediction failed:", createData)
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

      let pollData
      try {
        pollData = await pollRes.json()
      } catch (parseError) {
        console.error("❌ Failed to parse poll response as JSON:", parseError)
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
