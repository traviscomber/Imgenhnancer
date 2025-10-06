"use client"

import { useState, useRef, useCallback, type MouseEvent, type TouchEvent } from "react"

interface ImageComparisonSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  className = "",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const percent = (x / rect.width) * 100

    setSliderPosition(percent)
  }, [])

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return
      e.preventDefault()
      updateSliderPosition(e.clientX)
    },
    [isDragging, updateSliderPosition],
  )

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!isDragging || !e.touches[0]) return
      e.preventDefault()
      updateSliderPosition(e.touches[0].clientX)
    },
    [isDragging, updateSliderPosition],
  )

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl select-none touch-none bg-black ${className}`}
      style={{ aspectRatio: "4/3" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* After Image (Enhanced/HD) - Base layer, always visible */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src={afterImage || "/placeholder.svg"}
          alt={afterLabel}
          className="max-w-full max-h-full object-contain"
          draggable="false"
        />
        <div className="absolute top-4 right-4 pointer-events-none n3uralia-badge-gold px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm shadow-gold-md z-10">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Original/Blur) - Clipped layer on top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={beforeImage || "/placeholder.svg"}
            alt={beforeLabel}
            className="max-w-full max-h-full object-contain"
            draggable="false"
          />
        </div>
        <div className="absolute top-4 left-4 pointer-events-none bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm z-10">
          {beforeLabel}
        </div>
      </div>

      {/* Gold Slider Bar with Elegant Design */}
      <div
        className="absolute top-0 bottom-0 w-1 pointer-events-none z-20"
        style={{
          left: `${sliderPosition}%`,
          transform: "translateX(-50%)",
        }}
      >
        {/* Gold gradient bar with glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-gold-300 via-gold-400 to-gold-500 transition-shadow ${
            isDragging ? "shadow-[0_0_30px_rgba(255,215,0,0.8)]" : "shadow-[0_0_15px_rgba(255,215,0,0.5)]"
          }`}
        >
          {/* Top accent dot */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-gold-200 to-gold-400 shadow-gold-md"></div>
          {/* Bottom accent dot */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-gold-200 to-gold-400 shadow-gold-md"></div>
        </div>

        {/* Premium Gold Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div
            className={`w-5 h-5 rounded-full bg-gradient-to-br from-gold-300 via-gold-400 to-gold-500 flex items-center justify-center transition-all ${
              isDragging
                ? "scale-110 shadow-[0_0_60px_rgba(255,215,0,0.9)]"
                : "scale-100 shadow-[0_0_30px_rgba(255,215,0,0.6)] hover:scale-105 hover:shadow-[0_0_40px_rgba(255,215,0,0.7)]"
            }`}
            style={{
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            {/* Glass morphism overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>

            {/* Chevron Icons */}
            <div className="relative flex items-center justify-center gap-0.5 z-10">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-black/80">
                <path
                  d="M7 3L4 6L7 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-black/80">
                <path
                  d="M5 3L8 6L5 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Instruction Overlay - Only show when not dragging */}
      {!isDragging && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <div className="bg-gradient-to-r from-gold-300/90 via-gold-400/90 to-gold-500/90 text-black px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm shadow-gold-lg animate-gold-pulse">
            Drag to compare
          </div>
        </div>
      )}
    </div>
  )
}
