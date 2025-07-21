import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const targetSizeStr = formData.get("targetSize") as string
    const qualityStr = formData.get("quality") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const targetSize = Number.parseInt(targetSizeStr) || 2 * 1024 * 1024 // Default 2MB
    const quality = Number.parseInt(qualityStr) || 80 // Default 80% quality

    console.log("🗜️ Compressing image:", {
      originalSize: file.size,
      targetSize,
      quality,
    })

    // Create canvas for image processing
    const arrayBuffer = await file.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: file.type })

    // Create image bitmap for processing
    const imageBitmap = await createImageBitmap(blob)

    // Calculate new dimensions to reduce file size
    let { width, height } = imageBitmap
    const aspectRatio = width / height

    // Reduce dimensions if file is too large
    if (file.size > targetSize) {
      const reductionFactor = Math.sqrt(targetSize / file.size)
      width = Math.floor(width * reductionFactor)
      height = Math.floor(height * reductionFactor)
    }

    // Create canvas and draw resized image
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    ctx.drawImage(imageBitmap, 0, 0, width, height)

    // Convert to blob with compression
    const compressedBlob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: quality / 100,
    })

    console.log("✅ Image compressed:", {
      originalSize: file.size,
      compressedSize: compressedBlob.size,
      reduction: `${Math.round((1 - compressedBlob.size / file.size) * 100)}%`,
      newDimensions: `${width}x${height}`,
    })

    // Convert to base64 for response
    const arrayBufferCompressed = await compressedBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBufferCompressed).toString("base64")
    const dataUrl = `data:image/jpeg;base64,${base64}`

    return NextResponse.json({
      success: true,
      originalSize: file.size,
      compressedSize: compressedBlob.size,
      reduction: Math.round((1 - compressedBlob.size / file.size) * 100),
      dataUrl,
      dimensions: { width, height },
    })
  } catch (error) {
    console.error("❌ Image compression error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to compress image",
      },
      { status: 500 },
    )
  }
}
