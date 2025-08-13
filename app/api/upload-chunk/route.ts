import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir, readdir, readFile, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const UPLOAD_DIR = "/tmp/uploads"
const MAX_CHUNK_SIZE = 10 * 1024 * 1024 // 10MB
const CHUNK_TIMEOUT = 30 * 60 * 1000 // 30 minutes

interface ChunkMetadata {
  uploadId: string
  fileName: string
  totalChunks: number
  receivedChunks: number[]
  createdAt: number
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chunk = formData.get("chunk") as File
    const chunkIndex = Number.parseInt(formData.get("chunkIndex") as string)
    const totalChunks = Number.parseInt(formData.get("totalChunks") as string)
    const uploadId = formData.get("uploadId") as string
    const fileName = formData.get("fileName") as string

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId || !fileName) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    // Validate chunk size
    if (chunk.size > MAX_CHUNK_SIZE) {
      return NextResponse.json({ success: false, error: "Chunk size too large" }, { status: 413 })
    }

    // Ensure upload directory exists
    const uploadPath = join(UPLOAD_DIR, uploadId)
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    // Save chunk
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer())
    const chunkPath = join(uploadPath, `chunk_${chunkIndex}`)
    await writeFile(chunkPath, chunkBuffer)

    // Update metadata
    const metadataPath = join(uploadPath, "metadata.json")
    let metadata: ChunkMetadata

    if (existsSync(metadataPath)) {
      const metadataContent = await readFile(metadataPath, "utf-8")
      metadata = JSON.parse(metadataContent)
    } else {
      metadata = {
        uploadId,
        fileName,
        totalChunks,
        receivedChunks: [],
        createdAt: Date.now(),
      }
    }

    // Add chunk index if not already present
    if (!metadata.receivedChunks.includes(chunkIndex)) {
      metadata.receivedChunks.push(chunkIndex)
    }

    await writeFile(metadataPath, JSON.stringify(metadata))

    // Check if all chunks are received
    if (metadata.receivedChunks.length === totalChunks) {
      // Combine chunks
      const combinedFile = await combineChunks(uploadPath, totalChunks, fileName)

      // Clean up chunks
      await cleanupChunks(uploadPath, totalChunks)

      return NextResponse.json({
        success: true,
        complete: true,
        filePath: combinedFile,
        uploadId,
      })
    }

    return NextResponse.json({
      success: true,
      complete: false,
      receivedChunks: metadata.receivedChunks.length,
      totalChunks,
    })
  } catch (error: any) {
    console.error("Chunk upload error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

async function combineChunks(uploadPath: string, totalChunks: number, fileName: string): Promise<string> {
  const combinedPath = join(uploadPath, fileName)
  const chunks: Buffer[] = []

  // Read all chunks in order
  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = join(uploadPath, `chunk_${i}`)
    const chunkBuffer = await readFile(chunkPath)
    chunks.push(chunkBuffer)
  }

  // Combine chunks
  const combinedBuffer = Buffer.concat(chunks)
  await writeFile(combinedPath, combinedBuffer)

  return combinedPath
}

async function cleanupChunks(uploadPath: string, totalChunks: number): Promise<void> {
  // Remove individual chunk files
  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = join(uploadPath, `chunk_${i}`)
    try {
      await unlink(chunkPath)
    } catch (error) {
      console.warn(`Failed to delete chunk ${i}:`, error)
    }
  }

  // Remove metadata file
  const metadataPath = join(uploadPath, "metadata.json")
  try {
    await unlink(metadataPath)
  } catch (error) {
    console.warn("Failed to delete metadata:", error)
  }
}

// Cleanup old uploads periodically
export async function GET() {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ success: true, cleaned: 0 })
    }

    const uploads = await readdir(UPLOAD_DIR)
    let cleaned = 0

    for (const uploadId of uploads) {
      const uploadPath = join(UPLOAD_DIR, uploadId)
      const metadataPath = join(uploadPath, "metadata.json")

      if (existsSync(metadataPath)) {
        const metadataContent = await readFile(metadataPath, "utf-8")
        const metadata: ChunkMetadata = JSON.parse(metadataContent)

        // Clean up uploads older than timeout
        if (Date.now() - metadata.createdAt > CHUNK_TIMEOUT) {
          // Remove entire upload directory
          const files = await readdir(uploadPath)
          for (const file of files) {
            await unlink(join(uploadPath, file))
          }
          cleaned++
        }
      }
    }

    return NextResponse.json({ success: true, cleaned })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
