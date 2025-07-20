import { NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless"

/**
 * Proper image enhancement using Fal AI SDK
 */
export async function POST(req: Request) {
  try {
    // Configure Fal AI
    fal.config({
      credentials: process.env.FAL_KEY,
    })

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const settingsJSON = formData.get("settings") as string | null

    if (!file || !settingsJSON) {
      return NextResponse.json({ success: false, error: "Missing file or settings" }, { status: 400 })
    }

    const settings = JSON.parse(settingsJSON)

    // Convert file to base64 data URL
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString("base64")
    const mimeType = file.type || "image/jpeg"
    const dataUrl = `data:${mimeType};base64,${base64}`

    console.log("🚀 Starting Fal AI enhancement...")
    console.log("Settings:", settings)

    // Map our internal model IDs to actual Fal AI model IDs
    const modelMapping = {
      "real-esrgan-4x": "fal-ai/real-esrgan",
      "real-esrgan-anime": "xinntao/realesrgan",
      "esrgan-general": "lucataco/real-esrgan-upscaler",
      "supir-v0q": "fal-ai/supir",
      waifu2x: "fal-ai/waifu2x",
    }

    const falModelId = modelMapping[settings.model] || "fal-ai/real-esrgan"

    console.log(`Using Fal AI model: ${falModelId}`)

    // Prepare input based on model type
    const input = {
      image_url: dataUrl,
      scale: settings.upscaleFactor || 2,
    }

    // Add model-specific parameters
    if (falModelId.includes("gfpgan") || settings.faceEnhance) {
      input.face_enhance = true
    }

    if (settings.denoise) {
      input.denoise = true
    }

    console.log("Input prepared:", { ...input, image_url: "data:image/..." })

    // Try fal.subscribe first (for queue-based models)
    try {
      console.log("Trying fal.subscribe...")

      const result = await fal.subscribe(falModelId, {
        input,
        logs: true,
        onQueueUpdate: (update) => {
          console.log("Queue update:", update.status)
        },
      })

      console.log("✅ fal.subscribe succeeded")
      console.log("Result keys:", Object.keys(result))

      // Extract image URL from result
      let imageUrl = null
      if (result.image?.url) {
        imageUrl = result.image.url
      } else if (result.image) {
        imageUrl = result.image
      } else if (result.output?.url) {
        imageUrl = result.output.url
      } else if (result.output) {
        imageUrl = result.output
      } else if (result.url) {
        imageUrl = result.url
      }

      if (imageUrl) {
        return NextResponse.json({
          success: true,
          downloadUrl: imageUrl,
          enhancedSize: `${settings.upscaleFactor}x Enhanced`,
          fileSize: "Processing complete",
          model: falModelId,
          method: "fal.subscribe",
          result: result,
        })
      } else {
        console.log("No image URL found in result:", result)
        throw new Error("No image URL in result")
      }
    } catch (subscribeError) {
      console.log("❌ fal.subscribe failed:", subscribeError.message)

      // Try fal.run as fallback
      try {
        console.log("Trying fal.run as fallback...")

        const result = await fal.run(falModelId, { input })

        console.log("✅ fal.run succeeded")

        // Extract image URL from result
        let imageUrl = null
        if (result.image?.url) {
          imageUrl = result.image.url
        } else if (result.image) {
          imageUrl = result.image
        } else if (result.output?.url) {
          imageUrl = result.output.url
        } else if (result.output) {
          imageUrl = result.output
        } else if (result.url) {
          imageUrl = result.url
        }

        if (imageUrl) {
          return NextResponse.json({
            success: true,
            downloadUrl: imageUrl,
            enhancedSize: `${settings.upscaleFactor}x Enhanced`,
            fileSize: "Processing complete",
            model: falModelId,
            method: "fal.run",
            result: result,
          })
        } else {
          throw new Error("No image URL in fal.run result")
        }
      } catch (runError) {
        console.log("❌ fal.run also failed:", runError.message)

        return NextResponse.json(
          {
            success: false,
            error: `Both fal.subscribe and fal.run failed. Subscribe error: ${subscribeError.message}. Run error: ${runError.message}`,
            model: falModelId,
            troubleshooting: {
              subscribeError: subscribeError.message,
              runError: runError.message,
              suggestion: "The model might not exist or your FAL_KEY might not have access to it",
            },
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("Enhancement error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        suggestion: "Check your FAL_KEY configuration and model availability",
      },
      { status: 500 },
    )
  }
}
