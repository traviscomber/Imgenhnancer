"use client"

import { useState, useRef, useCallback, useEffect, useMemo, type MouseEvent, type TouchEvent } from "react"
import Image from "next/image"

interface ImageComparisonSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
  priority?: boolean
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  className = "",
  priority = false,
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState({ before: false, after: false })
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const rafRef = useRef<number | null>(null)

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!containerRef.current || priority) {
      setIsLoaded(true)
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded) {
            setIsLoaded(true)
          }
        })
      },
      { rootMargin: "200px" }, // Increased margin for earlier loading
    )

    observerRef.current.observe(containerRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isLoaded, priority])

  const handleImageLoad = useCallback((type: "before" | "after") => {
    setImagesLoaded((prev) => ({ ...prev, [type]: true }))
  }, [])

  // Optimized slider position update using RAF for smooth 60fps animation
  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      const percent = (x / rect.width) * 100

      setSliderPosition(percent)
    })
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

  const bothImagesLoaded = imagesLoaded.before && imagesLoaded.after

  // Memoize clip path calculation
  const clipPath = useMemo(() => `inset(0 ${100 - sliderPosition}% 0 0)`, [sliderPosition])

  // Memoize slider style
  const sliderStyle = useMemo(
    () => ({
      left: `${sliderPosition}%`,
      transform: "translateX(-50%)",
      willChange: isDragging ? "left" : "auto",
    }),
    [sliderPosition, isDragging],
  )

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl select-none touch-none bg-black ${className}`}
      style={{ aspectRatio: "16/9" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading Skeleton */}
      {!bothImagesLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted-foreground flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
              <p className="text-sm text-gray-400">Loading comparison...</p>
            </div>
          </div>
        </div>
      )}

      {/* After Image (Enhanced/HD) - Base layer */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${bothImagesLoaded ? "opacity-100" : "opacity-0"}`}
      >
        {isLoaded && (
          <Image
            src={afterImage || "/placeholder.svg"}
            alt={afterLabel}
            fill
            className="object-contain"
            draggable={false}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            quality={95}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            onLoad={() => handleImageLoad("after")}
            onError={(e) => {
              console.error(`Failed to load after image: ${afterImage}`)
            }}
          />
        )}
        <div className="absolute top-4 right-4 pointer-events-none bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm shadow-lg shadow-amber-500/50 z-10">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Original/Blur) - Clipped layer on top */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${bothImagesLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ clipPath, willChange: isDragging ? "clip-path" : "auto" }}
      >
        {isLoaded && (
          <Image
            src={beforeImage || "/placeholder.svg"}
            alt={beforeLabel}
            fill
            className="object-contain"
            draggable={false}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            quality={95}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            onLoad={() => handleImageLoad("before")}
            onError={(e) => {
              console.error(`Failed to load before image: ${beforeImage}`)
            }}
          />
        )}
        <div className="absolute top-4 left-4 pointer-events-none bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm z-10">
          {beforeLabel}
        </div>
      </div>

      {/* Gold Slider Bar with Hardware Acceleration */}
      {bothImagesLoaded && (
        <div className="absolute top-0 bottom-0 w-1 pointer-events-none z-20" style={sliderStyle}>
          {/* Gold gradient bar with glow */}
          <div
            className={`absolute inset-0 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 transition-shadow ${
              isDragging ? "shadow-[0_0_30px_rgba(251,191,36,0.8)]" : "shadow-[0_0_15px_rgba(251,191,36,0.5)]"
            }`}
            style={{ willChange: isDragging ? "box-shadow" : "auto" }}
          >
            {/* Top accent dot */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 shadow-lg shadow-amber-500/50"></div>
            {/* Bottom accent dot */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 shadow-lg shadow-amber-500/50"></div>
          </div>

          {/* Premium Gold Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div
              className={`w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center transition-all ${
                isDragging
                  ? "scale-110 shadow-[0_0_60px_rgba(251,191,36,0.9)]"
                  : "scale-100 shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.7)]"
              }`}
              style={{
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                willChange: isDragging ? "transform, box-shadow" : "auto",
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
      )}

      {/* Instruction Overlay - Only show when not dragging and images are loaded */}
      {!isDragging && bothImagesLoaded && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <div className="bg-gradient-to-r from-amber-300/90 via-amber-400/90 to-amber-500/90 text-black px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm shadow-lg shadow-amber-500/50 animate-pulse">
            Drag to compare
          </div>
        </div>
      )}
    </div>
  )
}
