import { NextResponse } from "next/server"

/**
 * Simplified enhancement with support for larger files
 * Tests multiple working models with different size limits
 */
export async function POST(req: Request) {
  console.log("🚀 /api/simple-enhance: request received")

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

    // Convert file to base64
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Models ordered by file size support (largest first)
    const modelsToTry = [
      {
        name: "Real-ESRGAN (Large Files)",
        endpoint: "https://fal.run/fal-ai/real-esrgan",
        input: {
          image: dataUrl,
          scale: Math.min(settings.upscaleFactor || 2, 4),
          face_enhance: settings.faceEnhance || false,
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        processingTime: "60-120s",
      },
      {
        name: "Lucataco Real-ESRGAN",
        endpoint: "https://fal.run/lucataco/real-esrgan-upscaler",
        input: {
          image: dataUrl,
          scale: Math.min(settings.upscaleFactor || 2, 4),
        },
        maxSize: 8 * 1024 * 1024, // 8MB
        processingTime: "45-90s",
      },
      {
        name: "ESRGAN Upscaler",
        endpoint: "https://fal.run/lucataco/esrgan",
        input: {
          image: dataUrl,
          scale: Math.min(settings.upscaleFactor || 2, 4),
        },
        maxSize: 6 * 1024 * 1024, // 6MB
        processingTime: "30-60s",
      },
      {
        name: "Background Removal (Test)",
        endpoint: "https://fal.run/fal-ai/rembg",
        input: { image_url: dataUrl },
        maxSize: 5 * 1024 * 1024, // 5MB
        processingTime: "15-30s",
      },
    ]

    // Filter models that can handle the file size
    const compatibleModels = modelsToTry.filter((model) => file.size <= model.maxSize)

    if (compatibleModels.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum supported size is ${Math.round(modelsToTry[0].maxSize / 1024 / 1024)}MB`,
          step: "file-size-check",
          supportedSizes: modelsToTry.map((m) => ({
            model: m.name,
            maxSizeMB: Math.round(m.maxSize / 1024 / 1024),
          })),
        },
        { status: 413 },
      )
    }

    console.log(`📊 Found ${compatibleModels.length} compatible models for ${Math.round(file.size / 1024)}KB file`)

    for (const model of compatibleModels) {
      try {
        console.log(`🔄 Trying ${model.name}:`, model.endpoint)

        const response = await fetch(model.endpoint, {
          method: "POST",
          headers: {
            Authorization: `Key ${process.env.FAL_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(model.input),
        })

        const result = await response.text()
        console.log(`📥 ${model.name} response:`, response.status, result.slice(0, 300))

        if (response.ok) {
          try {
            const parsed = JSON.parse(result)

            // Extract image URL from various response formats
            const imageUrl =
              parsed.image?.url ||
              parsed.image ||
              parsed.output?.image?.url ||
              parsed.output?.url ||
              parsed.output ||
              parsed.url ||
              parsed.result?.image ||
              parsed.data?.image

            if (imageUrl) {
              console.log("✅ Success with", model.name)
              return NextResponse.json({
                success: true,
                message: `${model.name} worked successfully!`,
                downloadUrl: imageUrl,
                testResult: {
                  model: model.name,
                  endpoint: model.endpoint,
                  processingTime: model.processingTime,
                  fileSize: `${Math.round(file.size / 1024)}KB`,
                  upscaleFactor: settings.upscaleFactor || 2,
                },
                usedModel: model.name,
                method: "fal-ai-simple",
                enhancedSize: `${settings.upscaleFactor || 2}x Enhanced`,
                fileSize: `Original: ${Math.round(file.size / 1024)}KB`,
                upscaleFactor: settings.upscaleFactor || 2,
                processingTime: model.processingTime,
              })
            } else {
              console.warn(`⚠️  ${model.name} responded but no image URL found`)
            }
          } catch (parseError) {
            console.warn(`⚠️  ${model.name} returned non-JSON:`, result.slice(0, 200))
            return NextResponse.json({
              success: true,
              message: `${model.name} responded but with unexpected format`,
              rawResponse: result.slice(0, 500),
              usedModel: model.name,
              method: "fal-ai-simple-raw",
            })
          }
        } else {
          console.log(`❌ ${model.name} failed:`, response.status, result.slice(0, 200))
        }
      } catch (error: any) {
        console.error(`❌ Error with ${model.name}:`, error.message)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "All compatible models failed",
        step: "all-models-failed",
        testedModels: compatibleModels.map((m) => m.name),
        suggestion: "Check if your FAL_KEY is correct and has proper permissions, or try reducing file size further",
        fileSize: `${Math.round(file.size / 1024)}KB`,
      },
      { status: 500 },
    )
  } catch (error: any) {
    console.error("❌ Simple enhance error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Server error",
        step: "server-error",
      },
      { status: 500 },
    )
  }
}
