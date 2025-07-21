import { type NextRequest, NextResponse } from "next/server"

function isJsonResponse(res: Response) {
  const ct = res.headers.get("content-type") ?? ""
  return ct.includes("application/json")
}

export async function POST(request: NextRequest) {
  console.log("🚀 Starting enhance-replicate API call")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const settingsStr = formData.get("settings") as string

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
          step: "validation",
        },
        { status: 400 },
      )
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "Replicate API token not configured",
          step: "configuration",
        },
        { status: 500 },
      )
    }

    let settings
    try {
      settings = JSON.parse(settingsStr || "{}")
    } catch {
      settings = { model: "real-esrgan-4x", upscaleFactor: 2 }
    }

    console.log("📋 Processing settings:", settings)
    console.log("📁 File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Model configurations with increased file size limits
    const modelConfigs = {
      "real-esrgan-4x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        inputField: "image",
        maxSize: 8 * 1024 * 1024, // Increased to 8MB
      },
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        inputField: "img",
        maxSize: 6 * 1024 * 1024, // Increased to 6MB
      },
      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        inputField: "image",
        maxSize: 6 * 1024 * 1024, // Increased to 6MB
      },
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        inputField: "image",
        maxSize: 8 * 1024 * 1024, // Increased to 8MB
      },
    }

    const modelConfig = modelConfigs[settings.model] || modelConfigs["real-esrgan-4x"]

    // Check file size against model limits
    if (file.size > modelConfig.maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large for ${settings.model}. Maximum size: ${Math.round(modelConfig.maxSize / 1024 / 1024)}MB`,
          step: "file-size-check",
          suggestions: [
            "Try compressing the image first",
            "Use a different AI model with higher limits",
            "Reduce image dimensions before uploading",
          ],
        },
        { status: 413 },
      )
    }

    // Convert file to base64 data URL
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log("🔄 Converting to data URL completed")
    console.log("📊 Data URL size:", Math.round(dataUrl.length / 1024), "KB")

    // Prepare prediction input
    const input = {
      [modelConfig.inputField]: dataUrl,
      scale: settings.upscaleFactor || 2,
    }

    // Add model-specific parameters
    if (settings.model === "codeformer-face") {
      input.fidelity = 0.7 // Balance between quality and identity preservation
    }

    console.log("🤖 Creating prediction with model:", modelConfig.model)
    console.log("📝 Input parameters:", Object.keys(input))

    // Create prediction
    const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: modelConfig.version,
        input: input,
      }),
    })

    if (!predictionResponse.ok) {
      const errorText = await predictionResponse.text()
      console.error("❌ Prediction creation failed:", errorText)

      // Check for specific error types
      if (errorText.includes("Request Entity Too Large") || errorText.includes("FUNCTION_PAYLOAD_TOO_LARGE")) {
        return NextResponse.json(
          {
            success: false,
            error: `Image too large for processing. Please reduce file size to under ${Math.round(modelConfig.maxSize / 1024 / 1024)}MB`,
            step: "create-prediction",
            suggestions: [
              "Compress the image before uploading",
              "Reduce image dimensions",
              "Convert to JPEG format for smaller file size",
              `Try a different model with higher size limits`,
            ],
          },
          { status: 413 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: `Failed to create prediction: ${errorText}`,
          step: "create-prediction",
        },
        { status: predictionResponse.status },
      )
    }

    let prediction: any
    try {
      prediction = isJsonResponse(predictionResponse)
        ? await predictionResponse.json()
        : JSON.parse(await predictionResponse.text()) // fallback if it actually is JSON but wrong header
    } catch (err) {
      const raw = await predictionResponse.text()
      console.error("❌ Could not parse prediction response:", raw)
      return NextResponse.json(
        {
          success: false,
          error: raw.slice(0, 300) || "Upstream returned non-JSON response",
          step: "create-prediction-parse",
        },
        { status: 502 },
      )
    }
    console.log("✅ Prediction created:", prediction.id)

    // Poll for completion
    let attempts = 0
    const maxAttempts = 60 // 10 minutes with 10-second intervals

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds
      attempts++

      console.log(`🔄 Polling attempt ${attempts}/${maxAttempts}`)

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      })

      if (!statusResponse.ok) {
        console.error("❌ Status check failed:", statusResponse.status)
        continue
      }

      let status: any
      try {
        status = isJsonResponse(statusResponse)
          ? await statusResponse.json()
          : JSON.parse(await statusResponse.text())
      } catch (err) {
        const rawStatus = await statusResponse.text()
        console.error("❌ Could not parse status response:", rawStatus)
        return NextResponse.json(
          {
            success: false,
            error: rawStatus.slice(0, 300) || "Upstream returned non-JSON status",
            step: "status-parse",
            predictionId: prediction.id,
          },
          { status: 502 },
        )
      }
      console.log("📊 Status:", status.status)

      if (status.status === "succeeded") {
        console.log("✅ Enhancement completed successfully")
        console.log("📊 Full status object:", status)
        console.log("🔗 Output URLs:", status.output)

        const downloadUrl = Array.isArray(status.output) ? status.output[0] : status.output

        if (!downloadUrl || typeof downloadUrl !== "string") {
          console.error("❌ Invalid download URL received:", downloadUrl)
          return NextResponse.json(
            {
              success: false,
              error: "Invalid download URL received from AI service",
              step: "url-validation",
              debug: {
                output: status.output,
                outputType: typeof status.output,
              },
            },
            { status: 500 },
          )
        }

        console.log("🎯 Final download URL:", downloadUrl)

        // Validate URL format
        try {
          new URL(downloadUrl)
        } catch (urlError) {
          console.error("❌ Invalid URL format:", downloadUrl)
          return NextResponse.json(
            {
              success: false,
              error: "Invalid URL format received from AI service",
              step: "url-format-validation",
              debug: {
                url: downloadUrl,
                error: urlError.message,
              },
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          downloadUrl: downloadUrl,
          predictionId: prediction.id,
          model: settings.model,
          upscaleFactor: settings.upscaleFactor,
          processingTime: `${attempts * 10}s`,
          method: "replicate",
          enhancedSize: "Enhanced",
          debug: {
            fullOutput: status.output,
            outputType: typeof status.output,
            isArray: Array.isArray(status.output),
          },
        })
      }

      if (status.status === "failed") {
        console.error("❌ Enhancement failed:", status.error)

        return NextResponse.json(
          {
            success: false,
            error: status.error || "Enhancement failed",
            step: "processing",
            predictionId: prediction.id,
          },
          { status: 500 },
        )
      }

      if (status.status === "canceled") {
        console.error("❌ Enhancement was canceled")

        return NextResponse.json(
          {
            success: false,
            error: "Enhancement was canceled",
            step: "processing",
            predictionId: prediction.id,
          },
          { status: 500 },
        )
      }

      // Continue polling for 'starting' and 'processing' statuses
    }

    // Timeout reached
    console.error("❌ Enhancement timed out")

    return NextResponse.json(
      {
        success: false,
        error: "Enhancement timed out after 10 minutes",
        step: "timeout",
        predictionId: prediction.id,
      },
      { status: 408 },
    )
  } catch (error) {
    console.error("❌ Enhancement error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        step: "server-error",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
