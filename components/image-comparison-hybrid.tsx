"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { trackSliderInteraction } from "@/lib/analytics"

interface ImageComparisonHybridProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  title?: string
  improvements?: string[]
  defaultMode?: "gallery" | "slider"
}

export function ImageComparisonHybrid({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  title,
  improvements,
  defaultMode = "gallery",
}: ImageComparisonHybridProps) {
  const [mode, setMode] = useState<"gallery" | "slider">(defaultMode)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(0)
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
      trackSliderInteraction(`${beforeLabel}_slider`, "homepage")
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
    if (mode !== "slider") return
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5))
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5))
    }
  }

  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1)
  }

  const toggleMode = () => {
    const newMode = mode === "gallery" ? "slider" : "gallery"
    setMode(newMode)
    trackSliderInteraction(`${beforeLabel}_toggle_${newMode}`, "homepage")
  }

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
    <div className="w-full">
      {/* Gallery Mode (Default) */}
      {mode === "gallery" && (
        <div className="space-y-4">
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-xl shadow-lg bg-gray-900"
            style={{ aspectRatio: "16 / 6" }}
          >
            {/* Split Container */}
            <div className="flex w-full h-full">
              {/* Before Side */}
              <div className="relative w-1/2 h-full group overflow-hidden">
                <img
                  src={beforeImage}
                  alt={beforeLabel}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  onLoad={handleImageLoad}
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                {/* Before Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-600/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                  {beforeLabel}
                </div>
              </div>

              {/* Divider */}
              <div className="w-1 bg-gradient-to-b from-transparent via-white to-transparent opacity-60" />

              {/* After Side */}
              <div className="relative w-1/2 h-full group overflow-hidden">
                <img
                  src={afterImage}
                  alt={afterLabel}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  onLoad={handleImageLoad}
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                {/* After Badge */}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-amber-600/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                  {afterLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleMode}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              View as Slider
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slider Mode */}
      {mode === "slider" && (
        <div className="space-y-4">
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-xl shadow-lg cursor-col-resize touch-none select-none bg-gray-900"
            style={{ aspectRatio: "16 / 6" }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="slider"
            aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
            aria-valuenow={Math.round(sliderPosition)}
            aria-valuemin={0}
            aria-valuemax={100}
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

            {/* Labels for Slider Mode */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-600/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full pointer-events-none">
              {beforeLabel}
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-amber-600/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full pointer-events-none">
              {afterLabel}
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-75 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Handle Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-slate-900">
                <div className="flex items-center gap-1 text-slate-900">
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Position Percentage */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full pointer-events-none">
              {Math.round(sliderPosition)}%
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleMode}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              View Side-by-Side
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Improvements Metrics (Optional) */}
      {improvements && improvements.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {improvements.map((improvement, idx) => (
            <div
              key={idx}
              className="px-3 py-1.5 bg-green-900/30 border border-green-700/50 text-green-300 text-xs font-medium rounded-full"
            >
              {improvement}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
