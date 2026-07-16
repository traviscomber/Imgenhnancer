import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { checkFreeUpscaleAvailability, useFreeUpscale } from "@/lib/free-upscale"
import { GLOBAL_RESTORATION_PROMPT } from "@/lib/presets"

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
    const userId = formData.get("user_id") as string

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
    // Replicate clarity-upscaler real ranges (confirmed from API schema):
    //   creativity: 0–1    (0 = max fidelity, default 0.35)
    //   resemblance: 0–3   (3 = max locked to original, default 0.6)
    //   dynamic: 1–50      (1 = minimal hallucination, default 6)
    const scaleFactor = Number.parseInt(formData.get("scale_factor") as string) || 2
    const creativityRaw = formData.get("creativity")
    const creativity = creativityRaw !== null && creativityRaw !== "" ? Number.parseFloat(creativityRaw as string) : 0
    const resemblanceRaw = formData.get("resemblance")
    const resemblance = resemblanceRaw !== null && resemblanceRaw !== "" ? Number.parseFloat(resemblanceRaw as string) : 3
    const dynamic = Number.parseInt(formData.get("dynamic") as string) || 1
    const hdr = Number.parseFloat(formData.get("hdr") as string) || 0
    const tilingWidth = Number.parseInt(formData.get("tiling_width") as string) || 112
    const tilingHeight = Number.parseInt(formData.get("tiling_height") as string) || 144
    // Layer 3: preset-specific prompt from client
    const presetPrompt = formData.get("prompt") as string | null

    // Check if using free upscale
    let usedFreeUpscale = false
    let freeUpscaleType: "initial" | "monthly" | null = null

    if (userId) {
      const freeStatus = await checkFreeUpscaleAvailability(userId)

      if (freeStatus.available) {
        usedFreeUpscale = true
        freeUpscaleType = freeStatus.type

        // Deduct free upscale
        const useResult = await useFreeUpscale(userId, freeStatus.type)
        if (!useResult.success) {
          console.warn("Failed to deduct free upscale:", useResult.error)
        } else {
          console.log(`✅ Free upscale used (${freeStatus.type}), remaining: ${useResult.remaining}`)
        }
      } else if (freeStatus.nextResetDate) {
        console.log(`⏰ No free upscales available. Next reset: ${freeStatus.nextResetDate.toISOString()}`)
      }
    }

    const validScaleFactor = Math.max(1, Math.min(4, scaleFactor))
    // IMPORTANT: creativity MUST be >= 0.1. A value of 0 crashes the DPM++ 3M SDE
    // sampler with "local variable 'h' referenced before assignment". 0.1 is the
    // lowest safe value and still gives maximum-fidelity, near-zero-hallucination results.
    const validCreativity = Math.max(0.1, Math.min(1, creativity))
    const validResemblance = Math.max(0, Math.min(3, resemblance))
    const validDynamic = Math.max(1, Math.min(50, dynamic))
    const validHdr = Math.max(0, Math.min(1, hdr))
    const validTilingWidth = Math.max(16, Math.min(256, Math.round(tilingWidth / 16) * 16))
    const validTilingHeight = Math.max(16, Math.min(256, Math.round(tilingHeight / 16) * 16))

    // 4-layer prompt assembly:
    // Layer 1: Clarity API params (above)
    // Layer 2: Global Restoration Prompt (universal ASEAN restoration philosophy)
    // Layer 3: Preset-specific prompt (what client sends as "prompt")
    // Layer 4: Required LoRA tags — the model's internal code expects these to be present
    //          in the prompt string. Omitting them causes "local variable referenced before
    //          assignment" errors in Replicate's Python runner.
    const LORA_TAGS = "<lora:more_details:0.5> <lora:SDXLrender_v2.0:1>"
    const basePrompt = presetPrompt
      ? `${GLOBAL_RESTORATION_PROMPT} ${presetPrompt}`
      : GLOBAL_RESTORATION_PROMPT
    const finalPrompt = `${basePrompt} ${LORA_TAGS}`

    console.log("⚙️ Enhancement settings:", {
      scaleFactor: validScaleFactor,
      creativity: validCreativity,
      resemblance: validResemblance,
      dynamic: validDynamic,
      hdr: validHdr,
      tilingWidth: validTilingWidth,
      tilingHeight: validTilingHeight,
      promptLength: finalPrompt.length,
      usedFreeUpscale,
      freeUpscaleType,
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
            // Layer 2 + Layer 3 combined prompt (Global Restoration + Preset-specific)
            prompt: finalPrompt,
            negative_prompt: "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
            scale_factor: validScaleFactor,
            dynamic: validDynamic,
            creativity: validCreativity,
            resemblance: validResemblance,
            tiling_width: validTilingWidth,
            tiling_height: validTilingHeight,
            sharpen: 0,
            sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
            scheduler: "DPM++ 3M SDE Karras",
            num_inference_steps: 18,
            downscaling: false,
            output_format: "png",
          },
      }),
    })

    const responseText = await createResponse.text()
    console.log("📥 Response status:", createResponse.status)
    console.log("📥 Response text (first 200 chars):", responseText.substring(0, 200))

    if (!createResponse.ok) {
      let errorMessage = `Failed to create prediction: ${createResponse.status}`

      // Try to parse as JSON
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.detail || errorData.error || errorMessage
        console.error("❌ API error (JSON):", errorData)
      } catch {
        // Not JSON, use the text directly
        errorMessage = responseText || errorMessage
        console.error("❌ API error (text):", responseText)
      }

      throw new Error(errorMessage)
    }

    // Parse successful response as JSON
    let prediction: any
    try {
      prediction = JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Failed to parse successful response as JSON:", responseText)
      throw new Error("Invalid response from Replicate API")
    }

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

      const statusText = await statusResponse.text()

      if (!statusResponse.ok) {
        let errorMessage = `Failed to get prediction status: ${statusResponse.status}`

        try {
          const errorData = JSON.parse(statusText)
          errorMessage = errorData.detail || errorData.error || errorMessage
        } catch {
          errorMessage = statusText || errorMessage
        }

        throw new Error(errorMessage)
      }

      try {
        finalPrediction = JSON.parse(statusText)
      } catch (parseError) {
        console.error("❌ Failed to parse status response as JSON:", statusText)
        throw new Error("Invalid status response from Replicate API")
      }

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
      isFreeUpscaleUsed: usedFreeUpscale,
      settings: {
        scaleFactor: validScaleFactor,
        creativity: validCreativity,
        resemblance: validResemblance,
        dynamic: validDynamic,
        hdr: validHdr,
        tilingWidth: validTilingWidth,
        tilingHeight: validTilingHeight,
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
