import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import os from "os"

export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract chunk information
    const chunk = formData.get("chunk") as File
    const uploadId = formData.get("uploadId") as string
    const chunkIndex = Number.parseInt(formData.get("chunkIndex") as string)
    const totalChunks = Number.parseInt(formData.get("totalChunks") as string)
    const fileName = formData.get("fileName") as string

    if (!chunk || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || !fileName) {
      return NextResponse.json({ success: false, error: "Missing required chunk information" }, { status: 400 })
    }

    // Create upload directory
    const tempDir = join(os.tmpdir(), "uploads", uploadId)
    await mkdir(tempDir, { recursive: true })

    // Save chunk to disk
    const chunkPath = join(tempDir, `chunk-${chunkIndex}`)
    const buffer = Buffer.from(await chunk.arrayBuffer())
    await writeFile(chunkPath, buffer)

    // Check if all chunks are uploaded
    const isComplete = chunkIndex === totalChunks - 1

    return NextResponse.json({
      success: true,
      uploadId,
      chunkIndex,
      totalChunks,
      isComplete,
      message: isComplete ? "All chunks received" : `Chunk ${chunkIndex + 1}/${totalChunks} received`,
    })
  } catch (error) {
    console.error("Chunk upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
