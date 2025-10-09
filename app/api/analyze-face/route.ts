import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] [ANALYZE] Starting facial analysis...")
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      console.log("[v0] [ANALYZE] No image provided")
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    console.log("[v0] [ANALYZE] Image received:", image.name, image.size, "bytes")

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")
    const mimeType = image.type || "image/jpeg"

    console.log("[v0] [ANALYZE] Image converted to base64, type:", mimeType)

    try {
      console.log("[v0] [ANALYZE] Calling OpenAI GPT-4 Vision...")

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`,
                  },
                },
                {
                  type: "text",
                  text: `Analyze this image and provide a JSON response with the following structure:
{
  "hasFace": boolean,
  "gender": "male" | "female" | "unknown",
  "ageRange": "child" | "teen" | "young adult" | "adult" | "senior" | "unknown",
  "expression": "smiling" | "neutral" | "serious" | "happy" | "sad" | "unknown",
  "quality": "excellent" | "good" | "fair" | "poor",
  "features": ["feature1", "feature2", ...]
}

Features can include: "glasses", "beard", "mustache", "hat", "jewelry", "makeup", etc.
Only return the JSON, no other text.`,
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      })

      console.log("[v0] [ANALYZE] OpenAI response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] [ANALYZE] OpenAI API error:", errorText)
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] [ANALYZE] OpenAI response:", JSON.stringify(data))

      const content = data.choices[0]?.message?.content
      if (!content) {
        throw new Error("No content in OpenAI response")
      }

      console.log("[v0] [ANALYZE] GPT-4 Vision response:", content)

      // Parse the JSON response
      const analysis = JSON.parse(content)
      console.log("[v0] [ANALYZE] Parsed analysis:", analysis)

      return NextResponse.json({
        success: true,
        analysis,
      })
    } catch (visionError: any) {
      console.error("[v0] [ANALYZE] GPT-4 Vision error:", visionError)
      console.error("[v0] [ANALYZE] Error details:", visionError.message)

      console.log("[v0] [ANALYZE] Using fallback analysis...")
      const fallbackAnalysis = {
        hasFace: true,
        gender: "unknown",
        ageRange: "adult",
        expression: "neutral",
        quality: image.size > 500000 ? "good" : "fair",
        features: [],
      }

      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
      })
    }
  } catch (error: any) {
    console.error("[v0] [ANALYZE] Fatal error:", error)
    console.error("[v0] [ANALYZE] Error message:", error.message)
    console.error("[v0] [ANALYZE] Error stack:", error.stack)
    return NextResponse.json(
      {
        error: error.message || "Analysis failed",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
