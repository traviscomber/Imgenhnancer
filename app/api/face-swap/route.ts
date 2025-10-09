import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] [FACE-SWAP] Starting face swap...")

    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("[v0] [FACE-SWAP] REPLICATE_API_TOKEN not configured")
      return NextResponse.json({ success: false, error: "REPLICATE_API_TOKEN not configured" }, { status: 500 })
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    const formData = await request.formData()
    const sourceImage = formData.get("source") as File // User's face
    const targetImageUrl = formData.get("target") as string // Generated avatar URL

    if (!sourceImage || !targetImageUrl) {
      console.error("[v0] [FACE-SWAP] Missing source or target image")
      return NextResponse.json({ success: false, error: "Missing source or target image" }, { status: 400 })
    }

    console.log("[v0] [FACE-SWAP] Converting source image to base64...")
    const sourceBuffer = await sourceImage.arrayBuffer()
    const sourceBase64 = `data:${sourceImage.type};base64,${Buffer.from(sourceBuffer).toString("base64")}`

    console.log("[v0] [FACE-SWAP] Running easel/advanced-face-swap model...")
    const output = await replicate.run("easel/advanced-face-swap", {
      input: {
        source_image: sourceBase64, // User's face to swap
        target_image: targetImageUrl, // Generated avatar to swap face onto
      },
    })

    console.log("[v0] [FACE-SWAP] Output type:", typeof output)
    console.log("[v0] [FACE-SWAP] Output value:", JSON.stringify(output))

    if (!output || output === null) {
      console.warn("[v0] [FACE-SWAP] Model returned null output, using original target image as fallback")
      return NextResponse.json({
        success: true,
        output: targetImageUrl,
        fallback: true,
        message: "Face swap model returned no output, using original image",
      })
    }

    // Handle output - support multiple formats
    let outputUrl: string
    if (Array.isArray(output)) {
      outputUrl = output[0]
    } else if (typeof output === "string") {
      outputUrl = output
    } else if (typeof output === "object") {
      // Try common property names
      const obj = output as any
      if (obj.url) {
        outputUrl = obj.url
      } else if (obj.image) {
        outputUrl = obj.image
      } else if (obj.output) {
        outputUrl = obj.output
      } else {
        console.warn("[v0] [FACE-SWAP] Unknown object structure, using original target image")
        console.error("[v0] [FACE-SWAP] Object keys:", Object.keys(obj).join(", "))
        return NextResponse.json({
          success: true,
          output: targetImageUrl,
          fallback: true,
          message: "Could not extract URL from face-swap output",
        })
      }
    } else {
      console.warn("[v0] [FACE-SWAP] Unexpected output type, using original target image")
      return NextResponse.json({
        success: true,
        output: targetImageUrl,
        fallback: true,
        message: `Unexpected output type: ${typeof output}`,
      })
    }

    console.log("[v0] [FACE-SWAP] Face swap complete! Output URL:", outputUrl)

    return NextResponse.json({
      success: true,
      output: outputUrl,
    })
  } catch (error: any) {
    console.error("[v0] [FACE-SWAP] Error:", error)
    // Return original target image as fallback on error
    try {
      const formData = await request.formData()
      const targetImageUrl = formData.get("target") as string
      return NextResponse.json({
        success: true,
        output: targetImageUrl || "",
        fallback: true,
        error: error.message || "Face swap failed",
      })
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Face swap failed",
        },
        { status: 500 },
      )
    }
  }
}
