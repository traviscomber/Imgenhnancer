"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

type CompareSliderProps = {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  beforeAlt?: string
  afterAlt?: string
  initialPosition?: number
  className?: string
}

export function ImageComparisonHybrid({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  beforeAlt = "Before image",
  afterAlt = "After image",
  initialPosition = 50,
  className = "",
}: CompareSliderProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const updateFromClientX = (clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, next)))
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (event: PointerEvent) => {
      updateFromClientX(event.clientX)
    }

    const handleUp = () => setIsDragging(false)

    window.addEventListener("pointermove", handleMove)
    window.addEventListener("pointerup", handleUp)

    return () => {
      window.removeEventListener("pointermove", handleMove)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [isDragging])

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative overflow-hidden border border-[#6f5d49] bg-black shadow-[0_0_0_1px_rgba(198,157,96,0.12)]"
        style={{ aspectRatio: "16 / 10", touchAction: "none" }}
      >
        <div className="absolute inset-0">
          <Image src={afterImage || "/placeholder.svg"} alt={afterAlt} fill className="object-cover" priority={false} />
        </div>
        <div className="absolute inset-0" style={{ width: `${position}%` }}>
          <Image src={beforeImage || "/placeholder.svg"} alt={beforeAlt} fill className="object-cover" priority={false} />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(5,4,3,0.18),transparent_35%,transparent_65%,rgba(5,4,3,0.18))]" />

        <div className="absolute inset-y-0 z-20" style={{ left: `calc(${position}% - 1px)` }}>
          <div className="h-full w-px bg-[#e5c37b]/80" />
          <button
            type="button"
            aria-label="Image comparison slider"
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 border border-[#e5c37b]/70 bg-[#18130e] text-[#e5c37b] shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
            onPointerDown={(event) => {
              event.preventDefault()
              setIsDragging(true)
              updateFromClientX(event.clientX)
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") setPosition((current) => Math.max(0, current - 2))
              if (event.key === "ArrowRight") setPosition((current) => Math.min(100, current + 2))
            }}
          >
            <span className="sr-only">Drag to compare before and after</span>
            <span className="block text-[10px] leading-none">↔</span>
          </button>
        </div>

        <div className="absolute bottom-3 left-3 z-20 flex gap-2 text-[10px] uppercase tracking-[0.28em] text-[#f0e4d0]">
          <span className="border border-white/10 bg-black/60 px-2 py-1">{beforeLabel}</span>
          <span className="border border-white/10 bg-black/60 px-2 py-1">{afterLabel}</span>
        </div>
      </div>
    </div>
  )
}
