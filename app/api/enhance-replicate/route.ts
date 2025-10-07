import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY || "",
})

export async function POST(request: NextRequest) {
  try {
    // Check for API token
    const apiToken = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY
    if (!apiToken) {
      console.error("❌ No Replicate API token found")
      console.error("Checked variables:", {
        REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
        REPLICATE_API_KEY: !!process.env.REPLICATE_API_KEY,
      })
      return NextResponse.json(
        {
          success: false,
          error: "REPLICATE_API_TOKEN not configured. Please add it to your environment variables in Vercel.",
        },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null

    if (!imageFile) {
      console.error("❌ No file provided in request")
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    console.log("📥 Received file:", imageFile.name, `(${Math.round(imageFile.size / 1024)}KB)`)

    // Convert file to base64 data URL
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = imageFile.type || "image/jpeg"
    const dataUrl = `data:${mimeType};base64,${base64}`

    console.log("✅ Converted to data URL, size:", Math.round(dataUrl.length / 1024), "KB")

    // Extract settings from form data
    const model = (formData.get("model") as string) || "philz1337x/clarity-upscaler"
    const scaleFactor = Number.parseInt((formData.get("scale_factor") as string) || "2")
    const dynamic = Number.parseFloat((formData.get("dynamic") as string) || "0.35")
    const creativity = Number.parseFloat((formData.get("creativity") as string) || "0.35")
    const resemblance = Number.parseFloat((formData.get("resemblance") as string) || "0.75")
    const hdr = Number.parseFloat((formData.get("hdr") as string) || "0")
    const prompt = (formData.get("prompt") as string) || "professional photo, high quality"

    console.log("⚙️ Enhancement settings:", {
      model,
      scaleFactor,
      dynamic,
      creativity,
      resemblance,
      hdr,
      prompt,
    })

    const startTime = Date.now()

    // Run Clarity Upscaler with ASEAN-optimized settings
    console.log("🚀 Starting Replicate prediction...")
    const output = await replicate.run(model as `${string}/${string}`, {
      input: {
        image: dataUrl,
        scale_factor: scaleFactor,
        dynamic: dynamic,
        creativity: creativity,
        resemblance: resemblance,
        hdr: hdr,
        prompt: prompt,
        sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
        scheduler: "DPM++ 3M SDE Karras",
        num_inference_steps: 18,
        downscaling: false,
        downscaling_resolution: 768,
        lora_links: "",
        custom_sd_model: "",
        sharpen: 0,
        mask: null,
        handfix: "disabled",
        pattern: false,
        output_format: "png",
      },
    })

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`✅ Enhancement completed in ${processingTime}s`)
    console.log("📤 Output URL:", output)

    return NextResponse.json({
      success: true,
      output: output,
      processingTime: `${processingTime}s`,
      model: model,
      settings: {
        scaleFactor,
        dynamic,
        creativity,
        resemblance,
        hdr,
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

export const config = {
  api: {
    bodyParser: false,
  },
}
