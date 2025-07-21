"use client"

import { useState } from "react"
import { AlertCircle, Check, Download, ImageIcon, Loader2 } from "lucide-react"

export interface GalleryJob {
  id: string | number
  originalFileName: string
  downloadUrl?: string
  apiEndpoint: string
  model: string
  upscaleFactor: number
  processingTime: string
}

interface GalleryItemProps {
  job: GalleryJob
}

export function GalleryItem({ job }: GalleryItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleDownload = () => {
    if (!job.downloadUrl) return
    const link = document.createElement("a")
    link.href = job.downloadUrl
    link.download = `enhanced_${job.originalFileName}`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Image preview */}
      <div className="aspect-video flex items-center justify-center relative bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        {job.downloadUrl && !imageError ? (
          <>
            <img
              src={job.downloadUrl || "/placeholder.svg"}
              alt={`Enhanced ${job.originalFileName}`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              crossOrigin="anonymous"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-white h-full">
            {imageError ? (
              <>
                <AlertCircle className="w-12 h-12 mb-2 text-red-400" />
                <p className="text-sm text-red-400">Failed to load image</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 mb-2 text-gray-400" />
                <p className="text-sm text-gray-400">No image URL</p>
              </>
            )}
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {job.downloadUrl && !imageError ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Ready</span>
          ) : (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Error</span>
          )}
        </div>
      </div>

      {/* Meta + actions */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-white font-semibold">{job.originalFileName}</p>
          <p className="text-xs text-gray-400">
            {job.apiEndpoint} • {job.model}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-green-400">
            <Check className="w-4 h-4" />
            <span>Enhanced • {job.upscaleFactor}x</span>
          </div>
          <span className="text-blue-400">{job.processingTime}</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            disabled={!job.downloadUrl}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>

          <button
            onClick={() => alert(JSON.stringify(job, null, 2))}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            title="Debug info"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
