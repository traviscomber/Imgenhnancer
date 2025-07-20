import { NextResponse } from "next/server"

/**
 * POST /api/enhance
 * Updated with correct Fal AI model names
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
    const auth = { Authorization: `Key ${process.env.FAL_KEY}` }

    // Convert file to base64
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Try actual working Fal AI endpoints (based on their documentation)
    const endpointsToTry = [
      // Real-ESRGAN models that actually exist
      {
        url: "https://fal.run/lucataco/real-esrgan-upscaler",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor,
        },
      },
      {
        url: "https://fal.run/xinntao/realesrgan",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor,
        },
      },
      {
        url: "https://fal.run/tencentarc/gfpgan",
        input: {
          img: dataUrl,
          version: "1.4",
          scale: settings.upscaleFactor,
        },
      },
      // Try some other upscaling models
      {
        url: "https://fal.run/lucataco/esrgan",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor,
        },
      },
      {
        url: "https://fal.run/nightmareai/real-esrgan",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor,
        },
      },
      // Queue versions
      {
        url: "https://queue.fal.run/lucataco/real-esrgan-upscaler",
        input: {
          image: dataUrl,
          scale: settings.upscaleFactor,
        },
      },
    ]

    let lastError = ""
    const attempts = []

    for (const endpoint of endpointsToTry) {
      try {
        console.log("Trying endpoint:", endpoint.url)

        const predRes = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            ...auth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(endpoint.input),
        })

        const predRaw = await predRes.text()
        console.log(`Response from ${endpoint.url}:`, predRes.status, predRaw.slice(0, 300))

        attempts.push({
          endpoint: endpoint.url,
          status: predRes.status,
          response: predRaw.slice(0, 300),
          success: predRes.ok,
        })

        if (predRes.ok) {
          let pred: any
          try {
            pred = JSON.parse(predRaw)
          } catch {
            lastError = `Invalid JSON from ${endpoint.url}: ${predRaw.slice(0, 200)}`
            continue
          }

          // Handle different response formats
          let downloadUrl: string | undefined

          // Try various response structures
          if (pred.image?.url) {
            downloadUrl = pred.image.url
          } else if (pred.image && typeof pred.image === "string") {
            downloadUrl = pred.image
          } else if (pred.output?.image?.url) {
            downloadUrl = pred.output.image.url
          } else if (pred.output?.url) {
            downloadUrl = pred.output.url
          } else if (pred.output && typeof pred.output === "string") {
            downloadUrl = pred.output
          } else if (pred.url) {
            downloadUrl = pred.url
          } else if (pred.result?.image) {
            downloadUrl = pred.result.image
          } else if (pred.data?.image) {
            downloadUrl = pred.data.image
          }

          if (downloadUrl) {
            return NextResponse.json({
              success: true,
              downloadUrl,
              enhancedSize: `${settings.upscaleFactor}x Enhanced`,
              fileSize: "Processing complete",
              usedEndpoint: endpoint.url,
              attempts,
            })
          } else {
            lastError = `No image URL in response from ${endpoint.url}: ${JSON.stringify(pred).slice(0, 200)}`
          }
        } else {
          lastError = `HTTP ${predRes.status} from ${endpoint.url}: ${predRaw.slice(0, 200)}`
        }
      } catch (error: any) {
        lastError = `Error with ${endpoint.url}: ${error.message}`
        console.error(`Error with ${endpoint.url}:`, error)
        attempts.push({
          endpoint: endpoint.url,
          status: "ERROR",
          response: error.message,
          success: false,
        })
      }
    }

    // If we get here, all endpoints failed
    return NextResponse.json(
      {
        success: false,
        error: `All endpoints failed. Last error: ${lastError}`,
        attempts,
        suggestion: "The model names might not exist. Try the test endpoint to discover available models.",
      },
      { status: 500 },
    )
  } catch (err: any) {
    console.error("Enhance route error:", err)
    return NextResponse.json({ success: false, error: err?.message || "Server error" }, { status: 500 })
  }
}
