import { NextResponse } from "next/server"

/**
 * Enhanced V2 approach using Fal's REST API with improved file handling
 * Supports larger files up to 12MB
 */
export async function POST(req: Request) {
  console.log("🚀 /api/enhance-v2: request received")

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const settingsJSON = formData.get("settings") as string | null

    if (!file || !settingsJSON) {
      return NextResponse.json({ success: false, error: "Missing file or settings" }, { status: 400 })
    }

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { success: false, error: "FAL_KEY environment variable not configured" },
        { status: 500 },
      )
    }

    const settings = JSON.parse(settingsJSON)
    console.log("📋 Settings:", settings)
    console.log("📁 File:", { name: file.name, size: file.size, type: file.type })

    // Higher file size limit for V2 endpoint
    const MAX_FILE_SIZE = 12 * 1024 * 1024 // 12MB

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large for V2 endpoint. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
          step: "file-size-check",
        },
        { status: 413 },
      )
    }

    // Convert file to base64
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString("base64")
    const mimeType = file.type || "image/jpeg"
    const dataUrl = `data:${mimeType};base64,${base64}`

    console.log(`📊 Base64 size: ${Math.round(dataUrl.length / 1024)}KB`)

    // Use fal.ai's REST API directly with optimized settings
    const apiUrl = "https://fal.run/fal-ai/real-esrgan"
    const payload = {
      image: dataUrl,
      scale: Math.min(settings.upscaleFactor || 2, 4), // Cap at 4x to prevent timeouts
      face_enhance: settings.faceEnhance || false,
    }

    console.log("📡 Sending to Fal AI:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const result = await response.text()
    console.log("📥 Fal response status:", response.status)
    console.log("📥 Fal response preview:", result.slice(0, 500))

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Fal AI API error: ${response.status} - ${result}`,
          step: "fal-api-error",
          details: {
            status: response.status,
            statusText: response.statusText,
            response: result.slice(0, 300),
          },
        },
        { status: response.status },
      )
    }

    let parsedResult
    try {
      parsedResult = JSON.parse(result)
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid JSON response from Fal AI: ${result.slice(0, 200)}`,
          step: "json-parse-error",
        },
        { status: 500 },
      )
    }

    // Extract the enhanced image URL with multiple fallbacks
    const imageUrl =
      parsedResult.image?.url ||
      parsedResult.image ||
      parsedResult.output?.image?.url ||
      parsedResult.output?.url ||
      parsedResult.output ||
      parsedResult.url ||
      parsedResult.result?.image ||
      parsedResult.data?.image

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: `No image URL found in Fal AI response`,
          step: "url-extraction-error",
          details: {
            responseKeys: Object.keys(parsedResult),
            response: JSON.stringify(parsedResult).slice(0, 300),
          },
        },
        { status: 500 },
      )
    }

    console.log("✅ Enhancement successful, URL:", imageUrl)

    return NextResponse.json({
      success: true,
      downloadUrl: imageUrl,
      enhancedSize: `${settings.upscaleFactor || 2}x Enhanced`,
      fileSize: `Original: ${Math.round(file.size / 1024)}KB`,
      method: "fal-ai-v2",
      model: "real-esrgan",
      upscaleFactor: settings.upscaleFactor || 2,
      processingTime: "45-90s",
      apiEndpoint: apiUrl,
      originalFileSize: file.size,
      base64Size: dataUrl.length,
    })
  } catch (error: any) {
    console.error("❌ Enhancement V2 error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Server error",
        step: "server-error",
        details: {
          name: error.name,
          stack: error.stack?.slice(0, 500),
        },
      },
      { status: 500 },
    )
  }
}
