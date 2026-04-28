import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Display"', '"Segoe UI"', "Inter", "sans-serif"],
      },
      colors: {
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        background:  "rgb(var(--background) / <alpha-value>)",
        surface:     "rgb(var(--surface)    / <alpha-value>)",
        sidebar:     "rgb(var(--sidebar)    / <alpha-value>)",
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        dark: {
          50:  "#f8f8ff",
          100: "#e8e8f0",
          200: "#c8c8d8",
          300: "#9898b0",
          400: "#6868880",
          500: "#484860",
          600: "#303048",
          700: "#1e1e30",
          800: "#14141e",
          900: "#0d0d14",
          950: "#08080e",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)",
        "gradient-card":  "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(79,70,229,0.04) 100%)",
        "gradient-glow":  "radial-gradient(ellipse at top, rgba(124,58,237,0.15) 0%, transparent 70%)",
        "dot-pattern":    "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-sm": "20px 20px",
      },
      boxShadow: {
        "glow-sm":    "0 0 12px rgba(124,58,237,0.25)",
        "glow-md":    "0 0 24px rgba(124,58,237,0.3)",
        "glow-lg":    "0 0 48px rgba(124,58,237,0.2)",
        "card":       "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        "modal":      "var(--shadow-modal)",
        "inner-top":  "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in":         "fadeIn 0.3s ease-out",
        "slide-up":        "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in":        "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right":  "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-out":       "toastOut 0.2s ease-in forwards",
        "glow-pulse":    "glowPulse 3s ease-in-out infinite",
        "count-up":      "countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer":       "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn:    { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:   { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideIn:   { from: { opacity: "0", transform: "translateX(-12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        glowPulse: { "0%,100%": { opacity: "0.4" }, "50%": { opacity: "0.8" } },
        countUp:   { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer:      { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(10px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        toastOut:     { from: { opacity: "1", transform: "translateX(0)" }, to: { opacity: "0", transform: "translateX(10px)" } },
      },
    },
  },
  plugins: [],
};

export default config;
