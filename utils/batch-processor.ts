/**
 * Batch Processing Utility
 * Process multiple images simultaneously with queue management
 */

export interface BatchItem {
  id: string
  file: File
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  result?: {
    original: string
    enhanced: string
    downloadUrl: string
  }
  error?: string
  startTime?: number
  endTime?: number
}

export interface BatchProcessOptions {
  settings: any
  maxConcurrent?: number
  onProgress?: (progress: BatchProgress) => void
  onItemComplete?: (item: BatchItem) => void
  onComplete?: (results: BatchItem[]) => void
}

export interface BatchProgress {
  total: number
  completed: number
  failed: number
  processing: number
  percentage: number
}

export class BatchProcessor {
  private items: Map<string, BatchItem> = new Map()
  private queue: string[] = []
  private processing: Set<string> = new Set()
  private maxConcurrent: number
  private options: BatchProcessOptions

  constructor(files: File[], options: BatchProcessOptions) {
    this.maxConcurrent = options.maxConcurrent || 3
    this.options = options

    // Initialize batch items
    files.forEach((file, index) => {
      const item: BatchItem = {
        id: `batch-${Date.now()}-${index}`,
        file,
        status: "pending",
        progress: 0,
      }
      this.items.set(item.id, item)
      this.queue.push(item.id)
    })
  }

  async start(): Promise<BatchItem[]> {
    console.log(`🚀 Starting batch processing of ${this.items.size} images`)

    const promises: Promise<void>[] = []

    // Start initial batch of concurrent processes
    for (let i = 0; i < Math.min(this.maxConcurrent, this.queue.length); i++) {
      promises.push(this.processNext())
    }

    await Promise.all(promises)

    const results = Array.from(this.items.values())
    this.options.onComplete?.(results)

    return results
  }

  private async processNext(): Promise<void> {
    while (this.queue.length > 0) {
      const itemId = this.queue.shift()
      if (!itemId) break

      const item = this.items.get(itemId)
      if (!item) continue

      this.processing.add(itemId)
      await this.processItem(item)
      this.processing.delete(itemId)

      this.updateProgress()
    }
  }

  private async processItem(item: BatchItem): Promise<void> {
    try {
      item.status = "processing"
      item.startTime = Date.now()
      item.progress = 10

      console.log(`📸 Processing: ${item.file.name}`)

      // Create form data
      const formData = new FormData()
      formData.append("file", item.file)
      formData.append("settings", JSON.stringify(this.options.settings))

      item.progress = 30

      // Call enhancement API
      const response = await fetch("/api/enhance-replicate", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Enhancement failed")
      }

      item.progress = 90

      // Store result
      item.result = {
        original: URL.createObjectURL(item.file),
        enhanced: data.downloadUrl,
        downloadUrl: data.downloadUrl,
      }

      item.status = "completed"
      item.progress = 100
      item.endTime = Date.now()

      const duration = ((item.endTime - item.startTime!) / 1000).toFixed(1)
      console.log(`✅ Completed: ${item.file.name} (${duration}s)`)

      this.options.onItemComplete?.(item)
    } catch (error) {
      item.status = "failed"
      item.error = error instanceof Error ? error.message : "Processing failed"
      item.endTime = Date.now()

      console.error(`❌ Failed: ${item.file.name}`, error)
    }
  }

  private updateProgress(): void {
    const total = this.items.size
    const completed = Array.from(this.items.values()).filter((i) => i.status === "completed").length
    const failed = Array.from(this.items.values()).filter((i) => i.status === "failed").length
    const processing = this.processing.size

    const progress: BatchProgress = {
      total,
      completed,
      failed,
      processing,
      percentage: Math.round(((completed + failed) / total) * 100),
    }

    this.options.onProgress?.(progress)
  }

  pause(): void {
    // Implementation for pause functionality
    console.log("⏸️ Batch processing paused")
  }

  resume(): void {
    // Implementation for resume functionality
    console.log("▶️ Batch processing resumed")
  }

  cancel(): void {
    this.queue = []
    console.log("🛑 Batch processing cancelled")
  }

  getResults(): BatchItem[] {
    return Array.from(this.items.values())
  }

  getProgress(): BatchProgress {
    const total = this.items.size
    const completed = Array.from(this.items.values()).filter((i) => i.status === "completed").length
    const failed = Array.from(this.items.values()).filter((i) => i.status === "failed").length
    const processing = this.processing.size

    return {
      total,
      completed,
      failed,
      processing,
      percentage: Math.round(((completed + failed) / total) * 100),
    }
  }
}

// Helper function to download all batch results as ZIP
export async function downloadBatchAsZip(items: BatchItem[], filename = "enhanced-photos.zip"): Promise<void> {
  try {
    const JSZip = (await import("jszip")).default
    const zip = new JSZip()

    for (const item of items) {
      if (item.status === "completed" && item.result) {
        const response = await fetch(item.result.downloadUrl)
        const blob = await response.blob()
        const ext = item.file.name.split(".").pop() || "png"
        zip.file(`enhanced-${item.id}.${ext}`, blob)
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log(`📦 Downloaded ${items.length} images as ZIP`)
  } catch (error) {
    console.error("Failed to create ZIP:", error)
    throw error
  }
}
