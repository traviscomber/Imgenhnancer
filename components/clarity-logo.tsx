"use client"

interface ClarityLogoProps {
  variant?: "white" | "black" | "gradient"
  className?: string
  width?: number
  height?: number
}

export function ClarityLogo({ className = "", width = 200, height = 60 }: ClarityLogoProps) {
  return (
    <img
      src="/images/landing/clar1ty-logo.png"
      alt="Clar1ty"
      className={className}
      width={width}
      height={height}
    />
  )
}
