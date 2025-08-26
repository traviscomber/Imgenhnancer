import { type NextRequest, NextResponse } from "next/server"

// Enhanced URL finding with multiple strategies
function findUrlInData(data: any, depth = 0): string | null {
  if (depth > 10) return null // Prevent infinite recursion

  console.log(
    `🔍 Searching for URL at depth ${depth}:`,
    typeof data,
    Array.isArray(data) ? `Array[${data.length}]` : data,
  )

  // Strategy 1: Direct string URL check
  if (typeof data === "string" && (data.startsWith("http://") || data.startsWith("https://"))) {
    console.log(`✅ Found direct URL: ${data}`)
    return data
  }

  // Strategy 2: Check common URL property names first (priority order)
  if (data && typeof data === "object") {
    const urlKeys = ["output", "url", "download_url", "result_url", "image_url", "file_url", "link", "href"]

    for (const key of urlKeys) {
      if (data[key]) {
        const result = findUrlInData(data[key], depth + 1)
        if (result) {
          console.log(`✅ Found URL via key '${key}': ${result}`)
          return result
        }
      }
    }

    // Strategy 3: Check numbered keys (0, 1, 2, etc.)
    for (let i = 0; i < 10; i++) {
      if (data[i]) {
        const result = findUrlInData(data[i], depth + 1)
        if (result) {
          console.log(`✅ Found URL via index ${i}: ${result}`)
          return result
        }
      }
    }

    // Strategy 4: Recursive search through all properties
    for (const [key, value] of Object.entries(data)) {
      if (urlKeys.includes(key)) continue // Already checked above

      const result = findUrlInData(value, depth + 1)
      if (result) {
        console.log(`✅ Found URL via recursive key '${key}': ${result}`)
        return result
      }
    }
  }

  // Strategy 5: Array handling
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const result = findUrlInData(data[i], depth + 1)
      if (result) {
        console.log(`✅ Found URL in array at index ${i}: ${result}`)
        return result
      }
    }
  }

  // Strategy 6: String pattern matching for URLs within text
  if (typeof data === "string") {
    const urlMatch = data.match(/(https?:\/\/[^\s]+)/g)
    if (urlMatch && urlMatch[0]) {
      console.log(`✅ Found URL via regex: ${urlMatch[0]}`)
      return urlMatch[0]
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting image enhancement request")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const settingsStr = formData.get("settings") as string

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ success: false, error: "Replicate API token not configured" }, { status: 500 })
    }

    let settings
    try {
      settings = JSON.parse(settingsStr || "{}")
    } catch {
      settings = {}
    }

    console.log("📋 Enhancement settings:", settings)
    console.log("📁 File info:", { name: file.name, size: file.size, type: file.type })

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log(`📷 Converted file to base64, size: ${Math.round(base64.length / 1024)}KB`)

    // Get model configuration
    const modelId = settings.model || "clarity-upscaler"
    const modelConfigs: Record<string, any> = {
      "clarity-upscaler": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor || 2,
          face_enhance: true,
          codeformer_fidelity: 0.7,
          background_enhance: true,
          only_center_face: false,
        },
      },
      "clarity-upscaler-no-face": {
        model: "philz1337x/clarity-upscaler",
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor || 2,
          face_enhance: false,
          codeformer_fidelity: 0.0,
          background_enhance: true,
          only_center_face: false,
        },
      },
      "real-esrgan-4x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor || 4,
        },
      },
      "real-esrgan-2x": {
        model: "nightmareai/real-esrgan",
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        input: {
          image: dataUrl,
          scale: Math.min(settings.upscaleFactor || 2, 2),
        },
      },
      "gfpgan-face": {
        model: "tencentarc/gfpgan",
        version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        input: {
          img: dataUrl,
          version: "v1.4",
          scale: settings.upscaleFactor || 2,
        },
      },
      "codeformer-face": {
        model: "sczhou/codeformer",
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        input: {
          image: dataUrl,
          upscale: settings.upscaleFactor || 2,
          face_upsample: true,
          background_enhance: true,
          codeformer_fidelity: 0.5,
        },
      },
    }

    const config = modelConfigs[modelId]
    if (!config) {
      return NextResponse.json({ success: false, error: `Unknown model: ${modelId}` }, { status: 400 })
    }

    console.log(`🤖 Using model: ${config.model}`)
    console.log("⚙️ Model input keys:", Object.keys(config.input))

    const startTime = Date.now()

    // Call Replicate API directly using fetch
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Replicate API error:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Replicate API error: ${response.status}`,
          details: errorText,
          step: "api_call",
        },
        { status: response.status },
      )
    }

    const prediction = await response.json()
    console.log("📤 Initial prediction response:", prediction)

    // Poll for completion
    let result = prediction
    const maxAttempts = 60 // 5 minutes max
    let attempts = 0

    while (result.status === "starting" || result.status === "processing") {
      if (attempts >= maxAttempts) {
        return NextResponse.json(
          {
            success: false,
            error: "Processing timeout after 5 minutes",
            predictionId: result.id,
            step: "timeout",
          },
          { status: 408 },
        )
      }

      console.log(`⏳ Polling attempt ${attempts + 1}, status: ${result.status}`)
      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      })

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text()
        console.error("❌ Polling error:", errorText)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to poll prediction status",
            details: errorText,
            step: "polling",
          },
          { status: 500 },
        )
      }

      result = await pollResponse.json()
      attempts++
    }

    const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`
    console.log(`⏱️ Processing completed in: ${processingTime}`)
    console.log("📤 Final prediction result:", result)

    if (result.status === "failed") {
      console.error("❌ Prediction failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Processing failed",
          details: result.logs || "No additional details",
          predictionId: result.id,
          step: "model_processing",
        },
        { status: 500 },
      )
    }

    if (result.status === "succeeded" && result.output) {
      console.log("🎯 Model output received:", result.output)

      // Find download URL using enhanced strategy
      const downloadUrl = findUrlInData(result.output)

      if (!downloadUrl) {
        console.error("❌ No valid download URL found in model output:", result.output)
        return NextResponse.json(
          {
            success: false,
            error: "No valid download URL found in model output",
            details: "The AI model completed processing but didn't return a downloadable image URL",
            rawOutput: result.output,
            predictionId: result.id,
            step: "url_extraction",
          },
          { status: 500 },
        )
      }

      console.log(`✅ Successfully extracted download URL: ${downloadUrl}`)

      // Estimate file size (rough calculation)
      const estimatedSize = `${Math.round((file.size * (settings.upscaleFactor || 2) ** 2) / 1024)}KB`

      const finalResult = {
        success: true,
        downloadUrl,
        model: modelId,
        method: "replicate",
        processingTime,
        fileSize: estimatedSize,
        upscaleFactor: settings.upscaleFactor || 2,
        predictionId: result.id,
      }

      console.log("🎉 Enhancement completed successfully:", finalResult)
      return NextResponse.json(finalResult)
    }

    // Unexpected status
    console.error("❌ Unexpected result status:", result.status)
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected result status",
        details: `Status: ${result.status}`,
        predictionId: result.id,
        step: "unexpected_status",
      },
      { status: 500 },
    )
  } catch (error: any) {
    console.error("💥 Enhancement error:", error)

    let errorMessage = "Enhancement failed"
    const errorDetails = error.message || "Unknown error"
    let step = "unknown"

    if (error.message?.includes("authentication")) {
      errorMessage = "API authentication failed"
      step = "authentication"
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "Rate limit exceeded"
      step = "rate_limit"
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Request timed out"
      step = "timeout"
    } else if (error.message?.includes("file")) {
      errorMessage = "File processing error"
      step = "file_processing"
    } else if (error.name === "TypeError" && error.message?.includes("fetch")) {
      errorMessage = "Network connection failed"
      step = "network"
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
        step,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
