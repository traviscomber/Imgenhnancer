"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { trackSliderInteraction } from "@/lib/analytics"

interface ImageComparisonSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  priority?: boolean
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  priority = false,
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasTrackedRef = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = (x / rect.width) * 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage))

    requestAnimationFrame(() => {
      setSliderPosition(clampedPercentage)
    })
  }, [])

  const handleMouseDown = () => {
    setIsDragging(true)
    if (!hasTrackedRef.current) {
      trackSliderInteraction(beforeLabel || "comparison", "homepage")
      hasTrackedRef.current = true
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    handleMove(e.touches[0].clientX)
  }

  const handleImageLoad = useCallback(() => {
    setImagesLoaded(true)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl shadow-2xl cursor-col-resize touch-none select-none bg-gray-900"
      style={{
        aspectRatio: "16 / 6",
        maxWidth: "100%",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After Image (Background) */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-contain"
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />
      </div>

      {/* Before Image (Overlay with clip) */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden flex items-center justify-center"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-contain"
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center pointer-events-auto cursor-col-resize">
          <div className="flex gap-1">
            <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
            <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-1/2 -translate-x-[60px] px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs md:text-sm rounded-full font-medium">
        {beforeLabel}
      </div>
      <div className="absolute top-4 left-1/2 translate-x-[10px] px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs md:text-sm rounded-full font-medium">
        {afterLabel}
      </div>

      {/* Mobile Instruction */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full md:hidden">
        Swipe to compare
      </div>
    </div>
  )
}
