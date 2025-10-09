import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] [FACE-SWAP] Starting face swap...")

    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("[v0] [FACE-SWAP] REPLICATE_API_TOKEN not configured")
      return NextResponse.json({ success: false, error: "REPLICATE_API_TOKEN not configured" }, { status: 500 })
    }

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

    console.log("[v0] [FACE-SWAP] Creating Replicate prediction...")
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "c2d783366e8d32e6e82c40682fab6b4c23b9c6eff2692c0cf7585fc16c238cfe", // yan-ops/face_swap model
        input: {
          swap_image: sourceBase64, // User's face
          target_image: targetImageUrl, // Generated avatar
        },
      }),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error("[v0] [FACE-SWAP] Failed to create prediction:", errorText)
      throw new Error(`Failed to create face-swap prediction: ${createResponse.status}`)
    }

    const prediction = await createResponse.json()
    console.log("[v0] [FACE-SWAP] Prediction created:", prediction.id)

    // Poll for completion
    let finalPrediction = prediction
    const maxAttempts = 60 // 5 minutes max
    let attempts = 0

    while (finalPrediction.status !== "succeeded" && finalPrediction.status !== "failed") {
      if (attempts >= maxAttempts) {
        throw new Error("Face swap timed out after 5 minutes")
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
      console.log(`[v0] [FACE-SWAP] Status: ${finalPrediction.status} (attempt ${attempts + 1}/${maxAttempts})`)
      attempts++
    }

    if (finalPrediction.status === "failed") {
      console.error("[v0] [FACE-SWAP] Prediction failed:", finalPrediction.error)
      throw new Error(finalPrediction.error || "Face swap failed")
    }

    console.log("[v0] [FACE-SWAP] Output type:", typeof finalPrediction.output)
    console.log("[v0] [FACE-SWAP] Output value:", JSON.stringify(finalPrediction.output))
    console.log("[v0] [FACE-SWAP] Full prediction:", JSON.stringify(finalPrediction, null, 2))

    if (!finalPrediction.output || finalPrediction.output === null) {
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
    if (Array.isArray(finalPrediction.output)) {
      // Output is an array of URLs
      outputUrl = finalPrediction.output[0]
    } else if (typeof finalPrediction.output === "string") {
      // Output is a direct URL string
      outputUrl = finalPrediction.output
    } else if (typeof finalPrediction.output === "object") {
      if (finalPrediction.output.url) {
        outputUrl = finalPrediction.output.url
      } else if (finalPrediction.output.image) {
        outputUrl = finalPrediction.output.image
      } else if (finalPrediction.output.output) {
        outputUrl = finalPrediction.output.output
      } else {
        // If it's an object but we can't find a URL, use original as fallback
        console.warn("[v0] [FACE-SWAP] Unknown object structure, using original target image")
        console.error("[v0] [FACE-SWAP] Object keys:", Object.keys(finalPrediction.output).join(", "))
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
        message: `Unexpected output type: ${typeof finalPrediction.output}`,
      })
    }

    console.log("[v0] [FACE-SWAP] Face swap complete!")

    return NextResponse.json({
      success: true,
      output: outputUrl,
    })
  } catch (error: any) {
    console.error("[v0] [FACE-SWAP] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Face swap failed",
      },
      { status: 500 },
    )
  }
}
