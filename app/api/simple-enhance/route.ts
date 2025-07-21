import { NextResponse } from "next/server"

/**
 * Simplified enhancement using known working Fal AI models
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
    const dataUrl = `data:${file.type};base64,${base64}`

    // Try known working models one by one
    const modelsToTry = [
      {
        name: "Background Removal (Test)",
        endpoint: "https://fal.run/fal-ai/rembg",
        input: { image_url: dataUrl },
      },
      {
        name: "Lucataco Remove BG",
        endpoint: "https://fal.run/lucataco/remove-bg",
        input: { image: dataUrl },
      },
      {
        name: "Real-ESRGAN Upscaler",
        endpoint: "https://fal.run/lucataco/real-esrgan-upscaler",
        input: { image: dataUrl, scale: settings.upscaleFactor },
      },
    ]

    for (const model of modelsToTry) {
      try {
        console.log(`Trying ${model.name}:`, model.endpoint)

        const response = await fetch(model.endpoint, {
          method: "POST",
          headers: {
            Authorization: `Key ${process.env.FAL_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(model.input),
        })

        const result = await response.text()
        console.log(`${model.name} response:`, response.status, result.slice(0, 300))

        if (response.ok) {
          try {
            const parsed = JSON.parse(result)
            const imageUrl = parsed.image?.url || parsed.image || parsed.output?.image || parsed.output

            return NextResponse.json({
              success: true,
              message: `${model.name} worked!`,
              downloadUrl: imageUrl,
              testResult: parsed,
              usedModel: model.name,
              endpoint: model.endpoint,
            })
          } catch {
            return NextResponse.json({
              success: true,
              message: `${model.name} responded but with unexpected format`,
              rawResponse: result.slice(0, 500),
              usedModel: model.name,
            })
          }
        } else {
          console.log(`${model.name} failed:`, response.status, result.slice(0, 200))
        }
      } catch (error) {
        console.error(`Error with ${model.name}:`, error)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "All test models failed",
        suggestion: "Check if your FAL_KEY is correct and has proper permissions",
      },
      { status: 500 },
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
