import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const targetSize = Number.parseInt(formData.get("targetSize") as string) || 2 * 1024 * 1024 // 2MB default
    const quality = Number.parseInt(formData.get("quality") as string) || 80

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Create canvas and context
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      return NextResponse.json({ success: false, error: "Canvas context not available" }, { status: 500 })
    }

    // Create image from buffer
    const img = new Image()
    const blob = new Blob([uint8Array], { type: file.type })
    const imageUrl = URL.createObjectURL(blob)

    return new Promise((resolve) => {
      img.onload = () => {
        // Calculate new dimensions to reduce file size
        let { width, height } = img
        const aspectRatio = width / height

        // Reduce dimensions if file is too large
        const maxDimension = Math.sqrt(targetSize / (file.size / (width * height)))
        if (maxDimension < 1) {
          width = Math.floor(width * maxDimension)
          height = Math.floor(height * maxDimension)
        }

        // Set canvas size
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to data URL with compression
        const dataUrl = canvas.toDataURL("image/jpeg", quality / 100)

        // Calculate compression ratio
        const originalSize = file.size
        const compressedSize = Math.round((dataUrl.length * 3) / 4) // Approximate size from base64
        const reduction = Math.round((1 - compressedSize / originalSize) * 100)

        URL.revokeObjectURL(imageUrl)

        resolve(
          NextResponse.json({
            success: true,
            dataUrl,
            originalSize,
            compressedSize,
            reduction,
            dimensions: { width, height },
          }),
        )
      }

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl)
        resolve(NextResponse.json({ success: false, error: "Failed to load image" }, { status: 500 }))
      }

      img.src = imageUrl
    })
  } catch (error) {
    console.error("Compression error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Compression failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
