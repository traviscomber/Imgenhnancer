import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
    }

    // Validate URL to prevent server-side request forgery
    const validUrl = new URL(url)

    // Only allow certain domains for security
    const allowedDomains = [
      "replicate.delivery",
      "replicate.com",
      "replicate-api.com",
      "amazonaws.com",
      "cloudfront.net",
    ]

    const isDomainAllowed = allowedDomains.some((domain) => validUrl.hostname.endsWith(domain))

    if (!isDomainAllowed) {
      return NextResponse.json({ error: "Domain not allowed" }, { status: 403 })
    }

    // Fetch the image
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch image: ${response.status}` }, { status: response.status })
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    })
  } catch (error) {
    console.error("Image proxy error:", error)
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 })
  }
}
