"use client"

interface ClarityLogoProps {
  variant?: "white" | "black" | "gradient"
  className?: string
  width?: number
  height?: number
}

export function ClarityLogo({ variant = "gradient", className = "", width = 200, height = 60 }: ClarityLogoProps) {
  if (variant === "gradient" || variant === "white") {
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

  return (
    <img
      src={variant === "white" ? "/images/clarity-white.png" : "/images/clarity-black.png"}
      alt="Clarity"
      className={className}
      width={width}
      height={height}
    />
  )
}
