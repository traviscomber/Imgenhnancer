import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // True Gold Color System
        gold: {
          50: "#FFFBF0",
          100: "#FFF8DC", // Cornsilk
          200: "#F5DEB3", // Wheat
          300: "#DAA520", // Goldenrod (Primary)
          400: "#FFD700", // Gold (Bright)
          500: "#B8860B", // Dark Goldenrod
          600: "#CD853F", // Peru
          700: "#8B7355", // Dark Khaki
          800: "#6B5B73", // Dim Gray
          900: "#2F2F2F", // Very Dark Gray
          DEFAULT: "#DAA520", // Goldenrod as default
          bright: "#FFD700", // Pure Gold
          dark: "#B8860B", // Dark Goldenrod
          muted: "#CD853F", // Peru
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gold-pulse": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
            boxShadow: "0 0 10px rgba(218, 165, 32, 0.3)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05)",
            boxShadow: "0 0 20px rgba(218, 165, 32, 0.5)",
          },
        },
        "gold-shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "gold-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(218, 165, 32, 0.15)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(218, 165, 32, 0.4)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gold-pulse": "gold-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gold-shimmer": "gold-shimmer 2s infinite",
        "gold-glow": "gold-glow 3s ease-in-out infinite",
      },
      boxShadow: {
        "gold-sm": "0 1px 2px 0 rgba(218, 165, 32, 0.05)",
        gold: "0 1px 3px 0 rgba(218, 165, 32, 0.1), 0 1px 2px 0 rgba(218, 165, 32, 0.06)",
        "gold-md": "0 4px 6px -1px rgba(218, 165, 32, 0.1), 0 2px 4px -1px rgba(218, 165, 32, 0.06)",
        "gold-lg": "0 10px 15px -3px rgba(218, 165, 32, 0.1), 0 4px 6px -2px rgba(218, 165, 32, 0.05)",
        "gold-xl": "0 20px 25px -5px rgba(218, 165, 32, 0.1), 0 10px 10px -5px rgba(218, 165, 32, 0.04)",
        "gold-2xl": "0 25px 50px -12px rgba(218, 165, 32, 0.25)",
        "gold-inner": "inset 0 2px 4px 0 rgba(218, 165, 32, 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
