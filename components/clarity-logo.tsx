"use client"

interface ClarityLogoProps {
  variant?: "white" | "black" | "gradient"
  className?: string
  width?: number
  height?: number
}

export function ClarityLogo({ variant = "gradient", className = "", width = 200, height = 60 }: ClarityLogoProps) {
  if (variant === "gradient") {
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <img
          src="/images/clarity-white.png"
          alt="Clarity"
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            WebkitMaskImage: "linear-gradient(to right, rgb(251, 191, 36), rgb(245, 158, 11))",
            maskImage: "linear-gradient(to right, rgb(251, 191, 36), rgb(245, 158, 11))",
            filter: "drop-shadow(0 0 20px rgba(251, 191, 36, 0.3)) brightness(1.2)",
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600"
          style={{
            WebkitMaskImage: "url(/images/clarity-white.png)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskImage: "url(/images/clarity-white.png)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      </div>
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
