import { NextResponse } from "next/server"

/**
 * Alternative approach using Fal's REST API with proper endpoints
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const settingsJSON = formData.get("settings") as string | null

    if (!file || !settingsJSON) {
      return NextResponse.json({ success: false, error: "Missing file or settings" }, { status: 400 })
    }

    const settings = JSON.parse(settingsJSON)

    // Convert file to base64
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString("base64")
    const mimeType = file.type || "image/jpeg"
    const dataUrl = `data:${mimeType};base64,${base64}`

    // Use fal.ai's REST API directly
    const response = await fetch("https://fal.run/fal-ai/real-esrgan", {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: dataUrl,
        scale: settings.upscaleFactor,
        face_enhance: settings.faceEnhance,
      }),
    })

    const result = await response.text()
    console.log("Fal response:", result.slice(0, 500))

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Fal API error: ${response.status} - ${result}`,
        },
        { status: 500 },
      )
    }

    let parsedResult
    try {
      parsedResult = JSON.parse(result)
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid response format: ${result.slice(0, 200)}`,
        },
        { status: 500 },
      )
    }

    // Extract the enhanced image URL
    const imageUrl =
      parsedResult.image?.url || parsedResult.image || parsedResult.output?.image?.url || parsedResult.output

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: `No image URL in response: ${JSON.stringify(parsedResult).slice(0, 200)}`,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      downloadUrl: imageUrl,
      enhancedSize: `${settings.upscaleFactor}x Enhanced`,
      fileSize: "Processing complete",
    })
  } catch (error: any) {
    console.error("Enhancement error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Server error",
      },
      { status: 500 },
    )
  }
}
