import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] [ANALYZE] Starting facial analysis...")

    let formData: FormData
    try {
      console.log("[v0] [ANALYZE] Step 1: Parsing formData...")
      formData = await request.formData()
      console.log("[v0] [ANALYZE] Step 2: FormData parsed successfully")
    } catch (formDataError: any) {
      console.error("[v0] [ANALYZE] FormData parsing error:", formDataError.message)

      // Return fallback analysis if formData parsing fails
      const fallbackAnalysis = {
        hasFace: true,
        gender: "unknown",
        ageRange: "adult",
        expression: "neutral",
        quality: "fair",
        features: [],
      }

      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        usingFallback: true,
        message: "Using basic analysis (request parsing failed)",
      })
    }

    console.log("[v0] [ANALYZE] Step 3: Extracting image from formData...")
    const image = formData.get("image") as File
    console.log("[v0] [ANALYZE] Step 4: Image extracted:", image ? "yes" : "no")

    if (!image) {
      console.log("[v0] [ANALYZE] No image provided")

      const fallbackAnalysis = {
        hasFace: false,
        gender: "unknown",
        ageRange: "unknown",
        expression: "unknown",
        quality: "poor",
        features: [],
      }

      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        usingFallback: true,
        message: "Using basic analysis (no image provided)",
      })
    }

    console.log("[v0] [ANALYZE] Image received:", image.name, image.size, "bytes", "type:", image.type)

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
      console.log("[v0] [ANALYZE] OpenAI API key not configured, using fallback analysis")

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
        usingFallback: true,
        message: "Using basic analysis (OpenAI API key not configured)",
      })
    }

    let base64Image: string
    let mimeType: string

    try {
      console.log("[v0] [ANALYZE] Step 5: Converting image to base64...")
      const bytes = await image.arrayBuffer()
      console.log("[v0] [ANALYZE] Step 6: ArrayBuffer created, size:", bytes.byteLength)

      const buffer = Buffer.from(bytes)
      console.log("[v0] [ANALYZE] Step 7: Buffer created")

      base64Image = buffer.toString("base64")
      mimeType = image.type || "image/jpeg"
      console.log("[v0] [ANALYZE] Step 8: Image converted to base64, type:", mimeType)
    } catch (conversionError: any) {
      console.error("[v0] [ANALYZE] Image conversion error:", conversionError.message)

      // Return fallback if image conversion fails
      const fallbackAnalysis = {
        hasFace: true,
        gender: "unknown",
        ageRange: "adult",
        expression: "neutral",
        quality: "fair",
        features: [],
      }

      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        usingFallback: true,
        message: "Using basic analysis (image conversion failed)",
      })
    }

    try {
      console.log("[v0] [ANALYZE] Step 9: Calling OpenAI GPT-4 Vision...")

      const base64SizeInBytes = (base64Image.length * 3) / 4
      const base64SizeInMB = base64SizeInBytes / (1024 * 1024)
      console.log("[v0] [ANALYZE] Base64 image size:", base64SizeInMB.toFixed(2), "MB")

      if (base64SizeInMB > 15) {
        console.log("[v0] [ANALYZE] Image too large for OpenAI API, using fallback")
        throw new Error("Image too large for analysis")
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
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

      console.log("[v0] [ANALYZE] Step 10: OpenAI response status:", response.status)

      const responseText = await response.text()
      console.log("[v0] [ANALYZE] Response text preview:", responseText.substring(0, 200))

      if (!response.ok) {
        console.error("[v0] [ANALYZE] OpenAI API error:", responseText)
        throw new Error(`OpenAI API error: ${response.status} - ${responseText}`)
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError: any) {
        console.error("[v0] [ANALYZE] JSON parse error:", parseError.message)
        console.error("[v0] [ANALYZE] Response was:", responseText)
        throw new Error(`Failed to parse OpenAI response as JSON: ${parseError.message}`)
      }

      console.log("[v0] [ANALYZE] Step 11: OpenAI response received")

      const content = data.choices[0]?.message?.content
      if (!content) {
        throw new Error("No content in OpenAI response")
      }

      console.log("[v0] [ANALYZE] GPT-4 Vision response:", content)

      let cleanContent = content.trim()

      // Remove markdown code blocks
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
      }

      console.log("[v0] [ANALYZE] Cleaned content:", cleanContent)

      // Parse the JSON response
      const analysis = JSON.parse(cleanContent)
      console.log("[v0] [ANALYZE] Parsed analysis:", analysis)

      return NextResponse.json({
        success: true,
        analysis,
      })
    } catch (visionError: any) {
      console.error("[v0] [ANALYZE] GPT-4 Vision error:", visionError.message)

      console.log("[v0] [ANALYZE] Using fallback analysis due to API error...")
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
        usingFallback: true,
        message: "Using basic analysis (OpenAI API error)",
      })
    }
  } catch (error: any) {
    console.error("[v0] [ANALYZE] Fatal error at:", error.stack)
    console.error("[v0] [ANALYZE] Error message:", error.message)
    console.error("[v0] [ANALYZE] Error type:", error.constructor.name)

    return NextResponse.json({
      success: true,
      analysis: {
        hasFace: true,
        gender: "unknown",
        ageRange: "adult",
        expression: "neutral",
        quality: "fair",
        features: [],
      },
      usingFallback: true,
      message: "Using basic analysis (processing error)",
    })
  }
}
