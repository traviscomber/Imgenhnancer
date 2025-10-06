"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"

interface ImageComparisonSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))

    requestAnimationFrame(() => {
      setSliderPosition(percentage)
    })
  }, [])

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateSliderPosition(e.clientX)
      }
    },
    [isDragging, updateSliderPosition],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        updateSliderPosition(e.touches[0].clientX)
      }
    },
    [isDragging, updateSliderPosition],
  )

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
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove])

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-lg shadow-2xl cursor-col-resize select-none touch-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After Image (Background) */}
      <div className="relative w-full">
        <Image
          src={afterImage || "/placeholder.svg"}
          alt={afterLabel}
          width={800}
          height={600}
          className="w-full h-auto"
          quality={95}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 672px"
        />
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={beforeImage || "/placeholder.svg"}
          alt={beforeLabel}
          width={800}
          height={600}
          className="w-full h-auto"
          quality={95}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 672px"
        />
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Line and Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center pointer-events-auto cursor-col-resize">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Instruction Text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm pointer-events-none">
        <span className="hidden md:inline">Drag to compare</span>
        <span className="md:hidden">Swipe to compare</span>
      </div>
    </div>
  )
}
