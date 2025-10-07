import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Enhancement request received")

    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("❌ REPLICATE_API_TOKEN not configured")
      return NextResponse.json(
        { success: false, error: "REPLICATE_API_TOKEN not configured in environment variables" },
        { status: 500 },
      )
    }

    // Parse form data
    const formData = await req.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      console.error("❌ No image file provided")
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 })
    }

    console.log("📦 Image file received:", {
      name: imageFile.name,
      type: imageFile.type,
      size: `${Math.round(imageFile.size / 1024)}KB`,
    })

    // Get settings from form data
    const scaleFactor = Number.parseInt(formData.get("scale_factor") as string) || 2
    const creativity = Number.parseFloat(formData.get("creativity") as string) || 0.35
    const resemblance = Number.parseFloat(formData.get("resemblance") as string) || 0.75
    const hdr = Number.parseFloat(formData.get("hdr") as string) || 0
    const prompt = formData.get("prompt") as string | null

    // Creativity 0.35 → dynamic 2 (optimal for faces)
    const dynamicSteps = Math.max(1, Math.round(creativity * 6))

    console.log("⚙️ Enhancement settings:", {
      scaleFactor,
      creativity,
      resemblance,
      hdr,
      dynamicSteps,
      prompt,
    })

    // Convert File to base64 data URL
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = imageFile.type || "image/jpeg"
    const dataUrl = `data:${mimeType};base64,${base64}`

    console.log("🔄 Converted image to data URL, size:", `${Math.round(base64.length / 1024)}KB`)

    // Create prediction using Replicate REST API directly
    const startTime = Date.now()

    console.log("📤 Creating Replicate prediction...")

    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        input: {
          image: dataUrl,
          scale_factor: scaleFactor,
          dynamic: dynamicSteps,
          creativity: creativity,
          resemblance: resemblance,
          hdr: hdr,
          sharpen: 0,
          sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
          scheduler: "DPM++ 3M SDE Karras",
          num_inference_steps: 18,
          downscaling: false,
          output_format: "png",
          ...(prompt && { prompt }),
        },
      }),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error("❌ Failed to create prediction:", createResponse.status, errorText)
      throw new Error(`Failed to create prediction: ${createResponse.status}`)
    }

    const prediction = await createResponse.json()
    console.log("✅ Prediction created:", prediction.id)

    // Poll for completion
    let finalPrediction = prediction
    const maxAttempts = 120 // 10 minutes max (5 second intervals)
    let attempts = 0

    while (finalPrediction.status !== "succeeded" && finalPrediction.status !== "failed") {
      if (attempts >= maxAttempts) {
        throw new Error("Prediction timed out after 10 minutes")
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Failed to get prediction status: ${statusResponse.status}`)
      }

      finalPrediction = await statusResponse.json()
      console.log(`🔄 Status: ${finalPrediction.status} (attempt ${attempts + 1}/${maxAttempts})`)

      attempts++
    }

    if (finalPrediction.status === "failed") {
      console.error("❌ Prediction failed:", finalPrediction.error)
      throw new Error(finalPrediction.error || "Prediction failed")
    }

    const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`

    console.log("✅ Enhancement complete:", {
      processingTime,
      outputType: typeof finalPrediction.output,
    })

    // Handle output (could be string or string[])
    let enhancedUrl: string
    if (Array.isArray(finalPrediction.output)) {
      enhancedUrl = finalPrediction.output[0]
    } else if (typeof finalPrediction.output === "string") {
      enhancedUrl = finalPrediction.output
    } else {
      throw new Error(`Unexpected output type: ${typeof finalPrediction.output}`)
    }

    console.log("🎨 Enhanced image URL:", enhancedUrl)

    return NextResponse.json({
      success: true,
      output: enhancedUrl,
      processingTime,
      model: "clarity-upscaler",
      predictionId: prediction.id,
      settings: {
        scaleFactor,
        creativity,
        resemblance,
        hdr,
        dynamicSteps,
        prompt,
      },
    })
  } catch (error: any) {
    console.error("❌ Enhancement error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Enhancement failed",
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}
