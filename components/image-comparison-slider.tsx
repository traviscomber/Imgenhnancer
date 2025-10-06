"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

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
  className,
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const percent = (x / rect.width) * 100

    setSliderPosition(percent)
  }

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !e.touches[0]) return
    handleMove(e.touches[0].clientX)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove)
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
      className={cn("relative w-full overflow-hidden rounded-xl bg-black", className)}
      style={{ aspectRatio: "4/3" }}
    >
      {/* After Image (Right side) - Full width */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={afterImage || "/placeholder.svg"}
          alt={afterLabel}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Before Image (Left side) - Clipped */}
      <div
        className="absolute inset-0 overflow-hidden flex items-center justify-center"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage || "/placeholder.svg"}
          alt={beforeLabel}
          className="w-full h-full object-contain"
          draggable={false}
          style={{ width: containerRef.current?.offsetWidth }}
        />
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/20">
          {beforeLabel}
        </span>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium border border-gold-500/40 n3uralia-glow-gold">
          {afterLabel}
        </span>
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-gold-300 via-gold-400 to-gold-500 cursor-ew-resize z-20 n3uralia-glow-gold"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Slider Handle - 70% smaller */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shadow-gold-lg flex items-center justify-center cursor-ew-resize hover:scale-110 transition-transform n3uralia-glow-gold">
          <div className="flex items-center gap-0.5">
            <div className="w-0.5 h-3 bg-black rounded-full" />
            <div className="w-0.5 h-3 bg-black rounded-full" />
          </div>
        </div>
      </div>

      {/* Drag hint overlay */}
      {sliderPosition === 50 && !isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-gold-500/90 backdrop-blur-sm text-black px-6 py-3 rounded-full font-semibold shadow-gold-xl animate-pulse">
            ← Drag to compare →
          </div>
        </div>
      )}
    </div>
  )
}
