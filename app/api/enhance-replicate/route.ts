import { type NextRequest, NextResponse } from "next/server"
import { processImageForAPI } from "@/utils/image-processing"

export async function POST(request: NextRequest) {
  console.log("🚀 Starting enhance-replicate API call")

  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get("image") as File
    const model = (formData.get("model") as string) || "nightmareai/real-esrgan"
    const scale = Number.parseInt(formData.get("scale") as string) || 2

    console.log("📝 Request details:", {
      fileName: file?.name,
      fileSize: file?.size,
      model,
      scale,
      fileType: file?.type,
    })

    if (!file) {
      console.error("❌ No file provided")
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Check file size (50MB limit)
    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
    if (file.size > MAX_FILE_SIZE) {
      console.error("❌ File too large:", file.size)
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 },
      )
    }

    // Process image to ensure it's within API limits
    console.log("🔄 Processing image for API compatibility...")
    const processedImageData = await processImageForAPI(file)

    console.log("✅ Image processed:", {
      originalSize: file.size,
      processedSize: processedImageData.length,
      compressionRatio: (((file.size - processedImageData.length) / file.size) * 100).toFixed(1) + "%",
    })

    // Check if we have Replicate token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ Missing REPLICATE_API_TOKEN")
      return NextResponse.json({ error: "Replicate API token not configured" }, { status: 500 })
    }

    // Convert processed image to base64 data URL
    const base64Image = `data:${file.type};base64,${Buffer.from(processedImageData).toString("base64")}`

    console.log("🔄 Calling Replicate API...")

    // Call Replicate API
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: getModelVersion(model),
        input: {
          image: base64Image,
          scale: scale,
        },
      }),
    })

    console.log("📡 Replicate response status:", replicateResponse.status)
    console.log("📡 Replicate response headers:", Object.fromEntries(replicateResponse.headers.entries()))

    // Check if response is HTML (error page)
    const contentType = replicateResponse.headers.get("content-type") || ""
    const responseText = await replicateResponse.text()

    console.log("📄 Response preview:", responseText.substring(0, 200))

    if (contentType.includes("text/html") || responseText.trim().startsWith("<")) {
      console.error("❌ Received HTML error page instead of JSON")
      console.error("📄 HTML content:", responseText.substring(0, 500))

      // Try to extract error message from HTML
      let errorMessage = "Server returned an error page"
      const titleMatch = responseText.match(/<title>(.*?)<\/title>/i)
      if (titleMatch) {
        errorMessage = titleMatch[1]
      }

      return NextResponse.json(
        {
          error: `API Error: ${errorMessage}`,
          details:
            "The server returned an HTML error page instead of JSON. This usually indicates a server-side issue or configuration problem.",
          status: replicateResponse.status,
        },
        { status: replicateResponse.status || 500 },
      )
    }

    // Handle specific HTTP error codes
    if (!replicateResponse.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Failed to parse error response as JSON:", parseError)
        return NextResponse.json(
          {
            error: `HTTP ${replicateResponse.status}: ${replicateResponse.statusText}`,
            details: responseText.substring(0, 500),
            status: replicateResponse.status,
          },
          { status: replicateResponse.status },
        )
      }

      console.error("❌ Replicate API error:", errorData)

      // Handle specific error codes
      if (replicateResponse.status === 413) {
        return NextResponse.json(
          {
            error: "Image too large for processing",
            details: "The processed image is still too large for the API. Try using a smaller image or lower quality.",
            status: 413,
          },
          { status: 413 },
        )
      } else if (replicateResponse.status === 422) {
        return NextResponse.json(
          {
            error: "Invalid input parameters",
            details: errorData.detail || "The provided parameters are not valid for this model.",
            status: 422,
          },
          { status: 422 },
        )
      } else if (replicateResponse.status === 502 || replicateResponse.status === 504) {
        return NextResponse.json(
          {
            error: "Service temporarily unavailable",
            details: "The AI service is currently experiencing issues. Please try again in a few minutes.",
            status: replicateResponse.status,
          },
          { status: replicateResponse.status },
        )
      }

      return NextResponse.json(
        {
          error: errorData.detail || "Unknown API error",
          details: JSON.stringify(errorData),
          status: replicateResponse.status,
        },
        { status: replicateResponse.status },
      )
    }

    // Parse successful response
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Failed to parse successful response as JSON:", parseError)
      return NextResponse.json(
        {
          error: "Invalid JSON response from API",
          details: "The API returned a successful status but invalid JSON.",
          responsePreview: responseText.substring(0, 200),
        },
        { status: 500 },
      )
    }

    console.log("✅ Replicate prediction created:", responseData.id)

    // Poll for completion
    const predictionId = responseData.id
    let prediction = responseData
    let attempts = 0
    const maxAttempts = 180 // 15 minutes with 5-second intervals

    while (prediction.status === "starting" || prediction.status === "processing") {
      if (attempts >= maxAttempts) {
        console.error("❌ Prediction timed out after 15 minutes")
        return NextResponse.json(
          {
            error: "Processing timeout",
            details: "The image enhancement is taking longer than expected. Please try again with a smaller image.",
            predictionId,
          },
          { status: 408 },
        )
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds
      attempts++

      console.log(`🔄 Polling attempt ${attempts}/${maxAttempts} for prediction ${predictionId}`)

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      })

      if (!pollResponse.ok) {
        console.error("❌ Failed to poll prediction status:", pollResponse.status)
        const pollErrorText = await pollResponse.text()
        return NextResponse.json(
          {
            error: "Failed to check processing status",
            details: pollErrorText,
            predictionId,
          },
          { status: pollResponse.status },
        )
      }

      const pollText = await pollResponse.text()
      try {
        prediction = JSON.parse(pollText)
      } catch (parseError) {
        console.error("❌ Failed to parse polling response:", parseError)
        return NextResponse.json(
          {
            error: "Invalid polling response",
            details: "Failed to parse status check response.",
            predictionId,
          },
          { status: 500 },
        )
      }

      console.log(`📊 Prediction status: ${prediction.status}`)
    }

    if (prediction.status === "failed") {
      console.error("❌ Prediction failed:", prediction.error)
      return NextResponse.json(
        {
          error: "Image enhancement failed",
          details: prediction.error || "The AI model failed to process the image.",
          predictionId,
        },
        { status: 500 },
      )
    }

    if (prediction.status === "canceled") {
      console.error("❌ Prediction was canceled")
      return NextResponse.json(
        {
          error: "Processing was canceled",
          details: "The image enhancement was canceled by the service.",
          predictionId,
        },
        { status: 500 },
      )
    }

    if (!prediction.output || !prediction.output[0]) {
      console.error("❌ No output from prediction:", prediction)
      return NextResponse.json(
        {
          error: "No enhanced image generated",
          details: "The AI model completed but did not generate an output image.",
          predictionId,
        },
        { status: 500 },
      )
    }

    const enhancedImageUrl = prediction.output[0]
    console.log("✅ Enhancement completed:", enhancedImageUrl)

    return NextResponse.json({
      success: true,
      enhancedImageUrl,
      predictionId,
      model,
      scale,
      processingTime: `${attempts * 5} seconds`,
    })
  } catch (error) {
    console.error("❌ Unexpected error in enhance-replicate:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        return NextResponse.json(
          {
            error: "Network error",
            details: "Failed to connect to the AI service. Please check your internet connection and try again.",
            originalError: error.message,
          },
          { status: 503 },
        )
      }

      if (error.message.includes("JSON")) {
        return NextResponse.json(
          {
            error: "Data parsing error",
            details: "Failed to process the API response. This may be a temporary issue.",
            originalError: error.message,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: "An unexpected error occurred while processing your request.",
        originalError: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function getModelVersion(model: string): string {
  const modelVersions: Record<string, string> = {
    "nightmareai/real-esrgan": "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
    "tencentarc/gfpgan": "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
    "xinntao/realesrgan": "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
  }

  return modelVersions[model] || modelVersions["nightmareai/real-esrgan"]
}
