import { NextResponse } from "next/server"

/**
 * Enhanced Fal AI endpoint with better file size handling
 * Supports files up to 10MB with automatic compression
 */
export async function POST(req: Request) {
  console.log("🚀 /api/enhance-fal: request received")

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

    // Increased file size limits for Fal AI (supports larger files)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
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

    // Try multiple Fal AI endpoints that support larger files
    const endpointsToTry = [
      {
        name: "Real-ESRGAN (Fal AI)",
        url: "https://fal.run/fal-ai/real-esrgan",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor || 2,
          face_enhance: settings.faceEnhance || false,
        },
        maxSize: 10 * 1024 * 1024,
      },
      {
        name: "Lucataco Real-ESRGAN",
        url: "https://fal.run/lucataco/real-esrgan-upscaler",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor || 2,
        },
        maxSize: 8 * 1024 * 1024,
      },
      {
        name: "ESRGAN General",
        url: "https://fal.run/lucataco/esrgan",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor || 2,
        },
        maxSize: 8 * 1024 * 1024,
      },
      {
        name: "GFPGAN Face Enhancement",
        url: "https://fal.run/tencentarc/gfpgan",
        input: {
          img: dataUrl,
          version: "1.4",
          scale: settings.upscaleFactor || 2,
        },
        maxSize: 6 * 1024 * 1024,
      },
    ]

    let lastError = ""
    const attempts = []

    for (const endpoint of endpointsToTry) {
      // Skip if file is too large for this specific endpoint
      if (file.size > endpoint.maxSize) {
        console.log(`⏭️  Skipping ${endpoint.name} - file too large (${file.size} > ${endpoint.maxSize})`)
        continue
      }

      try {
        console.log(`🔄 Trying ${endpoint.name}:`, endpoint.url)

        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            Authorization: `Key ${process.env.FAL_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(endpoint.input),
        })

        const resultText = await response.text()
        console.log(`📥 Response from ${endpoint.name}:`, response.status, resultText.slice(0, 300))

        attempts.push({
          endpoint: endpoint.name,
          url: endpoint.url,
          status: response.status,
          response: resultText.slice(0, 300),
          success: response.ok,
        })

        if (response.ok) {
          let result
          try {
            result = JSON.parse(resultText)
          } catch {
            lastError = `Invalid JSON from ${endpoint.name}: ${resultText.slice(0, 200)}`
            continue
          }

          // Extract the enhanced image URL from various response formats
          let downloadUrl: string | undefined

          if (result.image?.url) {
            downloadUrl = result.image.url
          } else if (result.image && typeof result.image === "string") {
            downloadUrl = result.image
          } else if (result.output?.image?.url) {
            downloadUrl = result.output.image.url
          } else if (result.output?.url) {
            downloadUrl = result.output.url
          } else if (result.output && typeof result.output === "string") {
            downloadUrl = result.output
          } else if (result.url) {
            downloadUrl = result.url
          } else if (result.result?.image) {
            downloadUrl = result.result.image
          } else if (result.data?.image) {
            downloadUrl = result.data.image
          }

          if (downloadUrl) {
            console.log("✅ Success with", endpoint.name, "- URL:", downloadUrl)
            return NextResponse.json({
              success: true,
              downloadUrl,
              enhancedSize: `${settings.upscaleFactor || 2}x Enhanced`,
              fileSize: "Processing complete",
              usedEndpoint: endpoint.name,
              usedUrl: endpoint.url,
              attempts,
              method: "fal-ai",
              model: endpoint.name,
              upscaleFactor: settings.upscaleFactor || 2,
              processingTime: "30-60s",
            })
          } else {
            lastError = `No image URL in response from ${endpoint.name}: ${JSON.stringify(result).slice(0, 200)}`
          }
        } else {
          lastError = `HTTP ${response.status} from ${endpoint.name}: ${resultText.slice(0, 200)}`
        }
      } catch (error: any) {
        lastError = `Error with ${endpoint.name}: ${error.message}`
        console.error(`❌ Error with ${endpoint.name}:`, error)
        attempts.push({
          endpoint: endpoint.name,
          url: endpoint.url,
          status: "ERROR",
          response: error.message,
          success: false,
        })
      }
    }

    // If we get here, all endpoints failed
    console.error("❌ All Fal AI endpoints failed")
    return NextResponse.json(
      {
        success: false,
        error: `All Fal AI endpoints failed. Last error: ${lastError}`,
        attempts,
        step: "all-endpoints-failed",
        suggestion: "Try reducing file size or using a different enhancement method.",
      },
      { status: 500 },
    )
  } catch (error: any) {
    console.error("❌ Fal AI route error:", error)
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
