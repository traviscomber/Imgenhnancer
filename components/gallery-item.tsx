"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Check, Download, ImageIcon, Loader2, RefreshCw } from "lucide-react"

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
  const [proxyUrl, setProxyUrl] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  // Function to load image with proxy fallback
  const loadImage = useEffect(() => {
    if (!job.downloadUrl) return

    // Reset states when URL changes
    setImageLoaded(false)
    setImageError(false)
    setIsRetrying(false)

    // Always use proxy for Replicate URLs to avoid CORS issues
    const shouldUseProxyDirectly = job.downloadUrl.includes("replicate") || job.downloadUrl.includes("amazonaws.com")

    if (shouldUseProxyDirectly) {
      // Use proxy directly for known problematic domains
      const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(job.downloadUrl)}`
      setProxyUrl(proxiedUrl)
      console.log("Using proxy directly for:", job.downloadUrl)
    } else {
      // Try direct URL first for other domains
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setProxyUrl(job.downloadUrl)
        setImageLoaded(true)
      }
      img.onerror = () => {
        // If direct URL fails, try with proxy
        const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(job.downloadUrl)}`
        console.log("Direct URL failed, trying proxy:", proxiedUrl)
        setProxyUrl(proxiedUrl)
      }
      img.src = job.downloadUrl
    }
  }, [job.downloadUrl])

  // Handle retry
  const handleRetry = () => {
    setIsRetrying(true)
    setImageError(false)
    setImageLoaded(false)

    // Force a new proxy URL with a cache buster
    const cacheBuster = new Date().getTime()
    const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(job.downloadUrl || "")}&cb=${cacheBuster}`
    setProxyUrl(proxiedUrl)

    setTimeout(() => {
      setIsRetrying(false)
    }, 2000)
  }

  const handleDownload = () => {
    if (!job.downloadUrl) return

    // Use the proxy URL for download if we had to use it for display
    const downloadUrl = proxyUrl && proxyUrl.startsWith("/api/image-proxy") ? proxyUrl : job.downloadUrl

    // Create a temporary anchor element
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = `enhanced_${job.originalFileName}`

    // For proxy URLs, we need to fetch and create a blob URL
    if (downloadUrl.startsWith("/api/image-proxy")) {
      fetch(downloadUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob)
          link.href = blobUrl
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(blobUrl) // Clean up
        })
        .catch((error) => {
          console.error("Download failed:", error)
          alert("Download failed. Please try again.")
        })
    } else {
      // Direct download for regular URLs
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Image preview */}
      <div className="aspect-video flex items-center justify-center relative bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        {job.downloadUrl ? (
          <>
            {proxyUrl && (
              <img
                src={proxyUrl || "/placeholder.svg"}
                alt={`Enhanced ${job.originalFileName}`}
                className={`w-full h-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  console.error("Image failed to load:", proxyUrl)
                  setImageError(true)
                }}
                crossOrigin="anonymous"
              />
            )}

            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            )}

            {imageError && (
              <div className="flex flex-col items-center justify-center text-white h-full">
                <AlertCircle className="w-12 h-12 mb-2 text-red-400" />
                <p className="text-sm text-red-400 mb-3">Failed to load image</p>
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center space-x-1 text-sm"
                  disabled={isRetrying}
                >
                  <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
                  <span>{isRetrying ? "Retrying..." : "Retry"}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-white h-full">
            <ImageIcon className="w-12 h-12 mb-2 text-gray-400" />
            <p className="text-sm text-gray-400">No image URL</p>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {job.downloadUrl && imageLoaded && !imageError ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Ready</span>
          ) : job.downloadUrl ? (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
              {imageError ? "Error" : "Loading"}
            </span>
          ) : (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">No URL</span>
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
            disabled={!job.downloadUrl || (imageError && !isRetrying)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>

          <button
            onClick={() => alert(JSON.stringify({ ...job, proxyUrl }, null, 2))}
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
