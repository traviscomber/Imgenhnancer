"use server"

interface FalResult {
  image: { url: string }
  [key: string]: unknown
}

/**
 * POSTs an image to Fal AI ESRGAN and returns the enhanced image URL.
 * Requires env var FAL_KEY to be set in Vercel project settings.
 */
export async function enhanceImageAction(file: File, settings: any) {
  try {
    // Convert the browser File into base64 so it can be sent as JSON
    const arrayBuffer = await file.arrayBuffer()
    const imageBase64 = Buffer.from(arrayBuffer).toString("base64")

    const body = {
      input: {
        // Fal AI ESRGAN accepts base64 via `image` key
        image: `data:${file.type};base64,${imageBase64}`,
        scale: settings.upscaleFactor,
        face_enhance: settings.faceEnhance,
        denoise: settings.denoise,
        sharpen: settings.sharpen,
      },
    }

    const res = await fetch("https://api.fal.ai/v1/run/fal-ai/esrgan", {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return { success: false, error: `Fal AI error: ${res.statusText}` }
    }

    const data: FalResult = await res.json()

    if (!data?.image?.url) {
      return { success: false, error: "Fal AI did not return an image URL." }
    }

    return {
      success: true,
      downloadUrl: data.image.url,
      // You can parse extra metadata from `data` if the model returns any
      enhancedSize: "N/A",
      fileSize: "N/A",
    }
  } catch (err: any) {
    console.error("Fal AI request failed:", err)
    return { success: false, error: err?.message || "Unknown error" }
  }
}
