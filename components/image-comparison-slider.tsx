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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const step = 5 // 5% step for arrow keys
    let newPosition = sliderPosition
    
    switch (e.key) {
      case 'ArrowLeft':
        newPosition = Math.max(0, sliderPosition - step)
        e.preventDefault()
        break
      case 'ArrowRight':
        newPosition = Math.min(100, sliderPosition + step)
        e.preventDefault()
        break
      case 'Home':
        newPosition = 0
        e.preventDefault()
        break
      case 'End':
        newPosition = 100
        e.preventDefault()
        break
      default:
        return
    }
    
    setSliderPosition(newPosition)
    trackSliderInteraction(beforeLabel || "comparison", "homepage")
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
      className="relative w-full cursor-col-resize touch-none select-none overflow-hidden border border-[#6f5d49] bg-[#050403] shadow-[0_28px_90px_rgba(0,0,0,0.55)] focus:outline-none focus:ring-2 focus:ring-[#d7a957] focus:ring-offset-2 focus:ring-offset-[#050403]"
      style={{
        aspectRatio: "16 / 6",
        maxWidth: "100%",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onKeyDown={handleKeyDown}
      role="slider"
      aria-label={`Compare ${beforeLabel} and ${afterLabel} images`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuetext={`${Math.round(sliderPosition)}% ${afterLabel}`}
      tabIndex={0}
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
      <div className="absolute bottom-0 top-0 z-10 w-[2px] bg-[#d7a957] shadow-[0_0_0_1px_rgba(5,4,3,0.75),0_0_18px_rgba(201,149,61,0.42)] pointer-events-none" style={{ left: `${sliderPosition}%` }}>
        {/* Slider Handle */}
        <div className="pointer-events-auto absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-col-resize items-center justify-center border border-[#d7a957]/80 bg-[#16110d] shadow-[0_0_0_1px_rgba(5,4,3,0.9),0_14px_32px_rgba(0,0,0,0.55),0_0_22px_rgba(201,149,61,0.2)] md:h-12 md:w-12">
          <div className="flex gap-1">
            <div className="h-4 w-0.5 bg-[#f0d59c]" />
            <div className="h-4 w-0.5 bg-[#f0d59c]" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute left-4 top-4 border border-[#6f5d49]/70 bg-[#050403]/78 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f3eadf] backdrop-blur-sm md:text-sm">
        {beforeLabel}
      </div>
      <div className="absolute right-4 top-4 border border-[#c9953d]/45 bg-[#050403]/78 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#d7a957] backdrop-blur-sm md:text-sm">
        {afterLabel}
      </div>

      {/* Mobile Instruction */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 border border-[#6f5d49]/70 bg-[#050403]/78 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[#f0d59c] backdrop-blur-sm md:hidden">
        Swipe to compare
      </div>
    </div>
  )
}
