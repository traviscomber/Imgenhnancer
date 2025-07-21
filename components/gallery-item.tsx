"use client"

import { useState } from "react"
import { Download, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GalleryJob {
  id: number | string
  downloadUrl: string
  originalPreview: string
  originalFileName: string
  model: string
  method: string
  upscaleFactor: number
  processingTime?: string
  wasCompressed?: boolean
  apiEndpoint?: string
}

interface GalleryItemProps {
  job: GalleryJob
}

export function GalleryItem({ job }: GalleryItemProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(job.downloadUrl)}`

  const retry = () => {
    setErrored(false)
    // force image reload by appending a cache-buster
    const img = document.querySelector<HTMLImageElement>(`img[data-id="${job.id}"]`)
    if (img) {
      img.src = `${proxiedUrl}&t=${Date.now()}`
    }
  }

  return (
    <div className="relative group bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {!loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center text-blue-300 text-sm">Loading…</div>
      )}

      {/* Enhanced image */}
      <img
        data-id={job.id}
        src={proxiedUrl || "/placeholder.svg"}
        alt={job.originalFileName}
        className={cn(
          "w-full h-56 object-cover transition-opacity duration-300",
          loaded && !errored ? "opacity-100" : "opacity-0",
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true)
          setLoaded(true)
        }}
        crossOrigin="anonymous"
      />

      {/* Error state */}
      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-red-300 p-4 space-y-2">
          <AlertCircle className="w-6 h-6" />
          <span className="text-sm text-center">Failed to load image</span>
          <button
            onClick={retry}
            className="inline-flex items-center text-xs text-yellow-300 hover:text-yellow-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Retry
          </button>
        </div>
      )}

      {/* Footer with info + download */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-3 flex items-center justify-between text-xs text-white">
        <div className="space-x-1">
          <span className="font-medium">{job.upscaleFactor}×</span>
          <span>{job.model}</span>
          <span className="opacity-70">via {job.method}</span>
        </div>
        <a
          href={job.downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center hover:text-blue-400 transition-colors"
        >
          <Download className="w-4 h-4 mr-1" /> Download
        </a>
      </div>
    </div>
  )
}

/* also keep default export for flexibility */
export default GalleryItem
