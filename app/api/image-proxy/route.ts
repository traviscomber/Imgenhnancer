import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function GET(request: Request) {
  try {
    // Get the URL from the query parameter
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
    }

    console.log(`[Image Proxy] Fetching: ${imageUrl}`)

    // Create fetch options with appropriate headers
    const fetchOptions: RequestInit = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      cache: "no-store",
    }

    // Fetch the image with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
    fetchOptions.signal = controller.signal

    const response = await fetch(imageUrl, fetchOptions)
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`[Image Proxy] Failed to fetch image: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    // Get the image data as an array buffer
    const imageBuffer = await response.arrayBuffer()

    // Get content type from the original response or default to octet-stream
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    // Create a new response with the image data and appropriate headers
    const headers = new Headers()
    headers.set("Content-Type", contentType)
    headers.set("Content-Length", imageBuffer.byteLength.toString())
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Cache-Control", "public, max-age=3600")

    // Return the image data with the headers
    return new Response(imageBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("[Image Proxy] Error:", error)

    // Check if it's an abort error (timeout)
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 })
    }

    return NextResponse.json(
      { error: `Failed to proxy image: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
