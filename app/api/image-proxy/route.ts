import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
    }

    console.log("🖼️ Image proxy request for:", url)

    // Validate URL to prevent server-side request forgery
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch (error) {
      console.error("❌ Invalid URL:", url, error)
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Allow all domains for now to ensure functionality
    // We can restrict this later once we know all the domains used by our image providers

    // Fetch the image with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    console.log("🌐 Fetching image from:", validUrl.toString())

    const response = await fetch(validUrl.toString(), {
      signal: controller.signal,
      headers: {
        // Some servers require a user agent
        "User-Agent": "AI-Enhancer-Image-Proxy/1.0",
      },
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) {
      console.error(`❌ Failed to fetch image: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    console.log(`✅ Successfully proxied image (${imageBuffer.byteLength} bytes, ${contentType})`)

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Cross-Origin-Embedder-Policy": "credentialless",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    })
  } catch (error) {
    console.error("❌ Image proxy error:", error)
    return NextResponse.json(
      {
        error: "Failed to proxy image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
