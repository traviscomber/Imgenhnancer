"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import Image from "next/image"

interface GalleryItemProps {
  imageUrl: string
  title: string
  description?: string
  onDownload?: () => void
}

export default function GalleryItem({ imageUrl, title, description, onDownload }: GalleryItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  // Check if the URL is from a known problematic domain that needs proxying
  const needsProxy = (url: string): boolean => {
    const problematicDomains = ["replicate.delivery", "replicate.com", "api.replicate.com", "fal.ai", "api.fal.ai"]
    try {
      const parsedUrl = new URL(url)
      return problematicDomains.some((domain) => parsedUrl.hostname.includes(domain))
    } catch {
      return false
    }
  }

  // Get the appropriate image URL (proxied if needed)
  const getImageUrl = (url: string): string => {
    // Always use proxy for known problematic domains
    if (needsProxy(url)) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`
    }
    return url
  }

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  // Handle image load error
  const handleImageError = () => {
    console.error(`Image failed to load: ${getImageUrl(imageUrl)}`)
    setImageError(true)
    setImageLoaded(false)
  }

  // Retry loading the image
  const retryLoadImage = () => {
    setRetryCount((prev) => prev + 1)
    setImageError(false)
  }

  // Handle download button click
  const handleDownload = async () => {
    if (onDownload) {
      onDownload()
      return
    }

    try {
      setIsDownloading(true)

      // Use the image proxy for downloading as well
      const url = getImageUrl(imageUrl)

      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to download: ${response.status}`)

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = title || "enhanced-image.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Reset state when image URL changes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
    setRetryCount(0)
  }, [imageUrl])

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square w-full">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
            <p className="mb-4 text-center text-sm text-gray-500">Failed to load image</p>
            <Button
              variant="outline"
              size="sm"
              onClick={retryLoadImage}
              className="flex items-center gap-1 bg-transparent"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        <Image
          src={getImageUrl(imageUrl) || "/placeholder.svg"}
          alt={title}
          fill
          className={`object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          key={`${imageUrl}-${retryCount}`} // Force reload on retry
        />
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{title}</h3>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading || imageError}
            title="Download image"
          >
            <Download className={`h-4 w-4 ${isDownloading ? "animate-pulse" : ""}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
